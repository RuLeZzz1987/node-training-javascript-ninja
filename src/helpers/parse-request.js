export const parseRequest = request => {
  let result = {};
  const splittedReq = request.split("\r\n");
  const firstLine = splittedReq.shift().split(" ");
  result.Method = firstLine[0];
  result.URL = firstLine[1];
  result.Protocol = firstLine[2];
  return splittedReq.reduce(
    (resultRequest, field) => {
      if (!field) return resultRequest;
      const headerName = field.split(":", 1)[0];
      resultRequest[headerName] = field.slice(
        headerName.length + 2,
        field.length
      );

      return resultRequest;
    },
    result
  );
};
