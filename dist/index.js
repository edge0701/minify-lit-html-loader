"use strict";
const path = require("path");
const escodegen = require("escodegen");
const esprima = require("esprima");
const estraverse = require("estraverse");
const htmlMinifier = require("html-minifier-terser");
const merge_map_1 = require("./merge-map");
const minify = htmlMinifier.minify;
function loader(contents, sourceMap) {
    const callback = this.async();
    const options = getLoaderOptions(this);
    return successLoader(this, contents, sourceMap, options, callback);
}
async function successLoader(loader, contents, inputMap, options, callback) {
    const filePath = path.normalize(loader.resourcePath);
    const { code, map: outputMapString } = await minifyLitHtml(filePath, contents, options, loader);
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
            const map = await (0, merge_map_1.default)(inputMap, outputMap);
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
async function minifyLitHtml(sourceFileName, contents, options, loader) {
    const chunks = contents.split('');
    const nodesToProcess = [];
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
    async function processNodes() {
        for (const node of nodesToProcess) {
            const mini = await minify(chunks.slice(node.quasi.range[0] + 1, node.quasi.range[1] - 1).join(''), options.htmlMinifier);
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
function getLoaderOptions(loader) {
    const loaderOptions = loader.getOptions() || {};
    const options = makeLoaderOptions(loaderOptions);
    return options;
}
function makeLoaderOptions(loaderOptions) {
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
module.exports = loader;
