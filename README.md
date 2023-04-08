# case-convert

Tiny converter for the cases you actually use in code. Paste anything in, you get camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, Title Case, sentence case, plus dot, slash and no-space variants. Click any of them to copy.

I kept needing this and kept hitting random ad-heavy sites for it. So, one file.

## How the parsing works

Every converter is just two steps:

1. parse the input into a list of words
2. join the list back together in the target style

Step one is the only part that needs care. The boundaries the parser respects are:

- any non-alphanumeric run (space, dash, underscore, dot, slash, etc)
- a lowercase or digit followed by an uppercase, so `helloWorld` becomes `hello | World`
- a run of uppercase followed by an uppercase plus lowercase, so `HTMLParser` becomes `HTML | Parser`

That last one is the rule that makes acronyms behave. Without it `HTMLParser` would split as `H T M L Parser`, which is wrong.

After parsing, `HTMLParser_v2`, `html-parser-v2`, and `Html Parser V2` all produce the same word list, so they all convert to the same outputs.

## Cases included

camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, Title Case, sentence case, dot.case, path/case, no space.

## Running it

No build, no deps. Open the file.

```
git clone https://github.com/secanakbulut/case-convert.git
cd case-convert
open index.html
```

## Files

- `index.html` markup
- `style.css` styling
- `script.js` parser and converters

## License

PolyForm Noncommercial 1.0.0. Use it for personal stuff, do not sell it.
