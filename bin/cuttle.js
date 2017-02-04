#!/usr/bin/env node

var program = require('commander');
var package = require('../package.json');
var suggest = require('../lib/main').suggest;

var color = /^(#?[0-9a-f]{3,6})$/i;

program
  .version(package.version)
  .description('Suggests transition functions between colors')
  .option('-f, --from <color>', 'input color (e.g. #ae465f)', color)
  .option('-t, --to <color>', 'output color (e.g. #aeae46)', color)
  .option('-d, --dialect <dialect>', 'dialect of output (either "sass" or "less")', /^(sass|less)$/i, 'less')
  .parse(process.argv);

if (!color.test(program.from) || !color.test(program.to)) {
    console.error('Both --from and --to colors must be specified to suggest a transition!');

    program.outputHelp();

    process.exit(1);
}

var convertSuggestion = function(s) {
    return {
        difference: s.difference,
        format: s.format
    };
}

var suggestions = suggest(program.from, program.to, program.dialect).map(convertSuggestion);

console.log(suggestions);
