import fs from "fs";
import path from "path";
import { parseRequest, httpReasonPhrases, errorCodes } from "../../../helpers";

export default (buffer, socket) => {
  const request = parseRequest(buffer.toString("utf-8"));

  global.console.log(request);

  const pathToFile = path.resolve(`./static${request.URL}`);

  const readStream = fs.createReadStream(pathToFile);

  let wasHeadWritten = false;

  readStream.on("data", data => {
    if (!wasHeadWritten) {
      socket.write(`${request.Protocol} 200 OK\r\n`);
      socket.write(`Date: ${new Date().toUTCString()}\r\n`);
      socket.write("Server: Node Javascript.Ninja\r\n");
      socket.write(`Content-Type: */*\r\n\r\n`);
      wasHeadWritten = true;
    }
    socket.write(data);
  });

  readStream.on("end", () => {
    socket.end();
  });

  readStream.on("error", e => {
    const errorCode = errorCodes[e.code];
    socket.write(`${request.Protocol} ${errorCode} ${httpReasonPhrases[errorCode]}\r\n`);
    socket.write(`Date: ${new Date().toUTCString()}\r\n`);
    socket.write("Server: Node Javascript.Ninja\r\n");
    socket.write(`Content-Type: */*\r\n`);
    socket.write("Connection: Closed");
    socket.write(`Content-Length: 0\r\n\r\n`);
    socket.end();
  });

};
