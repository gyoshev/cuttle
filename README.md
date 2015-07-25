# Cuttle

Cuttle suggests color transition functions based on provided examples.

## API Reference

### `suggest(from, to)`

Suggests color functions that map from the `from` color to the `to` color. Returns an array of suggestions, sorted by difference from the target color.

    var suggestions = cuttle.suggest("#000", "#333");

    // suggestions = [
    //    { difference: 0, format: "lighten(@input, 20%)" }
    // ]

