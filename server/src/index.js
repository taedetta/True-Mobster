import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/game.js';
import { JWT_SECRET } from './middleware/auth.js';
import { buildPlayerState, processBotRetaliations } from './services/gameEngine.js';
import { sendChatMessage } from './services/chatEngine.js';
import { seedBots } from './db/seed.js';
import { initDatabase } from './db/index.js';
import { GAME_NAME, STUDIO } from '../../shared/gameData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3002;

const app = express();
const httpServer = createServer(app);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", 'wss:', 'ws:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
    },
  },
}));

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origin.includes('onrender.com') || origin.includes('localhost')) cb(null, true);
    else cb(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '32kb' }));
app.use(rateLimit({ windowMs: 60000, max: 150, standardHeaders: true, legacyHeaders: false }));

const actionLimiter = rateLimit({ windowMs: 1000, max: 8 });
app.use('/api/game/job', actionLimiter);
app.use('/api/game/fight', actionLimiter);
app.use('/api/game/buy', actionLimiter);

app.use('/assets/items', express.static(path.join(__dirname, '../../client/public/assets/items'), {
  maxAge: process.env.NODE_ENV === 'production' ? '30d' : 0,
  etag: true,
  immutable: process.env.NODE_ENV === 'production',
}));

app.use('/assets/ui', express.static(path.join(__dirname, '../../client/public/assets/ui'), {
  maxAge: process.env.NODE_ENV === 'production' ? '30d' : 0,
  etag: true,
  immutable: process.env.NODE_ENV === 'production',
}));

app.use('/assets/avatars', express.static(path.join(__dirname, '../../client/public/assets/avatars'), {
  maxAge: process.env.NODE_ENV === 'production' ? '30d' : 0,
  etag: true,
}));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', game: GAME_NAME, studio: STUDIO, version: '2.6.5', deployedAt: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist, { index: false }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/assets') || req.path.includes('.')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const io = new Server(httpServer, {
  cors: { origin: true, credentials: true },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Auth required'));
  try {
    socket.userId = jwt.verify(token, JWT_SECRET).sub;
    next();
  } catch { next(new Error('Invalid token')); }
});

io.on('connection', async (socket) => {
  socket.join(`player:${socket.userId}`);
  const state = await buildPlayerState(socket.userId);
  if (state?.crew?.id) socket.join(`crew:${state.crew.id}`);

  socket.on('refresh', async () => {
    const s = await buildPlayerState(socket.userId);
    if (s?.crew?.id) socket.join(`crew:${s.crew.id}`);
    socket.emit('state', s);
  });

  socket.on('chat:join', async () => {
    const s = await buildPlayerState(socket.userId);
    if (s?.crew?.id) socket.join(`crew:${s.crew.id}`);
  });

  socket.on('chat:send', async ({ channel, message }) => {
    try {
      const s = await buildPlayerState(socket.userId);
      const msg = await sendChatMessage(socket.userId, channel, message);
      if (channel === 'world') {
        io.emit('chat:message', { ...msg, channel: 'world' });
      } else if (channel === 'crew' && s?.crew?.id) {
        io.to(`crew:${s.crew.id}`).emit('chat:message', { ...msg, channel: 'crew' });
      }
    } catch (err) {
      socket.emit('chat:error', { error: err.message });
    }
  });
});

export function emitPlayerUpdate(userId) {
  buildPlayerState(userId).then((state) => {
    if (state) io.to(`player:${userId}`).emit('state', state);
  });
}

async function start() {
  await initDatabase();
  httpServer.listen(PORT, () => {
    console.log(`${GAME_NAME} v2 by ${STUDIO} — port ${PORT}`);
    console.log(process.env.DATABASE_URL ? 'PostgreSQL connected' : 'SQLite (local dev)');
  });
  seedBots().catch((err) => console.error('Bot seed error:', err));
  setInterval(() => processBotRetaliations().catch(console.error), 15000);
  setInterval(() => io.emit('tick', { time: Date.now() }), 30000);
}

start().catch((err) => { console.error('Failed to start:', err); process.exit(1); });
