import WritableStream from "stream";
import { CLRF } from "../constants";
import stringifyHeaders from "../helpers/stringifyHeaders";

class HttpResponse extends WritableStream {

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

    const ownHeaders = stringifyHeaders(this.headers);
    this.socket.write(ownHeaders);

    const nextHeaders = stringifyHeaders(headers);
    this.socket.write(nextHeaders);

    this.wereHeadersSent = true;

  }

  _write(chunk) {
    if (!this.wereHeadersSent) {
      this.writeHead(200);
      this.wereHeadersSent = true;
    }

    this.socket.write(chunk);
  }
}

export default HttpResponse;
