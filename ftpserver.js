const http = require('http');
const fs = require('fs');
const path = require('path');

const USERNAME = 'graveto';
const PASSWORD = '123';
const ROOT_PATH = 'D:\PROGRAMAS';

const server = http.createServer((req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const encodedCreds = authHeader.split(' ')[1];
    const decodedCreds = Buffer.from(encodedCreds, 'base64').toString('utf-8');
    const [username, password] = decodedCreds.split(':');

    console.log(`Received request with username: ${username} and password: ${password}`);

    if (username === USERNAME && password === PASSWORD) {
      const reqPath = decodeURI(req.url); // Decodifica a URL

      // Verifica se é uma solicitação para download de arquivo
      if (reqPath !== '/' && req.method === 'GET') {
        const filePath = path.join(ROOT_PATH, reqPath.slice(1)); // Remove a barra inicial
        const fileStream = fs.createReadStream(filePath);

        fileStream.on('error', () => {
          res.writeHead(404);
          res.end('File Not Found');
        });

        res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
        fileStream.pipe(res);
      } else {
        listFiles(ROOT_PATH, (err, files) => {
          if (err) {
            res.writeHead(500);
            res.end('Internal Server Error');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            files.forEach(file => {
              const encodedFileName = encodeURIComponent(file);
              res.write(`<a href="${encodedFileName}">${file}</a><br>`);
            });
            res.end();
          }
        });
      }
    } else {
      res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Simple FTP Server"' });
      res.end('Unauthorized');
    }
  } else {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Simple FTP Server"' });
    res.end('Unauthorized');
  }
});

const PORT = 1515;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

function listFiles(folderPath, callback) {
  const filesList = [];

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      callback(err);
    } else {
      let remaining = files.length;

      if (remaining === 0) {
        callback(null, filesList);
      }

      files.forEach(file => {
        const filePath = path.join(folderPath, file);

        fs.stat(filePath, (statErr, stats) => {
          if (statErr) {
            remaining--;
            if (remaining === 0) {
              callback(null, filesList);
            }
          } else {
            if (stats.isFile()) {
              filesList.push(file);
            } else if (stats.isDirectory()) {
              listFiles(filePath, (subErr, subFiles) => {
                filesList.push(...subFiles);
                remaining--;

                if (remaining === 0) {
                  callback(null, filesList);
                }
              });
            }
            remaining--;
            if (remaining === 0) {
              callback(null, filesList);
            }
          }
        });
      });
    }
  });
}
