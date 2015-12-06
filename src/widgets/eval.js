/*\
title: $:/plugins/tobibeer/eval/widgets/eval.js
type: application/javascript
module-type: widget

Renders evaluated output

@preserve
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var wiki = require("$:/plugins/tobibeer/eval/lib.js"),
	lib = wiki.getLibrary({
		"config":"$:/plugins/tobibeer/eval/libraries"
	});

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var EvalWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
EvalWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
EvalWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();

	var expression, val,
		library = lib,
		el = this.document.createElement("div");
	this.renderChildren(el);
	expression = (el.textContent || el.innerText).trim();
	if(this.library) {
		library = wiki.getLibrary({"type":this.library});
	}

	try {
		val = library.eval(expression);
	} catch(e) {
		if(!this.quiet && !this.undefined) {
			val = "Unable to evaluate '" + expression + "' (" + e + ").";
		}
	}
	if(
		this.undefined !== undefined &&
		(val === undefined || val === "undefined")
	) {
		val = this.undefined;
	}

	var textNode = this.document.createTextNode(val);
	parent.insertBefore(textNode,nextSibling);
	this.domNodes.push(textNode);
};

/*
Compute the internal state of the widget
*/
EvalWidget.prototype.execute = function() {
	this.quiet = this.getAttribute("quiet",false);
	this.undefined = this.getAttribute("undefined");
	this.library = this.getAttribute("lib");
	this.makeChildWidgets([{
		type: "element",
		tag: "div",
		children: this.parseTreeNode.children
	}]);
};

/*
Selectively refresh the widget. Returns true if any children need re-rendering.
*/
EvalWidget.prototype.refresh = function(changedTiddlers) {
	if(this.refreshChildren(changedTiddlers)) {
		this.refreshSelf();
		return true;
	}
	return false;
};

exports.eval = EvalWidget;

})();
