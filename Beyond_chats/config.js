import dotenv from 'dotenv';

dotenv.config();

export const config = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5001/api/articles',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
};


