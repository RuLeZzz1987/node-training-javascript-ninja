import test from "ava";
import { Readable } from "stream";
import { HttpRequest } from "../src/http";

const data = `OPTIONS /_private/browser/stats HTTP/1.1
Host: api.github.com
Connection: keep-alive
Pragma: no-cache
Cache-Control: no-cache
Access-Control-Request-Method: POST
Origin: https://github.com
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.88 Safari/537.36
Access-Control-Request-Headers: content-type
Accept: */*
Referer: https://github.com/istanbuljs/nyc
Accept-Encoding: gzip, deflate, sdch, br
Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4,uk;q=0.2

`.replace(/\n/, "\r\n");

test.cb("my passing test", t => {
  const reqPart1 = data.slice(0, ~~(data.length / 2));
  const reqPart2 = data.slice(reqPart1.length);

  const fakeSocket = new Readable({
    read(){}
  });
  const httpRequest = new HttpRequest(fakeSocket);

  httpRequest.on("headers", () => {
    t.end();
  });

  fakeSocket.push(reqPart1);
  fakeSocket.push(reqPart2);
});
