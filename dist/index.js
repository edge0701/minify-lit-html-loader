"use strict";
const path = require("path");
const escodegen = require("escodegen");
const esprima = require("esprima");
const estraverse = require("estraverse");
const htmlMinifier = require("html-minifier");
const loaderUtils = require("loader-utils");
const merge_map_1 = require("./merge-map");
const minify = htmlMinifier.minify;
const webpackInstances = [];
const loaderOptionsCache = {};
function loader(contents, sourceMap) {
    const callback = this.async();
    const options = getLoaderOptions(this);
    return successLoader(this, contents, sourceMap, options, callback);
}
function successLoader(loader, contents, inputMap, options, callback) {
    const filePath = path.normalize(loader.resourcePath);
    const shouldCreateSourceMap = loader.sourceMap;
    const { code, map: outputMapString } = minifyLitHtml(filePath, contents, options, loader);
    let outputMap;
    try {
        if (outputMapString)
            outputMap = JSON.parse(outputMapString);
    }
    catch (e) {
        callback(e);
        return;
    }
    if (outputMap && outputMap.mappings) {
        if (inputMap) {
            const map = merge_map_1.default(inputMap, outputMap);
            if (map) {
                callback(null, code, map);
            }
            else {
                callback(null, code, outputMap);
            }
        }
        else {
            callback(null, code, outputMap);
        }
    }
    else {
        callback(null, contents, inputMap);
        return;
    }
}
function minifyLitHtml(sourceFileName, contents, options, loader) {
    const chunks = contents.split('');
    function transform(ast) {
        return estraverse.replace(ast, {
            enter: (node) => {
                if (node.type === 'TaggedTemplateExpression') {
                    if ((node.tag.type === 'Identifier' &&
                        node.tag.name === 'html') ||
                        (node.tag.type === 'MemberExpression' &&
                            node.tag.property.type === 'Identifier' &&
                            node.tag.property.name === 'html')) {
                        const mini = minify(chunks.slice(node.quasi.range[0] + 1, node.quasi.range[1] - 1).join(''), options.htmlMinifier);
                        return Object.assign({}, node, { quasi: Object.assign({}, node.quasi, { quasis: [
                                    {
                                        type: 'TemplateElement',
                                        value: {
                                            raw: mini,
                                        },
                                        range: [node.quasi.range[0], mini.length],
                                    },
                                ] }) });
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
function getLoaderOptions(loader) {
    const loaderOptions = loaderUtils.getOptions(loader) || {};
    const options = makeLoaderOptions(loaderOptions);
    return options;
}
function makeLoaderOptions(loaderOptions) {
    const options = Object.assign({}, loaderOptions, { esprima: Object.assign({}, loaderOptions.esprima, { loc: true, range: true, sourceType: loaderOptions.esprima ? loaderOptions.esprima.sourceType || 'module' : 'module' }), htmlMinifier: Object.assign({ caseSensitive: true, collapseWhitespace: true, minifyCSS: true, preventAttributesEscaping: true, removeComments: true }, loaderOptions.htmlMinifier) });
    return options;
}
module.exports = loader;
