import ReadableStream from "stream";
import { CLRF } from '../constants';

class HttpRequest extends ReadableStream {

  constructor(socket) {
    super();

    this.socket = socket;

    this.unpushedData = [];
    this.headersBuffer = Buffer.alloc(0);
    this.areHeadersReceived = false;

    this.socket.on("data", data => {
      if (this.areHeadersReceived) {
        this.unpushedData = this.unpushedData.concat(data);
        this.socket.pause();
        setTimeout(() => {
          this.push(Buffer.concat(this.unpushedData));
          this.unpushedData = [];
        }, 0)
      } else {
        this.headersBuffer = Buffer.concat([this.headersBuffer, data]);
        if (this.headersBuffer.includes(`${CLRF}${CLRF}`)) {
          const headersLastIdx = this.headersBuffer.indexOf(`${CLRF}${CLRF}`) + 4;
          const headersData = this.headersBuffer.slice(0, headersLastIdx);
          // eslint-disable-next-line no-underscore-dangle
          this._processHeaders(headersData);
          this.socket.unshift(this.headersBuffer.slice(headersLastIdx));
          this.socket.pause();
          this.areHeadersReceived = true;
          this.emit("headers");
        }
      }
    });
  }

  _processHeaders(buffer) {
    const stringified = buffer.toString("utf-8");
    const splittedHeaders = stringified.split(CLRF);
    const requestLine = splittedHeaders.shift().split(" ");
    this.method = requestLine[0];
    this.url = requestLine[1];
    this.protocol = requestLine[2];
    this.headers = splittedHeaders.reduce(
      (resultRequest, field) => {
        if (!field) return resultRequest;
        const headerName = field.split(":", 1)[0];
        // eslint-disable-next-line no-param-reassign
        resultRequest[headerName] = field.slice(
          headerName.length + 2,
          field.length
        );

        return resultRequest;
      },
      {}
    );
  }

  _read() {
    this.socket.resume();
  }
}

export default HttpRequest;
