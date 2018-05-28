<h1 align="center">Minify lit-html Loader</h1>

<h2 align="center">Install</h2>

```bash
npm install minify-lit-html-loader
```

<h2 align="center">Usage</h2>

[Documentation: Using loaders](https://webpack.js.org/loaders/)

Within your webpack configuration object, you'll need to add the minify-lit-html-loader to the list of modules, like so:

```javascript
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'minify-lit-html-loader'
      }
    }
  ]
}
```

Or if you are using Typescript, chain it after your Typescipt loader, like so:

```javascript
module: {
  rules: [
    {
      test: /\.ts?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'minify-lit-html-loader',
        },
        {
          loader: 'ts-loader'
        },
      ]
    }
  ]
}
```

<h2 align="center">Options</h2>

Options for the `esprima` parser are:

```typescript
interface Config {
  range: boolean;
  loc: boolean;
  source: string | null;
  tokens: boolean;
  comment: boolean;
  tolerant: boolean;
  sourceType: 'module' | 'script';
}
```

`range` and `loc` will always be set to true as these are required for the operation of the loader.

Options for `html-minifier` can be found [here](https://github.com/kangax/html-minifier#options-quick-reference)

You can pass options to the loader by using the [options property](https://webpack.js.org/configuration/module/#rule-options-rule-query):

```javascript
module: {
  rules: [
    {
      test: /\.js?$/,
      exclude: /(node_modules|bower_components)/,
      use: [
        {
          loader: 'minify-lit-html-loader',
          options: {
            esprima: {
              loc: true,
            },
            htmlMinifier: {
              customAttrCollapse: /events/,
            }
          }
        },
      ],
    }
  ]
},
```

The default options for `html-minifier` are:

```javascript
htmlMinifier: {
  caseSensitive: true,
  collapseWhitespace: true,
  minifyCSS: true,
  preventAttributesEscaping: true,
  removeComments: true
}
```

<h2 align="center">Improvements</h2>

There are currently no automated tests written for the loader and it has only been tested in a very limited way.
It will be something I will be working on soon but I do welcome PRs from anyone willing to contribute to this project.