import EventEmitter from "events";
import net from "net";
import HttpRequest from "./http-request";
import HttpResponse from "./http-response";

class HttpServer extends EventEmitter {

  constructor(props) {
    super(props);

    this.server = net.createServer();

    this.server.on("connection", socket => {
      const req = new HttpRequest(socket);
      const res = new HttpResponse(socket);

      req.on("headers", () => {
          this.emit("request", req, res);
      });

    });
  }

  listen(port) {
    this.server.listen(port);
  }
}

export default HttpServer;
