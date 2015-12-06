/*\
title: $:/plugins/tobibeer/eval/lib.js
type: application/javascript
module-type: wikimethod

Provides library handling to wiki object.

@preserve
\*/
(function(){"use strict";exports.getLibrary=function(i){if(typeof i==="string"){i={config:i}}else if(typeof i!=="object"){return}var e,r,t,l=$tw.wiki,a=i.config,f=i.type,s=i.id;if(!l.libraries){l.libraries=Object.create(null);l.libraryConfigs=Object.create(null)}if(a||f){if(a){e=l.libraryConfigs[a];if(e){$tw.utils.each(e,function(i){if(!f&&!s||f===i.type&&!s||f===i.type&&s===i.id){t=l.libraries[i.type].loaded[i.id];return false}})}else{r=$tw.wiki.getTiddler(i.config);l.libraryConfigs[a]=[];JSON.parse(r?r.getFieldString("text"):"[]").map(function(i){var e,r=i.id,t=i.type;try{if(t==="js"){if(!r){i.id=r="js/eval"}e={eval:eval,type:t,id:r}}else{if(!r){i.id=r=t}e=require(i.require)}if(!l.libraries[t]){l.libraries[t]={loaded:Object.create(null),primary:r}}if(e.id==="js/eval"){e.jsWarning=true}l.libraries[t].loaded[r]=e;l.libraryConfigs[a].push(i);if(!f){f=t}}catch(s){console.log(s)}})}}if(!t){if(f&&!l.libraries[f]){throw"No library of type '"+f+"' loaded!"}t=l.libraries[f].loaded[s||l.libraries[f].primary]}}return t}})();