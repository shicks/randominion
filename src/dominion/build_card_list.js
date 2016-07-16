#!/usr/bin/env node

'use strict';

/**
 * @fileoverview Node script to build up a JSON array
 * from the table of card data.
 */

const fs = require('fs');
const parseArgs = require('minimist');

const USAGE = `Usage: build_cart_list.js OPTION... [--] FILE...

Options:
  -o FILE, --output=FILE    Specify output file.
  --output_wrapper=STRING   Use the given string as the output
                            wrapper.  It should contain a '%s'
                            which will get JSON substituted in.

File arguments:
  Bare file arguments are text files with card data.  The
  following syntax is recognized.

  # Comments are delimited with the hash sign.
  [[Expansion Name]]
  Card Name (Cost) Tag1 Tag2
    Card text is indented two more spaces and may flow across
    multiple lines.
  Another Card ($4) AnotherTag
    Description text.
`;

// Handle command-line arguments.
const args = parseArgs(process.argv.slice(2), {
  'string': ['output_wrapper', 'output', 'o'],
  'alias': {
    'o': 'output'
  },
  'default': {
    'output': '/dev/stdout',
    'output_wrapper': '%s',
  },
  '--': true,
  'unknown'(arg) {
    if (arg == '--help') {
      console.log(USAGE);
      process.exit(0);
    }
    if (arg[0] == '-') {
      console.error('unknown argument: ' + arg);
      console.error(USAGE);
      process.exit(2);
    }
    return true;
  },
});



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
 * @param {string} json
 * @return {!Promise<undefined>}
 */
function write(json) {
  return writeFile(args['output'], args['output_wrapper'].replace('%s', json));
}

function writeFile(file, content) {
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
  return Promise.resolve(undefined);
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
    } else if ((match = /^([^( ][^(]*)\(([^)]+)\)(.*)$/.exec(line))) {
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
  return JSON.stringify(cards);
}

readFiles([...args['_'], ...args['--']])
    .then(files => files.join('\n'))
    .then(readTable)
    .then(write)
    .then(() => {}, err => { throw err; });
