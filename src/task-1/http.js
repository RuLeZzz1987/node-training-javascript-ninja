import HttpServer from './http-server';

class http {

  static createServer(props){
    return new HttpServer(props);
  }

}



export default http;