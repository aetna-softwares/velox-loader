

; (function (global, factory) {
        typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        global.veloxScriptLoader = factory() ;
}(this, (function () { 'use strict';

    if(!console.debug){ console.debug = console.log ;}
    if(!console.warn){ console.warn = console.log ;}
    if(!console.error){ console.error = console.log ;}

    /**
     * This callback is displayed as part of the Requester class.
     * @callback CallbackWithError
     * @param {*} err error message if any
     * @param {*} [result] execution result
     */

    /**
     * @typedef VeloxScriptLoaderOptions
     * @type {object}
     * @property {"cdn"|"bower"|"npm"} policy policy of lib loaded : get from cdn or bower directory
     * @property {string} [bowerPath] if using bower policy, the path to bower folder 
     * @property {string} [npmPath] if using npm policy, the path to node_modules folder 
     */

    /**
     * @typedef VeloxScriptLoaderLib
     * @type {object}
     * @property {string} name name of the lib (ex: jquery)
     * @property {"js"|"css"|"json"|"plain"} type type of the lib (js or css)
     * @property {string} version version if the lib
     * @property {string} [cdn] cdn path of the lib (put $VERSION to be replaced by the version)
     * @property {string} [bowerPath] path in bower (ex : mylib/dist/lib.min.js)
     * @property {string} [npmPath] path in node_modules (ex : mylib/dist/lib.min.js)
     */

    /**
     * The Velox Script Loader
     * @class VeloxScriptLoader
     * 
     * @param {VeloxScriptLoaderOptions} [options] script loading options, if nothing given, use CDN
     */
    function VeloxScriptLoader(options) {
        this.loadedScripts = {} ;
	    this.loadingScripts = {} ;
        this.loadedCSS = {} ;
        this.loadedPlain = {} ;
        this.loadListeners = {} ;
        this.loadInProgress = 0 ;

        this.setOptions(options) ;
    }

    /**
     * set options
     * 
     * @function VeloxScriptLoader#setOptions
     * @param {VeloxScriptLoaderOptions} [options] script loading options, if nothing given, use CDN
     */
    VeloxScriptLoader.prototype.setOptions = function(options){
        this.options = options ;
        if(!this.options){
            this.options = {
                policy: "cdn",
            } ;
        }
        if(this.options.policy === "bower" && !this.options.bowerPath){
            throw "If you are using bower policy, you must give the bowerPath" ;
        }
        if(this.options.policy === "npm" && !this.options.npmPath){
            throw "If you are using npm policy, you must give the npmPath" ;
        }
        if(this.options.bowerPath && this.options.bowerPath[this.options.bowerPath.length-1] !== "/"){
            this.options.bowerPath = this.options.bowerPath+"/" ;
        }
        if(this.options.npmPath && this.options.npmPath[this.options.npmPath.length-1] !== "/"){
            this.options.npmPath = this.options.npmPath+"/" ;
        }
    } ;

    /**
     * Listen to library loading
     * 
     * @function VeloxScriptLoader#addLoadListener
     * @param {string} libName the name of the lib to listen
     * @param {CallbackWithError} listener called when the lib is loaded
     */
    VeloxScriptLoader.prototype.addLoadListener = function(libName, listener){
        if(!this.loadListeners[libName]){
            this.loadListeners[libName] = [] ;
        }
        this.loadListeners[libName].push(listener) ;
    } ;

    /**
     * Remove a listener
     * 
     * @function VeloxScriptLoader#removeLoadListener
     * @param {string} libName the name of the lib to listen
     * @param {function} listener the listener to remove
     */
    VeloxScriptLoader.prototype.removeLoadListener = function(libName, listener){
        if(this.loadListeners[libName]){
            var index = this.loadListeners[libName].indexOf(listener) ;
            this.loadListeners[libName].splice(index, 1) ;
        }
    } ;

    /**
     * emit the load event on a lib
     * 
     * @private
     */
    VeloxScriptLoader.prototype._emitLoad = function(libName, callback){
        var calls = [] ;
        if(this.loadListeners[libName]){
            this.loadListeners[libName].forEach(function(l){
                calls.push(function(cb){
                    if(l.length === 1){
                        l(cb) ;
                    }else{
                        l();
                        cb() ;
                    }
                }) ;
            }) ;
        }
        series(calls, callback) ;
    } ;

    /**
     * Load a lib file
     * 
     * Note : for CSS, the callback is called immediatly
     * 
     * @function VeloxScriptLoader#loadOneFile
     * @param {VeloxScriptLoaderLib} libDef the lib definition to load
     * @param {CallbackWithError} callback called when load is done
     */
    VeloxScriptLoader.prototype.loadOneFile = function(libDef, callback){
		if(!callback){
			callback = function(){
				console.log("LIB "+libDef.name+" LOADED") ;
			} ;
        }
        
        var url = libDef.cdn ;
        if(libDef.localPath){
            url = libDef.localPath ;
        }else if(this.options.policy === "npm"){
            url = this.options.npmPath+libDef.npmPath ;
        }else if(this.options.policy === "bower"){
            url = this.options.bowerPath+libDef.bowerPath;
        }
        url = url.replace("$VERSION", libDef.version)+"?version="+libDef.version ;

		if(libDef.type === "css"){
			if(this.loadedCSS[libDef.name]){
				return callback() ;
			}
			this.loadedCSS[libDef.name] = new Date() ;
			this.loadCss(url, libDef.name, function(){
                this._emitLoad(libDef.name, callback) ;
			}.bind(this));
		}else if(libDef.type === "json"){
            this.loadJSON(url, callback) ;
		}else if(libDef.type === "plain"){
            this.loadPlain(url, callback) ;
		}else{
			if(this.loadedScripts[libDef.name]){
				//already loaded
				return callback() ;
			}
			if(this.loadingScripts[libDef.name]){
                //currently loading, wait until loaded
                var listener = function(){
                    callback();
                    this.removeLoadListener(listener) ;
                }.bind(this) ;
                return this.addLoadListener(libDef.name, listener) ;
			}
			this.loadingScripts[libDef.name] = new Date() ;
			this.loadScript(url, function(err){
                if(err){ return callback(err) ;}
				this.loadedScripts[libDef.name] = new Date() ;
				delete this.loadingScripts[libDef.name] ;
				this._emitLoad(libDef.name, callback) ;
			}.bind(this));
		}
	}  ;


    /**
     * Load a script
     * 
     * @function VeloxScriptLoader#loadScript
     * @param {string} url the url of the script
     * @param {CallbackWithError} callback called when script is loaded
     */
    VeloxScriptLoader.loadScript = function (url, callback) {
        var script = document.createElement("script");
	    script.async = true;
	    script.type = "text/javascript";
	    script.src = url;
	    script.onload = function(_, isAbort) {
	        if (!script.readyState || "complete" === script.readyState) {
	            if (isAbort){
					callback("Script loading of URL "+url+" has been aborted") ;
	            }else{
	                callback() ;
				}
	        }
	    };
		
		script.onreadystatechange = script.onload ;
		
	    script.onerror = function () { 
			callback("Can't load library from URL "+url); 
		};
		
	    document.getElementsByTagName("head")[0].appendChild(script);
    } ;
    
    /**
     * Load a script
     * 
     * @function VeloxScriptLoader#loadScript
     * @param {string} url the url of the script
     * @param {CallbackWithError} callback called when script is loaded
     */
    VeloxScriptLoader.prototype.loadScript = function (url, callback) {
        VeloxScriptLoader.loadScript(url, callback) ;
    } ;

    /**
     * Load a JSON
     * 
     * @function VeloxScriptLoader#loadJSON
     * @param {string} url the url of the script
     * @param {CallbackWithError} callback called when script is loaded
     */
    VeloxScriptLoader.prototype.loadJSON = function (url, callback) {
        this.loadPlain(url, function(err, responseResult){
            if(err){ return callback(err) ;}
            if(responseResult){
                try{
                    responseResult = JSON.parse(responseResult) ;
                }catch(e){}
            }
            callback(null, responseResult);
        }) ;
    } ;
    
    /**
     * Load a plain file
     * 
     * @function VeloxScriptLoader#loadPlain
     * @param {string} url the url of the script
     * @param {CallbackWithError} callback called when script is loaded
     */
    VeloxScriptLoader.prototype.loadPlain = function (url, callback) {
        if(this.loadedPlain[url]){
            return callback(null, this.loadedPlain[url]) ;
        }
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onreadystatechange = (function () {
            
            if (xhr.readyState === 4){
                var responseResult = xhr.responseText ;
                if((xhr.status >= 200 && xhr.status < 300) || (xhr.status === 0 && xhr.responseText)) {
                    this.loadedPlain[url] = responseResult ;
                    callback(null, responseResult);
                } else {
                    callback(responseResult||xhr.status);
                }
            } 
        }).bind(this);
        xhr.send();
    } ;

    /**
     * Load a CSS
     * 
     * @function VeloxScriptLoader#loadCss
     * @param {string} url the url of CSS fiel
     * @param {string} [name] the name
     * @param {CallbackWithError} callback called when script is loaded
     */
    VeloxScriptLoader.prototype.loadCss = function (url, name, callback) {
        if(typeof(name) === "function"){
            callback = name;
            name = null;
        }
		var link = document.createElement("link");
	    link.rel = "stylesheet";
	    link.type = "text/css";
        link.href = url;
        if(name){
            link.id = name;
        }
		
	    document.getElementsByTagName("head")[0].appendChild(link);
		
		callback() ;
    };
    
    /**
     * Load CSS code
     * 
     * @function VeloxScriptLoader#loadCssCode
     * @param {string} code the CSS code to load
     */
    VeloxScriptLoader.prototype.loadCssCode = function (code) {
        if(!this.loadedCSS[code]){
            var head = document.getElementsByTagName('head')[0];
            var s = document.createElement('style');
            s.setAttribute('type', 'text/css');
            if (s.styleSheet) {   // IE
                s.styleSheet.cssText = code;
            } else {                // the world
                s.appendChild(document.createTextNode(code));
            }
            head.appendChild(s);
    
            this.loadedCSS[code] = new Date() ;
        }
    };
    
    
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
     * @function VeloxScriptLoader#load
	 * @param {*} libs array of libs to load
	 * @param {CallbackWithError} [callback] called when libs are loaded
	 */
	VeloxScriptLoader.prototype.load = function(libs, callback){
        if(!callback){ callback = function(){} ; }
        
		if(!Array.isArray(libs)){
			libs = [libs] ;
		}
        this.loadInProgress++ ;
        
        libs = JSON.parse(JSON.stringify(libs)) ;

		var calls = [] ;
		libs.forEach(function(l){
			calls.push(function(cb){
				this._loadFiles(l, cb) ;
			}.bind(this)) ;
		}.bind(this)) ;
		series(calls, function(err, results){
            if(err){ return callback(err) ;}
			this.loadInProgress-- ;
			callback(null, results) ;
		}.bind(this)) ;
    } ;

    /**
     * Load one or many lobs in parallel
     * 
     * @private
     * @param {VeloxScriptLoaderLib|VeloxScriptLoaderLib[]} libDef a libe to load or an array of libs to load
     * @param {CallbackWithError} callback called when libs are loaded
     */
    VeloxScriptLoader.prototype._loadFiles = function(libDef, callback){
		if(!Array.isArray(libDef)){
			libDef = [libDef] ;
		}
		var calls = [] ;
		libDef.forEach(function(l){
			calls.push(function(cb){
				this.loadOneFile(l, cb) ;
			}.bind(this)) ;
		}.bind(this)) ;
		parallel(calls, callback) ;
	}  ;
    
    /**
     * Execute many function in parallel
     * 
     * @private
     * @param {CallbackWithError[]} calls array of function to run
     * @param {CallbackWithError} callback called when all calls are done
     */
    var parallel = function(calls, callback){
        var workers = calls.length ;
        var done = false;
        var results = [] ;
        calls.forEach(function(call, i){
            if(!done){
                call(function(err, result){
                    if(err){
                        if(!done){
                            callback(err) ;
                            done = true ;
                        }
                        return;
                    }
                    results[i] = result ;
                    workers -- ;
                    if(workers === 0){
                        done = true ;
                        callback(null, results) ;
                    }
                }) ;
            }
        }) ;
    } ;

    /**
     * Execute many function in series
     * 
     * @private
     * @param {CallbackWithError[]} calls array of function to run
     * @param {CallbackWithError} callback called when all calls are done
     */
    var series = function(calls, callback){
        if(calls.length === 0){ return callback(); }
        calls = calls.slice() ;
        var results = [] ;
        var doOne = function(){
            var call = calls.shift() ;
            call(function(err, result){
                if(err){ return callback(err) ;}
                results.push(result) ;
                if(calls.length === 0){
                    callback(null, results) ;
                }else{
                    doOne() ;
                }
            }) ;
        } ;
        doOne() ;
    } ;



    return new VeloxScriptLoader();
})));

