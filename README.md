# Cuttle

Ever wondered what color transformation to use to get from one color to another?

Say, `#ae465f` to `#aeae46`?

[Cuttle](http://ofcodeandcolor.com/cuttle/) got you covered.

Because that's what cephalopods do for one another.

## API Reference

### `suggest(from, to[, preprocessor])`

Suggests color functions that map from the `from` color to the `to` color.

Accepts an optional `preprocessor` parameter for the target preprocessor. Valid values are `"less"` and `"sass"`. The default is `"less"`.

Returns an array of suggestions, sorted by difference from the target color.

Example of suggesting LESS functions:

    > cuttle.suggest("#000", "#333");

    [ { difference: 0, format: "lighten(@input, 20%)" } ]

Example of suggesting SASS functions:

    > cuttle.suggest("#ae465f", "#aeae46", "sass");

    [ { difference: 0.4477, format: "adjust-hue($input, 75)" } ]


## CLI Usage

Install as a global module through `npm install -g cuttle`. Then get suggestions by running

    $ cuttle --from #ae465f --to #aeae46 --dialect sass

    [ { difference: 0.4477, format: "adjust-hue($input, 75)" } ]

Full usage options:

    Usage: cuttle [options]

    Suggests transition functions between colors

    Options:

      -h, --help               output usage information
      -V, --version            output the version number
      -f, --from <color>       input color (e.g. #ae465f)
      -t, --to <color>         output color (e.g. #aeae46)
      -d, --dialect <dialect>  dialect of output, either "sass" or "less"
