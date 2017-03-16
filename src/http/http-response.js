import { Writable } from "stream";
import { CLRF } from "../constants";
import stringifyHeaders from "../helpers/stringifyHeaders";

class HttpResponse extends Writable {

  constructor(socket) {
    super();

    this.socket = socket;
    this.wereHeadersSent = false;
    this.headers = {};
  }

  setHeader(headerName, value) {
    if (this.wereHeadersSent) {
      throw Error("Headers were sent")
    }

    this.headers[headerName] = value;
  }

  writeHead(statusCode, statusMessage="", headers={}) {
    if (this.wereHeadersSent) {
      throw Error("Headers were sent")
    }

    const statusLine = `HTTP/1.1 ${statusCode} ${statusMessage}${CLRF}`;
    this.socket.write(statusLine);

    this.socket.write(`Connection: keep-alive${CLRF}Date: ${new Date().toUTCString()}${CLRF}`);

    const ownHeaders = stringifyHeaders(this.headers);
    this.socket.write(ownHeaders);

    const nextHeaders = stringifyHeaders(headers);
    this.socket.write(nextHeaders);
    this.socket.write(CLRF);

    this.wereHeadersSent = true;

  }

  _write(...args) {
    if (!this.wereHeadersSent) {
      this.writeHead(200);
      this.wereHeadersSent = true;
    }
    return this.socket.write(...args);
  }

  end(...args) {
    this.socket.end(...args);
  }
}

export default HttpResponse;
