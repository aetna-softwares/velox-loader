
declare module velox.loader {

    class VeloxScriptLoader extends VeloxScriptLoader__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class VeloxScriptLoader__Class  { 
    
            /**
                 * The Velox Script Loader
                 * 
                 * @constructor
                 * @param {VeloxScriptLoaderOptions} [options] script loading options, if nothing given, use CDN
                 */
            constructor(options: any /* jsdoc error */);
    
            /**
                 * set options
                 * 
                 * @param {VeloxScriptLoaderOptions} [options] script loading options, if nothing given, use CDN
                 */
            setOptions(options: any /* jsdoc error */): void;
    
            /**
                 * Listen to library loading
                 * 
                 * @param {string} libName the name of the lib to listen
                 * @param {function} listener called when the lib is loaded
                 */
            addLoadListener(libName: string, listener: function): void;
    
            /**
                 * Remove a listener
                 * 
                 * @param {string} libName the name of the lib to listen
                 * @param {function} listener the listener to remove
                 */
            removeLoadListener(libName: string, listener: function): void;
    
            /**
                 * Load a lib file
                 * 
                 * Note : for CSS, the callback is called immediatly
                 * 
                 * 
                 * @param {VeloxScriptLoaderLib} libDef the lib definition to load
                 * @param {function} callback called when load is done
                 */
            loadOneFile(libDef: VeloxScriptLoaderLib, callback: function): void;
    
            /**
                 * Load a script
                 * 
                 * @param {string} url the url of the script
                 * @param {function(Error)} callback called when script is loaded
                 */
            loadScript(url: string, callback: { (_0: Error): any /*missing*/ }): void;
    
            /**
                 * Load a JSON
                 * 
                 * @param {string} url the url of the script
                 * @param {function(Error)} callback called when script is loaded
                 */
            loadJSON(url: string, callback: { (_0: Error): any /*missing*/ }): void;
    
            /**
                 * Load a CSS
                 * 
                 * @param {string} url the url of CSS fiel
                 * @param {function(Error)} callback called when script is loaded
                 */
            loadCss(url: string, callback: { (_0: Error): any /*missing*/ }): void;
    
            /**
                 * Load a set of libs.
                 * 
                 * The function receive an array of lib to load. You can parallelize loading by giving an array of array
                 * @example
                 * load([
                 *    lib1, //lib1 will be load first
                 *    [lib2, lib3], //lib2 and lib3 will be loaded in parallel after lib1 is loaded
                 *    lib4 //lib4 will be loaded after lib1, lib2 and lib3 are loaded
                 * ])
                 * 
            	 * @param {VeloxScriptLoaderLib[]} libs array of libs to load
            	 * @param {function} [callback] called when libs are loaded
            	 */
            load(libs: VeloxScriptLoaderLib[], callback: any /* jsdoc error */): void;
    } 
    

    /**
         * Execute many function in parallel
         * 
         * @param {function(Error)[]} calls array of function to run
         * @param {function(Error)} callback called when all calls are done
         */
    function parallel(calls: { (_0: Error): any /*missing*/ }[], callback: { (_0: Error): any /*missing*/ }): void;

    /**
         * Execute many function in series
         * 
         * @param {function(Error)[]} calls array of function to run
         * @param {function(Error)} callback called when all calls are done
         */
    function series(calls: { (_0: Error): any /*missing*/ }[], callback: { (_0: Error): any /*missing*/ }): void;
}
