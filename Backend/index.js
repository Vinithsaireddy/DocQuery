const app = require('./server');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');

app.listen(PORT, () => {
  console.log(`\n  DocQuery Backend`);
  console.log(`  ───────────────`);
  console.log(`  Environment : ${NODE_ENV}`);
  console.log(`  URL         : http://localhost:${PORT}`);
  console.log(`  AI Service  : ${AI_SERVICE_URL}`);
  console.log(`  CORS Origin : ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`\n  Server is ready!\n`);
});
