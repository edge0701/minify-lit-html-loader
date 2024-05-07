/* Stolen from here https://github.com/TypeStrong/ts-loader/blob/master/src/interfaces.ts */

declare interface Ilolface {
  lol: boolean;
}

declare type Severity = 'error' | 'warning';

declare interface SourceMap {
  sources: any[];
  file: string;
  sourcesContent: string[];
  version: number;
  sourceRoot?: string;
  sections?: any;
}

declare interface AsyncCallback {
  (err: Error | WebpackError | null, source?: string, map?: string): void;
}

/**
 * Details here: https://webpack.github.io/docs/loaders.html#loader-context
 */
declare interface Webpack {
  getOptions<T>(): any;
  _compiler: Compiler;
  _module: WebpackModule;
  /**
   * Make this loader result cacheable. By default it’s not cacheable.
   *
   * A cacheable loader must have a deterministic result, when inputs and dependencies haven’t changed. This means the loader shouldn’t have other dependencies than specified with this.addDependency. Most loaders are deterministic and cacheable.
   */
  cacheable: () => void;
  /**
   * The directory of the module. Can be used as context for resolving other stuff.
   */
  context: string;
  /**
   * The resolved request string.
   * eg: "/abc/loader1.js?xyz!/abc/node_modules/loader2/index.js!/abc/resource.js?rrr"
   */
  request: string;
  /**
   * The query of the request for the current loader.
   */
  query: string;
  /**
   * A data object shared between the pitch and the normal phase.
   */
  data: Object;
  async: () => AsyncCallback;
  /**
   * The resource part of the request, including query.
   * eg: "/abc/resource.js?rrr"
   */
  resource: string;
  /**
   * The resource file.
   * eg: "/abc/resource.js"
   */
  resourcePath: string;
  /**
   * The query of the resource.
   * eg: "?rrr"
   */
  resourceQuery: string;
  /**
   * Resolve a request like a require expression.
   */
  resolve: (
    context: string,
    request: string,
    callback: (err: Error, result: string) => void
  ) => void;
  /**
   * Resolve a request like a require expression.
   */
  resolveSync: (context: string, request: string) => string;
  /**
   * Add a file as dependency of the loader result in order to make them watchable.
   */
  addDependency: (file: string) => void;
  /**
   * Add a directory as dependency of the loader result.
   */
  addContextDependency: (directory: string) => void;
  /**
   * Remove all dependencies of the loader result. Even initial dependencies and these of other loaders. Consider using pitch.
   */
  clearDependencies: () => void;
  /**
   * Emit a warning.
   */
  emitWarning: (message: string) => void;
  /**
   * Emit an error.
   */
  emitError: (message: string) => void;
  /**
   * Emit a file. This is webpack-specific
   */
  emitFile: (fileName: string, text: string) => void; // unused
}

declare interface Compiler {
  plugin: (name: string, callback: Function) => void;

  hooks: any; // TODO: Define this
  /**
   * The options passed to the Compiler.
   */
  options: {
    resolve: Resolve;
  };
}

declare interface WebpackError {
  module?: any;
  file?: string;
  message: string;
  location?: FileLocation;
  loaderSource: string;
}

declare type FileLocation = { line: number; character: number };

/**
 * webpack/lib/Compilation.js
 */
declare interface WebpackCompilation {
  compiler: WebpackCompiler;
  errors: WebpackError[];
  modules: WebpackModule[];
  assets: {
    [index: string]: {
      size: () => number;
      source: () => string;
    };
  };
}

/**
 * webpack/lib/Compiler.js
 */
declare interface WebpackCompiler {
  isChild(): boolean;
  context: string; // a guess
  watchFileSystem: WebpackNodeWatchFileSystem;
  /** key is filepath and value is Date as a number */
  fileTimestamps: Map<string, number>;
}

declare interface WebpackModule {
  resource: string;
  errors: WebpackError[];
  buildMeta: {
    tsLoaderFileVersion: number;
    tsLoaderDefinitionFileVersions: string[];
  };
}

