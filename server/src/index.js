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
import { seedBots } from './db/seed.js';
import { initDatabase } from './db/index.js';
import { GAME_NAME, STUDIO } from '../../shared/gameData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3002;
const CLIENT_URL = process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5173';

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [CLIENT_URL, 'http://localhost:5173', process.env.RENDER_EXTERNAL_URL].filter(Boolean);
const io = new Server(httpServer, { cors: { origin: allowedOrigins, credentials: true } });

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '32kb' }));
app.use(rateLimit({ windowMs: 60000, max: 150, standardHeaders: true, legacyHeaders: false }));

const actionLimiter = rateLimit({ windowMs: 1000, max: 8 });
app.use('/api/game/job', actionLimiter);
app.use('/api/game/fight', actionLimiter);
app.use('/api/game/buy', actionLimiter);

app.use('/assets/items', express.static(path.join(__dirname, '../../client/public/assets/items')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', game: GAME_NAME, studio: STUDIO, version: '2.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Auth required'));
  try {
    socket.userId = jwt.verify(token, JWT_SECRET).sub;
    next();
  } catch { next(new Error('Invalid token')); }
});

io.on('connection', (socket) => {
  socket.join(`player:${socket.userId}`);
  socket.on('refresh', async () => {
    const state = await buildPlayerState(socket.userId);
    socket.emit('state', state);
  });
});

export function emitPlayerUpdate(userId) {
  buildPlayerState(userId).then((state) => {
    if (state) io.to(`player:${userId}`).emit('state', state);
  });
}

async function start() {
  await initDatabase();
  await seedBots();
  setInterval(() => processBotRetaliations().catch(console.error), 15000);
  setInterval(() => io.emit('tick', { time: Date.now() }), 30000);
  httpServer.listen(PORT, () => {
    console.log(`${GAME_NAME} v2 by ${STUDIO} — port ${PORT}`);
    console.log(process.env.DATABASE_URL ? 'PostgreSQL connected' : 'SQLite (local dev)');
  });
}

start().catch((err) => { console.error('Failed to start:', err); process.exit(1); });
