import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/game.js';
import { authMiddleware, JWT_SECRET } from './middleware/auth.js';
import jwt from 'jsonwebtoken';
import { buildPlayerState, processBotRetaliations } from './services/gameEngine.js';
import { seedBots } from './db/seed.js';
import { GAME_NAME, STUDIO } from '../../shared/gameData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3002;

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true },
});

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '16kb' }));

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
}));

const actionLimiter = rateLimit({ windowMs: 1000, max: 5 });
app.use('/api/game/job', actionLimiter);
app.use('/api/game/fight', actionLimiter);
app.use('/api/game/buy', actionLimiter);

app.use('/assets/items', express.static(path.join(__dirname, '../../client/public/assets/items')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', game: GAME_NAME, studio: STUDIO });
});

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Auth required'));
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    socket.userId = payload.sub;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  socket.join(`player:${socket.userId}`);

  socket.on('refresh', () => {
    const state = buildPlayerState(socket.userId);
    socket.emit('state', state);
  });

  socket.on('disconnect', () => {});
});

export function emitPlayerUpdate(userId) {
  const state = buildPlayerState(userId);
  if (state) io.to(`player:${userId}`).emit('state', state);
}

seedBots();
setInterval(processBotRetaliations, 15000);
setInterval(() => io.emit('tick', { time: Date.now() }), 30000);

httpServer.listen(PORT, () => {
  console.log(`${GAME_NAME} by ${STUDIO} — server running on port ${PORT}`);
  console.log('All game logic is server-authoritative. Client cannot modify stats.');
});
