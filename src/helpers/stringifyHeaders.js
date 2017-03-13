import { CLRF } from "../constants";

export default headers =>
  Object.keys(headers)
    .map(headerName => `${headerName}: ${headers[headerName]}${CLRF}`)
    .join("");
