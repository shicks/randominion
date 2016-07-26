# randominion

Randomizer for dominion games.  Runs either on Node or
in a browser (optimized for mobile).

Still not entirely clear how to bridge the CJS/polymer/web gap,
since we're going to keep all the business logic in CJS modules,
but the UI is all polymer.

## Development

### Initializing the development environment

```sh
npm install
```

### Production

```sh
npm install -g polymer-cli
polymer serve
polymer build
polymer test
```

It would be nice to package `polymer-cli` locally via `package.json`,
but it includes 200MB of dependencies, which is pretty terrible.

There's also a `Makefile`, which we should hopefully beef up
at some point.  We'll also need a `gh-pages` push script.
(Can we get `make` to keep `npm` and `bower` up to date, too?)

### TODO

Polymer doesn't have decent support for loading CSS from `*.css` files.
Consider implementing a way to use `make` and source maps to generate
the imported `*.html` file from a `*.less` and a `*.dom.html` file.
We'd also want a tool that would auto-run `make` when needed based on
inotify.  (Cf. `make -p` or `make -rp` to get the full database.)
`lessc` has options to output sourcemap, which can be referenced in
an inline CSS comment, but there seems to be problems with the
alignment, for some reason.

    lessc --source-map-less-inline --source-map-map-inline c.less c.css

NOTE: source map expects the generated line numbers for the entire
HTML file, rather than the script tag.  Thus, we need to insert a
bunch of semicolons before we embed the source map.  This is doable,
but will be a bit more of a pain.  And will be easiest without any
base64 encoding.

    <link rel="stylesheet/less" type="text/css" href="c.less" />

We could search for this sort of link tag and replace it with
the inline-source-map generated CSS.  Restrictions about showing
up exactly like this?  Only thing on a line?  ....?

Potentially it's easy to instead generate the style-module, which
will have a known number of added lines, and can then be imported
as normal.  This prevents needing the `.dom.html` file, which was
ugly as anything.

See also https://github.com/less/less.js/issues/2715 - currently
to support `@apply` we need to write

    :host {
      -:~";--mixin: {";
        prop: value;
      -:~";}";
    }

We could possibly catch this on the way in and fix it up so that
it "just works" before sending it through to `lessc`...

In any case, `vulcanize --strip` should do a fine job in stripping
these source maps (which would be bad if we needed to debug...)

For `makei` (`remake`? seems to be already taken) we should be
able to do a `make -dn $TARGET` for each given target, and then
parse the output for which dependents are checked.
