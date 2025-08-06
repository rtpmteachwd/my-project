const { initializeDatabase } = require('./src/lib/db-init.js');

// Initialize database on startup
initializeDatabase().then(success => {
  if (success) {
    console.log('Database initialized successfully');
  } else {
    console.error('Database initialization failed');
    process.exit(1);
  }
});

// Export the Next.js app
const next = require('next');
const http = require('http');

const app = next({ dev: false, hostname: '0.0.0.0', port: process.env.PORT || 3000 });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handler(req, res);
  });

  server.listen(process.env.PORT || 3000, () => {
    console.log(`> Ready on http://0.0.0.0:${process.env.PORT || 3000}`);
  });
});