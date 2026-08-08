import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

console.log('=== DIAGNOSTIC: Server starting ===');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`DIAGNOSTIC server running on port ${PORT}`);
});

export default server;
