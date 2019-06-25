import * as path from 'path';

import * as escodegen from 'escodegen';
import * as esprima from 'esprima';
import * as estraverse from 'estraverse';
import * as htmlMinifier from 'html-minifier';
import * as loaderUtils from 'loader-utils';

import mergeSourceMap from './merge-map';

const minify = htmlMinifier.minify;

const webpackInstances: Compiler[] = [];
const loaderOptionsCache: LoaderOptionsCache = {};

/**
 * The entry point for minify-lit-html-loader
 */
function loader(this: Webpack, contents: string, sourceMap: SourceMap) {
  const callback = this.async();
  const options = getLoaderOptions(this);

  return successLoader(
    this,
    contents,
    sourceMap,
    options,
    callback,
  );
}

function successLoader(
  loader: Webpack,
  contents: string,
  inputMap: SourceMap,
  options: any, // LoaderOptions,
  callback: AsyncCallback,
) {
  const filePath = path.normalize(loader.resourcePath);
  const shouldCreateSourceMap = (loader as any).sourceMap;

  const { code, map: outputMapString } = minifyLitHtml(filePath, contents, options, loader);

  let outputMap;
  try {
    if (outputMapString)
      outputMap = JSON.parse(outputMapString);
  } catch (e) {
    callback(e);
    return;
  }

  if (outputMap && outputMap.mappings) {
    if (inputMap) {
      const map = mergeSourceMap(inputMap, outputMap);
      if (map) {
        callback(null, code, (map as any));
      } else {
        callback(null, code, outputMap);
      }
    } else {
      callback(null, code, outputMap);
    }
  } else {
    callback(null, contents, (inputMap as any));
    return;
  }
}

function minifyLitHtml(sourceFileName, contents, options, loader): { code: string, map?: string } {
  function transform(ast) {
    return estraverse.replace(ast, {
      enter: (node) => {
          if (node.type === 'TaggedTemplateExpression') {
            if ((node.tag.type === 'Identifier' &&
                node.tag.name === 'html') ||
                (node.tag.type === 'MemberExpression' &&
                node.tag.property.type === 'Identifier' &&
                node.tag.property.name === 'html')) {
                  const tempHtmlArray = [];
                  const expMap = new Map();
                  node.quasi.quasis.forEach((tempEle, index) => {
                    tempHtmlArray.push(tempEle.value.raw);
                    const exp = node.quasi.expressions[index];
                    if (exp) {
                      const id = `___${index}___`;
                      tempHtmlArray.push(id);
                      expMap.set(exp, id);
                    }
                  })
                  let mini = minify(tempHtmlArray.join(''), options.htmlMinifier);
                  expMap.forEach((id, exp) => {
                    mini = mini.replace(id, `$\{${contents.substring(exp.range[0], exp.range[1])}\}`);
                  });
              return {
                ...node,
                quasi: {
                  ...node.quasi,
                  quasis: [
                    {
                      type: 'TemplateElement',
                      value: {
                        raw: mini,
                      },
                      range: [ node.quasi.range[0], mini.length ],
                    },
                  ],
                },
              };
            }
          }
        },
        fallback: 'iteration',
    });
  }

  const ast = esprima.parse(contents, options.esprima);
  const newAst = transform(ast);

  const gen = escodegen.generate(newAst, {
    sourceMap: sourceFileName,
    sourceMapWithCode: true,
    sourceContent: contents,
  });

  return {
    code: gen.code,
    map: gen.map.toString(),
  };
}

function getLoaderOptions(loader: Webpack) {
  const loaderOptions =
    loaderUtils.getOptions<LoaderOptions>(loader) || ({} as LoaderOptions);

  // validateLoaderOptions(loaderOptions);

  const options = makeLoaderOptions(loaderOptions);

  return options;
}

function makeLoaderOptions(loaderOptions: LoaderOptions) {

  const options = {
    ...loaderOptions,
    esprima: {
      ...loaderOptions.esprima,
      loc: true,
      range: true,
      sourceType: loaderOptions.esprima ? loaderOptions.esprima.sourceType || 'module' : 'module',
    },
    htmlMinifier: {
      caseSensitive: true,
      collapseWhitespace: true,
      minifyCSS: true,
      preventAttributesEscaping: true,
      removeComments: true,
      ...loaderOptions.htmlMinifier,
    },
  };

  return options;
}

export = loader;
