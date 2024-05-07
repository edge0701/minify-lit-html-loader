import * as path from 'path';

import * as escodegen from 'escodegen';
import * as esprima from 'esprima';
import * as estraverse from 'estraverse';
import * as htmlMinifier from 'html-minifier-terser';
// import * as loaderUtils from 'loader-utils';

import mergeSourceMap from './merge-map';

const minify = htmlMinifier.minify;

// const webpackInstances: Compiler[] = [];
// const loaderOptionsCache: LoaderOptionsCache = {};

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

async function successLoader(
  loader: Webpack,
  contents: string,
  inputMap: SourceMap,
  options: any, // LoaderOptions,
  callback: AsyncCallback,
) {
  const filePath = path.normalize(loader.resourcePath);
  // const shouldCreateSourceMap = (loader as any).sourceMap;

  const { code, map: outputMapString } = await minifyLitHtml(filePath, contents, options, loader);

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
      const map = await mergeSourceMap(inputMap, outputMap);
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

async function minifyLitHtml(sourceFileName, contents, options, loader) {
  const chunks = contents.split('');
  const nodesToProcess = [];

  // Synchronously traverse to collect nodes
  function collectNodes(ast) {
      estraverse.replace(ast, {
          enter: (node) => {
              if (node.type === 'TaggedTemplateExpression' &&
                  ((node.tag.type === 'Identifier' && node.tag.name === 'html') ||
                  (node.tag.type === 'MemberExpression' && node.tag.property.type === 'Identifier' && node.tag.property.name === 'html'))) {
                  nodesToProcess.push(node);
                  return node;
              }
          },
          fallback: 'iteration',
      });
  }

  // Asynchronously minify collected nodes
  async function processNodes() {
      for (const node of nodesToProcess) {
          const mini = await minify(chunks.slice(node.quasi.range[0] + 1, node.quasi.range[1] - 1).join(''), options.htmlMinifier);
          // Mutate the node directly as it's already collected
          node.quasi.quasis = [{
              type: 'TemplateElement',
              value: { raw: mini },
              range: [node.quasi.range[0], node.quasi.range[0] + mini.length],
          }];
      }
  }

  const ast = esprima.parse(contents, options.esprima);
  collectNodes(ast);
  await processNodes();
  const gen = escodegen.generate(ast, {
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
    loader.getOptions<LoaderOptions>() || ({} as LoaderOptions);

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
