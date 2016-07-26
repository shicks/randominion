const fs = require('fs');

/**
 * @param {!Array<string>} filenames
 * @return {!Promise<!Array<string>>}
 */
exports.readFiles = (filenames) => {
  return Promise.all(
      filenames.map(file =>
        new Promise((resolve, reject) => {
          fs.readFile(file, 'utf-8', (err, data) => {
            err ? reject(err) : resolve(data);
          });
        })));
}

/**
 * @param {string} file
 * @param {string} content
 * @return {!Promise<undefined>}
 */ 
exports.writeFile = (file, content) => {
  if (file == '/dev/stdout' || file == '-') {
    console.log(content);
  } else if (file == '/dev/stderr') {
    console.error(content);
  } else {
    return new Promise((resolve, reject) => {
      fs.writeFile(
          file, content, 'utf-8',
          (err) => err ? reject(err) : resolve(undefined));
    });
  }
  return Promise.resolve();
}
