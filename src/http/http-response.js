import { Writable } from "stream";
import { CLRF } from "../constants";
import { stringifyHeaders, mergeHeaders } from "../helpers";

class HttpResponse extends Writable {
  constructor(socket) {
    super();

    this.socket = socket;
    this.wereHeadersSent = false;
    this.headers = {
      connection: "keep-alive",
      date: new Date().toUTCString()
    };
  }

  setHeader(headerName, value) {
    if (this.wereHeadersSent) {
      throw new Error("Can't set headers after they are sent.");
    }

    this.headers[headerName.toLowerCase()] = value;
  }

  writeHead(statusCode, statusMessage = "", headers = {}) {
    if (this.wereHeadersSent) {
      throw new Error("Can't render headers after they are sent to the client");
    }

    const statusLine = `HTTP/1.1 ${statusCode} ${statusMessage}${CLRF}`;
    this.socket.write(statusLine);

    this.headers = mergeHeaders(this.headers, headers);
    this.socket.write(stringifyHeaders(this.headers));
    this.socket.write(CLRF);

    this.wereHeadersSent = true;
  }

  // noinspection JSUnusedGlobalSymbols
  _write(...args) {
    if (!this.wereHeadersSent) {
      this.writeHead(200);
      this.wereHeadersSent = true;
    }
    return this.socket.write(...args);
  }

  end(...args) {
    if (this.headers["content-length"]) {
      return args.length > 0 ? this.socket.write(...args) : true;
    }

    return this.socket.end(...args);
  }
}

export default HttpResponse;
