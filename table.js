/**
 * @fileoverview Node script to build up a JSON array
 * from the table of card data.
 */

const fs = require('fs');

/**
 * @param {!Array<string>} filenames
 * @return {!Promise<!Array<string>>}
 */
function readFiles(filenames) {
  return Promise.all(
      filenames.map(file =>
        new Promise((resolve, reject) => {
          fs.readFile(file, 'utf-8', (err, data) => {
            err ? reject(err) : resolve(data);
          });
        })));
}

/**
 * Parses a card table.
 * @param {string} table
 */
function readTable(table) {
  const cards = [];
  let expansion = '';
  let lastCard = null;
  for (let line of table.split('\n')) {
    // remove comments
    line = line.replace(/\s*(#.*)?$/, '');
    let match;
    if (!line) {
      continue;
    } else if ((match = /^\[\[([^\]]+)\]\]$/.exec(line))) {
      expansion = match[1];
    } else if ((match = /^([^(]+)\(([^)]+)\)(.*)$/.exec(line))) {
      cards.push(lastCard = {
        expansion,
        name: match[1].replace(/\s+$/, ''),
        cost: match[2],
        tags: match[3].replace(/^\s+|\s+$/g, '').split(/\s+/),
        text: [],
      });
    } else if ((match = /^  (.*?\S.*)$/.exec(line))) {
      lastCard.text.push(match[1]);
    } else {
      throw new Error('misformed line: ' + line);
    }
  }
  console.log(JSON.stringify(cards));
}

readFiles(process.argv.slice(2))
    .then(files => files.join('\n'))
    .then(readTable, err => { throw err; });