declare interface Watcher {
  getTimes(): { [filePath: string]: number };
}

declare interface WebpackNodeWatchFileSystem {
  watcher?: Watcher;
  wfs?: {
    watcher: Watcher;
  };
}

declare interface Resolve {
  /** Replace modules by other modules or paths. */
  alias?: { [key: string]: string };
  /**
   * The directory (absolute path) that contains your modules.
   * May also be an array of directories.
   * This setting should be used to add individual directories to the search path.
   */
  root?: string | string[];
  /**
   * An array of directory names to be resolved to the current directory as well as its ancestors, and searched for modules.
   * This functions similarly to how node finds “node_modules” directories.
   * For example, if the value is ["mydir"], webpack will look in “./mydir”, “../mydir”, “../../mydir”, etc.
   */
  modulesDirectories?: string[];
  /**
   * A directory (or array of directories absolute paths),
   * in which webpack should look for modules that weren’t found in resolve.root or resolve.modulesDirectories.
   */
  fallback?: string | string[];
  /**
   * An array of extensions that should be used to resolve modules.
   * For example, in order to discover CoffeeScript files, your array should contain the string ".coffee".
   */
  extensions?: string[];
  /** Check these fields in the package.json for suitable files. */
  packageMains?: (string | string[])[];
  /** Check this field in the package.json for an object. Key-value-pairs are threaded as aliasing according to this spec */
  packageAlias?: (string | string[])[];
  /**
   * Enable aggressive but unsafe caching for the resolving of a part of your files.
   * Changes to cached paths may cause failure (in rare cases). An array of RegExps, only a RegExp or true (all files) is expected.
   * If the resolved path matches, it’ll be cached.
   */
  unsafeCache?: RegExp | RegExp[] | boolean;
}

declare interface ResolveSync {
  (context: string | undefined, path: string, moduleName: string): string;
}

declare interface LoaderOptionsCache {
  [name: string]: LoaderOptions;
}


declare type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface EsprimaOpts {
  range?: boolean;
  loc?: boolean;
  source?: string | null;
  tokens?: boolean;
  comment?: boolean;
  tolerant?: boolean;
  sourceType?: string;
}

interface HtmlMinifierOpts {
  caseSensitive?: boolean;
  collapseBooleanAttributes?: boolean;
  collapseInlineTagWhitespace?: boolean;
  collapseWhitespace?: boolean;
  conservativeCollapse?: boolean;
  customAttrAssign?: RegExp[];
  customAttrCollapse?: RegExp;
  customAttrSurround?: RegExp[];
  customEventAttributes?: RegExp[];
  decodeEntities?: boolean;
  html5?: boolean;
  ignoreCustomComments?: RegExp[];
  ignoreCustomFragments?: RegExp[];
  includeAutoGeneratedTags?: boolean;
  keepClosingSlash?: boolean;
  maxLineLength?: number;
  minifyCSS?: boolean;
  minifyJS?: boolean;
  minifyURLs?: boolean;
  preserveLineBreaks?: boolean;
  preventAttributesEscaping?: boolean;
  processConditionalComments?: boolean;
  processScripts?: string[];
  quoteCharacter?: '\'' | '"';
  removeAttributeQuotes?: boolean;
  removeComments?: boolean;
  removeEmptyAttributes?: boolean;
  removeEmptyElements?: boolean;
  removeOptionalTags?: boolean;
  removeRedundantAttributes?: boolean;
  removeScriptTypeAttributes?: boolean;
  removeStyleLinkTypeAttributes?: boolean;
  removeTagWhitespace?: boolean;
  sortAttributes?: boolean;
  sortClassName?: boolean;
  trimCustomFragments?: boolean;
  useShortDoctype?: boolean;
}

declare interface LoaderOptions {
  silent: boolean;
  logLevel: LogLevel;
  logInfoToStdOut: boolean;
  esprima?: EsprimaOpts,
  htmlMinifier?: HtmlMinifierOpts
}