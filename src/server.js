import http from 'http';
import { exec } from 'child_process';

// Crea un servidor HTTP
const server = http.createServer((req, res) => {
  if (req.url === '/puppeteer' && req.method === 'GET') {
    // Ejecuta tu script de Puppeteer
    exec('node src/app/researching/research-form/extractor/puppeteer/index.js --url https://music.youtube.com/channel/UCnDibivBAgWYKWi9qOiCNnA', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al ejecutar el script de Puppeteer: ${error.message}`);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Error al ejecutar el script de Puppeteer: ' + error }));
        return;
      }
      if (stderr) {
        console.error(`Error de salida estándar del script de Puppeteer: ${stderr}`);
      }

      // Define el encabezado de la respuesta como JSON
      res.setHeader('Content-Type', 'application/json');

      // Define el código de estado y el cuerpo de la respuesta
      res.statusCode = 200;
      res.end(stdout); // Devuelve la salida del script de Puppeteer como JSON
    });
  } else {
    // Si se recibe una solicitud en una ruta diferente a /puppeteer, devuelve un error 404
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
  }
});

// Escucha en el puerto 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor Node.js funcionando en el puerto ${PORT}`);
});