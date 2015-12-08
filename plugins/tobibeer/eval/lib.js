/*\
title: $:/plugins/tobibeer/eval/lib.js
type: application/javascript
module-type: wikimethod

Provides library handling to wiki object.

@preserve
\*/
(function(){"use strict";exports.getLibrary=function(e){if(typeof e==="string"){e={config:e}}else if(typeof e!=="object"){return}var i,r,l,t=$tw.wiki,a=e.config,o=e.type,s=e.id;if(!t.libraries){t.libraries=Object.create(null);t.libraryConfigs=Object.create(null)}if(a||o){if(a){i=t.libraryConfigs[a];if(i){$tw.utils.each(i,function(e){if(!o&&!s||o===e.type&&!s||o===e.type&&s===e.id){l=t.libraries[e.type].loaded[e.id];return false}})}else{r=$tw.wiki.getTiddler(e.config);t.libraryConfigs[a]=[];JSON.parse(r?r.getFieldString("text"):"[]").map(function(e){var i,r=e.id,l=e.type;try{if(l==="js"){if(!r){e.id=r="js/eval"}i={eval:eval,type:l,id:r}}else{if(!r){e.id=r=l}if(t.getTiddler(e.require)){i=require(e.require)}else{return}}if(!t.libraries[l]){t.libraries[l]={loaded:Object.create(null),primary:r}}if(i.id==="js/eval"){i.jsWarning=true}t.libraries[l].loaded[r]=i;t.libraryConfigs[a].push(e);if(!o){o=l}}catch(s){console.log(s)}})}}if(!l){if(o){if(o&&!t.libraries[o]){console.log("No '"+o+"' library loaded for use with tobibeer/eval!")}else{l=t.libraries[o].loaded[s||t.libraries[o].primary]}}else{console.log("Could not load any library configured for tobibeer/eval!\n"+"Install tobibeer/math.js or enable js eval.")}}}return l}})();