import fs from "fs";
import path from "path";
import { parseRequest, httpReasonPhrases, errorCodes } from "../../../helpers";

export default (buffer, socket) => {
  const request = parseRequest(buffer.toString("utf-8"));

  global.console.log(request);

  const pathToFile = path.resolve(`./static${request.URL}`);

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
