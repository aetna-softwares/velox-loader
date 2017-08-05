/**
 * This callback is displayed as part of the Requester class.
 * @callback CallbackWithError
 * @param {*} err error message if any
 * @param {*} [result] execution result
 */
declare type CallbackWithError = (err: any, result?: any)=>void;

/**
 * @typedef VeloxScriptLoaderOptions
 * @type {object}
 * @property {"cdn"|"bower"} policy policy of lib loaded : get from cdn or bower directory
 * @property {string} [bowerPath] if using bower policy, the path to bower folder
 */
declare type VeloxScriptLoaderOptions = {
    policy: any | any;
    bowerPath: string;
};

/**
 * @typedef VeloxScriptLoaderLib
 * @type {object}
 * @property {string} name name of the lib (ex: jquery)
 * @property {"js"|"css"} type type of the lib (js or css)
 * @property {string} version version if the lib
 * @property {string} cdn cdn path of the lib (put $VERSION to be replaced by the version)
 * @property {string} bowerPath path in bower (ex : mylib/dist/lib.min.js)
 */
declare type VeloxScriptLoaderLib = {
    name: string;
    type: any | any;
    version: string;
    cdn: string;
    bowerPath: string;
};

/**
 * The Velox Script Loader
 * @class VeloxScriptLoader
 * @param {VeloxScriptLoaderOptions} [options] script loading options, if nothing given, use CDN
 */
declare class VeloxScriptLoader {
    constructor(options?: VeloxScriptLoaderOptions);

    /**
     * set options
     * @function VeloxScriptLoader#setOptions
     * @param {VeloxScriptLoaderOptions} [options] script loading options, if nothing given, use CDN
     */
    setOptions(options?: VeloxScriptLoaderOptions): void;

    /**
     * Listen to library loading
     * @function VeloxScriptLoader#addLoadListener
     * @param {string} libName the name of the lib to listen
     * @param {CallbackWithError} listener called when the lib is loaded
     */
    addLoadListener(libName: string, listener: CallbackWithError): void;

    /**
     * Remove a listener
     * @function VeloxScriptLoader#removeLoadListener
     * @param {string} libName the name of the lib to listen
     * @param {function} listener the listener to remove
     */
    removeLoadListener(libName: string, listener: any): void;

    /**
     * Load a lib file
     * Note : for CSS, the callback is called immediatly
     * @function VeloxScriptLoader#loadOneFile
     * @param {VeloxScriptLoaderLib} libDef the lib definition to load
     * @param {CallbackWithError} callback called when load is done
     */
    loadOneFile(libDef: VeloxScriptLoaderLib, callback: CallbackWithError): void;

    /**
     * Load a script
     * @function VeloxScriptLoader#loadScript
     * @param {string} url the url of the script
     * @param {CallbackWithError} callback called when script is loaded
     */
    loadScript(url: string, callback: CallbackWithError): void;

    /**
     * Load a JSON
     * @function VeloxScriptLoader#loadJSON
     * @param {string} url the url of the script
     * @param {CallbackWithError} callback called when script is loaded
     */
    loadJSON(url: string, callback: CallbackWithError): void;

    /**
     * Load a CSS
     * @function VeloxScriptLoader#loadCss
     * @param {string} url the url of CSS fiel
     * @param {CallbackWithError} callback called when script is loaded
     */
    loadCss(url: string, callback: CallbackWithError): void;

    /**
     * Load a set of libs.
     * The function receive an array of lib to load. You can parallelize loading by giving an array of array
     * @example
     * load([
     *    lib1, //lib1 will be load first
     *    [lib2, lib3], //lib2 and lib3 will be loaded in parallel after lib1 is loaded
     *    lib4 //lib4 will be loaded after lib1, lib2 and lib3 are loaded
     * ])
     * @function VeloxScriptLoader#load
     * @param {VeloxScriptLoaderLib[]} libs array of libs to load
     * @param {CallbackWithError} [callback] called when libs are loaded
     */
    load(libs: (VeloxScriptLoaderLib)[], callback?: CallbackWithError): void;

}

