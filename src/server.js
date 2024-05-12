import http from 'http';
import { exec } from 'child_process';

function getURLObject(url){
  let endpoint = url.includes('?') ? url.split('?')?.[0].replace('http://localhost:3000', '') || null : url;
  let params = url.includes('?') ? url.split('?')?.[1] || null : null;
  params = params ? params.split('&').reduce((res, param) => ({ ...res, [param.split('=')[0]]: param.split('=')[1] }), {}) : null;
  return { url, endpoint, params };
}

// HTTP Server
const server = http.createServer((req, res) => {
  const request = getURLObject(req.url);
  /* ---------------------------------------------------------------------------------------------- */
  /* /PUPPETEER/YOUTUBEMUSIC -----------------------------------------------------------------------*/
  /* ---------------------------------------------------------------------------------------------- */
  if (request.endpoint === '/puppeteer/youtubemusic' && req.method === 'GET') {
    var args = '';
    if(request.params.url){
      args = `--url ${request.params.url}`;
    } else if(request.params.id){
      args = `--url https://music.youtube.com/channel/${request.params.id}`;
    } else if(request.params.band){
      args = `--band ${request.params.band}`;
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Parámetros no válidos', request }));
    }
    exec(`node src/app/researching/research-form/extractor/puppeteer/youtube-music/index.js ${args}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al ejecutar el script: ${error.message}`);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Error al ejecutar el script: ' + error }));
        return;
      }
      if (stderr) {
        console.error(`Error de salida estándar del script: ${stderr}`);
      }
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(stdout);
    });
  /* ---------------------------------------------------------------------------------------------- */
  /* /PUPPETEER/SETLISTFM --------------------------------------------------------------------------*/
  /* ---------------------------------------------------------------------------------------------- */
  } if (request.endpoint === '/puppeteer/setlistfm' && req.method === 'GET') {
    var args = '';
    if(request.params.url){
      args = `--url ${request.params.url}`;
    } else if(request.params.id){
      args = `--id ${request.params.id}`;
    } else if(request.params.band){
      args = `--band ${request.params.band}`;
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Parámetros no válidos', request }));
    }
    exec(`node src/app/researching/research-form/extractor/puppeteer/setlist-fm/index.js ${args}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al ejecutar el script: ${error.message}`);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Error al ejecutar el script: ' + error }));
        return;
      }
      if (stderr) {
        console.error(`Error de salida estándar del script: ${stderr}`);
      }
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(stdout);
    });
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Ruta no encontrada', request }));
  }
});

// Port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor Node.js funcionando en el puerto ${PORT}`);
});