import path from 'path';

export default (jsFileName) => {
  // return path.basename(jsFileName).replace('.js', '.log');
  return path.basename(jsFileName).replace('.js', '.log');
}
