export default (own, next) => Object.keys(next).length === 0
  ? own
  : Object.keys(next).reduce(
      (headers, headerName) => {
        headers[headerName.toLowerCase()] = next[headerName];
        return headers;
      },
    Object.assign({}, own)
    );
