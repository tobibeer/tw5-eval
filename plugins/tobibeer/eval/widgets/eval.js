/*\
title: $:/plugins/tobibeer/eval/widgets/eval.js
type: application/javascript
module-type: widget

Renders evaluated output

@preserve
\*/
(function(){"use strict";var e=require("$:/plugins/tobibeer/eval/lib.js"),t=e.getLibrary({config:"$:/plugins/tobibeer/eval/libraries"});var i=require("$:/core/modules/widgets/widget.js").widget;var r=function(e,t){this.initialise(e,t)};r.prototype=new i;r.prototype.render=function(i,r){this.parentDomNode=i;this.computeAttributes();this.execute();var n,s,d=t,u=this.document.createElement("div");this.renderChildren(u);n=(u.textContent||u.innerText).trim();if(this.library){d=e.getLibrary({type:this.library})}try{s=d.eval(n)}catch(h){if(!this.quiet&&!this.undefined){s="Unable to evaluate '"+n+"' ("+h+")."}}if(this.undefined!==undefined&&(s===undefined||s==="undefined")){s=this.undefined}var o=this.document.createTextNode(s);i.insertBefore(o,r);this.domNodes.push(o)};r.prototype.execute=function(){this.quiet=this.getAttribute("quiet",false);this.undefined=this.getAttribute("undefined");this.library=this.getAttribute("lib");this.makeChildWidgets([{type:"element",tag:"div",children:this.parseTreeNode.children}])};r.prototype.refresh=function(e){if(this.refreshChildren(e)){this.refreshSelf();return true}return false};exports.eval=r})();