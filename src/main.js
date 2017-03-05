import net from "net";
import fs from "fs";
import path from "path";
import { parseRequest, httpReasonPhrases, errorCodes } from "./helpers";

fs.chmodSync(path.resolve(`./static/baz.html`), "000");
console.log("Permissions to ./static/baz.html was set to 000.");

const server = net.createServer();
const PORT = process.env.PORT || 3000;

server.on("connection", socket => {
  let buffer = Buffer.alloc(0);

  socket.on("data", data => {
    buffer = Buffer.concat([buffer, data]);
    const stringifiedData = buffer.toString("utf-8");

    if (stringifiedData.includes("\r\n\r\n")) {
      const request = parseRequest(stringifiedData);

      console.log(request);

      if (request.URL.lastIndexOf("/") < request.URL.lastIndexOf(".")) {
        const fileName = request.URL.slice(
          request.URL.lastIndexOf("/") + 1,
          request.URL.length
        );

        const pathToFile = path.resolve(`./static/${fileName}`);

        fs.readFile(pathToFile, (err, fileData) => {
          socket.write(`${request.Protocol} `);
          if (err) {
            const errorCode = errorCodes[err.code];
            socket.write(`${errorCode} ${httpReasonPhrases[errorCode]}`);
          }
          socket.write("\r\n");
          socket.write(`Date: ${new Date().toUTCString()}\r\n`);
          socket.write("Server: Node Javascript.Ninja\r\n");
          socket.write(`Content-Type: */*\r\n`);

          if (!err) {
            socket.write(`Content-Length: ${fileData.length}\r\n\r\n`);
            socket.write(fileData);
          } else {
            socket.write("Connection: Closed");
            socket.write(`Content-Length: 0\r\n\r\n`);
          }
          socket.end();
        });
      }
    }
  });

  socket.on("error", err => {
    console.log(err);
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
