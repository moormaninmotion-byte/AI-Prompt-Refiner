// index.js
const http = require('http');

const hostname = '0.0.0.0'; // Important: listen on all network interfaces
const port = process.env.PORT || 8080; // Cloud Run sets the PORT env variable

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello from Cloud Run!\n');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
