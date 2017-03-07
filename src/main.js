import net from "net";
import fs from "fs";
import path from "path";
import handleRequest from "./services/task-0/using-readfile";

fs.chmodSync(path.resolve(`./static/baz.html`), "000");
global.console.log("Permissions to ./static/baz.html was set to 000.");

const server = net.createServer();
const PORT = process.env.PORT || 3000;

server.on("connection", socket => {
  let buffer = Buffer.alloc(0);

  socket.on("data", data => {
    buffer = Buffer.concat([buffer, data]);

    if (buffer.includes("\r\n\r\n")) {
      handleRequest(buffer, socket);
    }
  });

  socket.on("error", err => {
    global.console.error(err);
  });
});

server.listen(PORT, () => {
  global.console.log(`Server started on port: ${PORT}`);
});
