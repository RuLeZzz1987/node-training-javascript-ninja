import { Readable } from "stream";
import { CLRF, AllowedMethods } from "../constants";

class HttpRequest extends Readable {
  constructor(socket) {
    super();

    this.client = socket;
    this.socket = socket;
    this.rawHeaders = [];
    this.headers = {};
    this.statusCode = null;
    this.statusMessage = null;
    this.readable = true;

    let unpushedData = [];
    let areHeadersReceived = false;
    let headersBuffer = Buffer.alloc(0);
    const onData = data => {
      if (areHeadersReceived) {
        unpushedData = unpushedData.concat(data);
        this.socket.pause();
        setTimeout(
          () => {
            this.push(Buffer.concat(unpushedData));
            unpushedData = [];
          },
          0
        );
      } else {
        headersBuffer = Buffer.concat([headersBuffer, data]);
        if (headersBuffer.includes(`${CLRF}${CLRF}`)) {
          const headersLastIdx = headersBuffer.indexOf(`${CLRF}${CLRF}`) + 4;
          const headersData = headersBuffer.slice(0, headersLastIdx);
          this._processHeaders(headersData);
          this.socket.unshift(headersBuffer.slice(headersLastIdx));
          this.socket.pause();
          areHeadersReceived = true;
          this.emit("headers");
        }
      }
    };

    /** close socket if HTTP method not allowed or invalid */
    this.socket.on("readable", () => {
      const chunk = this.socket.read(7);
      if (chunk) {
        const method = chunk.toString("utf8").split(" ", 1)[0];
        if (!AllowedMethods.includes(method)) {
          this.socket.end();
          return;
        }
        this.socket.unshift(chunk);
        this.socket.removeListener("readable", ()=>{});
        this.socket.on("data", onData);
      }
    });
  }

  _processHeaders(buffer) {
    const stringified = buffer.toString("utf-8");
    const rawHeaders = stringified.split(CLRF);
    const requestLine = rawHeaders.shift().split(" ");
    this.method = requestLine[0];
    this.url = requestLine[1];
    this.httpVersion = requestLine[2].split("/")[1];
    this.rawHeaders = rawHeaders.reduce(
      (headers, raw) => {
        const splitted = raw.split(/:(.+)/).filter(el => !!el);
        headers.push(...splitted);
        return headers;
      },
      []
    );
    this.httpVersionMajor = +this.httpVersion.split(".")[0];
    this.httpVersionMinor = +this.httpVersion.split(".")[1];
    for (let i = 0; i < this.rawHeaders.length; i += 2) {
      this.headers[this.rawHeaders[i].toLowerCase()] = this.rawHeaders[i + 1].trim();
    }
  }

  // noinspection JSUnusedGlobalSymbols
  _read() {
    this.socket.resume();
  }
}

export default HttpRequest;
