const myHttp = require("./http").default;
const fs = require("mz/fs");
const path = require("path");
const ErrorCodes = require("./constants").ErrorCodes;
const Reasons = require("./constants").HttpReasonPhrases;

const server = myHttp.createServer();

server.on("request", (req, res) => {
  global.console.log(req.headers, req.method, req.url);

  const filePath = req.url === "/" ? "index.html" : req.url;

  res.setHeader("Content-Type", "text/html");
  res.setHeader("Date", new Date(-1).toUTCString());
  res.setHeader("Connection", "keep-alive");
  fs.stat(path.resolve(`./static/${filePath}`))
    .then(stat=>{
      res.setHeader("Content-Length", stat.size);
      res.writeHead(200); // Вызов writeHead опционален
      fs.createReadStream(path.resolve(`./static/${filePath}`)).pipe(res);
    })
    .catch(e=>{
      const responseErrorStatusCode = ErrorCodes[e.code];
      res.setHeader("Content-Length", 0);
      res.writeHead(responseErrorStatusCode, Reasons[responseErrorStatusCode]);
      res.end();
    })

});

server.listen(process.env.PORT || 3000);
