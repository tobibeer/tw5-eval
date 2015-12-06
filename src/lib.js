/*\
title: $:/plugins/tobibeer/eval/lib.js
type: application/javascript
module-type: wikimethod

Provides library handling to wiki object.

@preserve
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.getLibrary = function(options) {
	// If options as string
	if(typeof options === "string") {
		// Interpret as config
		options = {"config": options};
	// Otherwise, if no options object
	} else if (typeof options !== "object") {
		// No library
		return;
	}
	var cached, config, lib,
		wiki = $tw.wiki,
		c = options.config,
		t = options.type,
		id = options.id;

	// Global index not created yet?
	if(!wiki.libraries) {
		// Create library index
		wiki.libraries = Object.create(null);
		// Create config index
		wiki.libraryConfigs = Object.create(null);
	}

	// Need either a config or at least a specified library type
	if (c || t) {
		// Config specified?
		if (c) {
			// Get cached config
			cached = wiki.libraryConfigs[c];
			// Cache exists?
			if(cached) {
				// Loop indexed libs in cache
				$tw.utils.each(cached, function(def) {
					// When...
					if(
						// Neither type nor id specified
						!t && !id ||
						// Matching type w/o specified id
						t === def.type && !id ||
						// Both type and id specified and matching
						t === def.type && id === def.id
					) {
						// Found a library
						lib = wiki.libraries[def.type].loaded[def.id];
						// Stop looping
						return false;
					}
				});
			// Parse and cache all configured libraries
			} else {
				// Get config tiddler
				config = $tw.wiki.getTiddler(options.config);
				// Create cache object
				wiki.libraryConfigs[c] = [];
				// Parse library config as JSON and load all libraries
				JSON.parse(config ? config.getFieldString("text") : "[]").map(
					// Each library definition
					function(def) {
						var l,
							idd = def.id,
							type = def.type;
						try {
							// Native js?
							if(type === "js") {
								// Specifying an id is supefluous
								if(!idd) {
									// So, set a default
									def.id = idd = "js/eval";
								}
								// Define lib as native eval
								l = {
										"eval": eval,
										"type": type,
										"id": idd
								};
							// Otherwise
							} else {
								// No id defined?
								if(!idd) {
									// Use type as id
									def.id = idd = type;
								}
								// Load lib via require
								l = require(def.require);
							}
							// No libraries for type registered yet?
							if (!wiki.libraries[type]) {
								// Create type object
								wiki.libraries[type] = {
									loaded: Object.create(null),
									primary: idd
								};
							}
							// If
							if (
								// We use native js eval as a library
								l.id === "js/eval"
							) {
								// Store warning flag for library
								l.jsWarning = true;
							}
							// Add to registered libraries for type
							wiki.libraries[type].loaded[idd] = l;
							// Only cache those libs in a config that successfully loaded
							wiki.libraryConfigs[c].push(def);
							// No type defined?
							if(!t) {
								// Take type of first lib of config successfully loaded
								t = type;
							}
						} catch (e) {
							console.log(e);
						}
					}
				);
			}
		}

		// No cached lib retrieved yet...
		if (!lib) {
			// Type specified but never indexed
			if(t && !wiki.libraries[t]) {
				throw "No library of type '" + t + "' loaded!";
			}
			// Fetch lib from index
			lib = wiki.libraries[t].loaded[
				// Of specified id, otherwise first indexed for type
				id || wiki.libraries[t].primary
		  	];
		}
	}
	return lib;
};

})();