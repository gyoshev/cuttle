# Cuttle

Cuttle suggests color transition functions based on provided examples.

## API Reference

### `suggest(from, to[, preprocessor])`

Suggests color functions that map from the `from` color to the `to` color.

Accepts an optional `preprocessor` parameter for the target preprocessor. Valid values are `"less"` and `"sass"`. The default is "less".

Returns an array of suggestions, sorted by difference from the target color.

Example of suggesting LESS functions:

    > cuttle.suggest("#000", "#333");
    
    [ { difference: 0, format: "lighten(@input, 20%)" } ]
    
Example of suggesting SASS functions:
    
    > cuttle.suggest("#ae465f", "#aeae46", "sass");
    
    [ { difference: 0.4477, format: "adjust-hue($input, 75)" } ]

