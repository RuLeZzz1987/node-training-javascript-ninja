import HttpServer from "./http-server";

class http {
  static createServer(listener) {
    const server = new HttpServer();
    server.on("request", listener);
    return server;
  }
}

export { default as HttpRequest } from "./http-request";
export { default as HttpResponse } from "./http-response";
export { AllowedMethods as METHODS } from "../constants";
export default http;
