# randominion

Randomizer for dominion games.  Runs either on Node or
in a browser (optimized for mobile).

Still not entirely clear how to bridge the CJS/polymer/web gap,
since we're going to keep all the business logic in CJS modules,
but the UI is all polymer.

## Development

### Initializing the development environment

```sh
npm install -g polymer-cli
npm install -g bower
npm install
bower install
```

### Production

```sh
polymer serve
polymer build
polymer test
```

There's also a `Makefile`, which we should hopefully beef up
at some point.  We'll also need a `gh-pages` push script.
(Can we get `make` to keep `npm` and `bower` up to date, too?)
