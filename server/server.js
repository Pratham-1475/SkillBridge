import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';

import authRouter from './routes/auth.js';
import freelancersRouter from './routes/freelancers.js';
import servicesRouter from './routes/services.js';
import inquiriesRouter from './routes/inquiries.js';
import aiRouter from './routes/ai.js';
import chatsRouter from './routes/chats.js';
import { connectToDatabase } from './utils/db.js';
import { isEmailConfigured } from './utils/email.js';
import { getGeminiApiKey } from './utils/gemini.js';
import { getAdminEmails } from './utils/auth.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  const readyStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  res.json({
    status: 'ok',
    service: 'skillbridge-api',
    database: {
      state: readyStates[mongoose.connection.readyState] || 'unknown',
      name: mongoose.connection.name || null,
    },
    integrations: {
      geminiConfigured: Boolean(getGeminiApiKey()),
      emailConfigured: isEmailConfigured(),
      adminConfigured: getAdminEmails().length > 0,
    },
  });
});

app.use('/api/auth', authRouter);
app.use('/api/freelancers', freelancersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/chats', chatsRouter);

app.use((error, _req, res, _next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource identifier.' });
  }

  console.error(error);
  return res.status(error.statusCode || 500).json({ message: error.message || 'Unexpected server error.' });
});

async function startServer() {
  await connectToDatabase(process.env.MONGO_URI);

  app.listen(port, () => {
    console.log(`SkillBridge API listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start SkillBridge API:', error);
  process.exit(1);
});
