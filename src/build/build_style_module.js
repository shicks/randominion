#!/usr/bin/env node

'use strict';

/**
 * @fileoverview Node script to build a polymer style
 * module from a *.less file.  The built module can
 * include source maps, etc.
 */

const {readFiles, writeFile} = require('./common');
const less = require('less');
const parseArgs = require('minimist');

const USAGE = `Usage: build_style_module.js OPTION... [--] FILE

Options:
  --id=NAME                 ID to give to the style module.
  --[no]embed-source-map    Whether to embed the sourcemap.
  -o FILE, --output=FILE    Specify output file.
`;

// Run the whole process
function main(args) {
  const [file, ...rest] = [...args['_'], ...args['--']];
  if (rest.length || !file) {
    console.error(
        !file ? 'missing file' : 'too many arguments: ' + rest.join(' '));
    console.error(USAGE);
    process.exit(2);
  }

  readFiles([file])
      .then(([contents]) => render(file, contents))
      .then(module => writeFile(args['output'], module));
}

const args = parseArgs(process.argv.slice(2), {
  'string': ['output', 'o', 'id'],
  'boolean': ['embed-source-map'],
  'alias': {
    'o': 'output'
  },
  'default': {
    'output': '/dev/stdout',
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

function render(filename, contents) {
  // Fix "--foo: {" lines so that less can handle them.
  // NOTE: we do not do this particularly robustly.
  // Indentation matters.
  let search = undefined;
  contents = contents.split('\n')
      .map(line => {
        line = line.replace(/\n$/, '');
        const match = /^(\s*)(--[-a-z]+: \{)$/.exec(line);
        if (match) {
          line = match[1] + '-:~";' + match[2] + '";';
          search = match[1] + '};';
        } else if (line == search) {
          line = search.replace('};', '-:~";}";');
          search = null;
        }
        return line + '\n';
      })
      .join('');

  const id = args['id'] || (() => {
    return filename.replace(/^.*\//, '').replace(/.less$/, '-style');
  })();

  return less.render(contents, {
    // paths: dirname(filename), ???
    filename,
    sourceMap: args['embed-source-map'] ? {} : null,
  }).then(({css, map}) => {
    css = css.replace(/-: ;/g, '').replace(/\{;/g, '{');
    if (map) {
      const json = JSON.parse(map);
      json['mappings'] = ';' + json['mappings'];
      json['sourceContent'] = [contents];
      map = encodeURI(JSON.stringify(json));
      css += '\n\n/*# sourceMappingURL=data:,' + map + '*/\n';
    }
    // TODO - provide a default id based on filename?!?
    return `<dom-module id="${id}"><template><style>
${css}
</style></template></dom-module>`;
  });
}

main(args);
