const myHttp = require("./http").default;
const fs = require("mz/fs");
const path = require("path");

const server = myHttp.createServer();

server.on("request", (req, res) => {
  global.console.log(req.headers, req.method, req.url);

  res.setHeader("Content-Type", "application/json");
  res.writeHead(200); // Вызов writeHead опционален
  fs.createReadStream(path.resolve(`./static/index.html`)).pipe(res);
});

server.listen(3000);