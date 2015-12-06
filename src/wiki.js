/*\
title: $:/plugins/tobibeer/eval/wiki.js
type: application/javascript
module-type: wikimethod

Provides parsing for filter-like references.

@preserve
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*

A function to the wiki object parsing an expression so as to substitute variables with values specified in the vars object contained in the options object as:

options = {
	vars: {
		<varName>: <varValue>
	}
}
*/
exports.parseExpression = function(expr,options) {
	//console.log("UN_PARSED_EXPRESSION:\nexpr='"+expr+"' \ncurrent='"+options.tiddler+"' \ntitle='"+options.title+"' \nx='"+options.x+"\n",options.vars,"\n",options.widget);
	// No options defined?
	if(!options) {
		// Create empty options object
		options = {};
	}
	// Fetch variables from options or init as empty object
	options.vars = options.vars || {};
	// Store reference to wiki
	var wiki = this;

	// Parse for references / macros?
	if(options.references) {
		//console.log("BEFORE_REFERENCES_REPLACED=",expr);
		// Do parse...
		expr = wiki.parseExpressionReferences(expr,options);
		//console.log("AFTER_REFERENCES_REPLACED=",expr);
	}
	// Each...
	$tw.utils.each(
		// Defined variable in options
		Object.keys(options.vars),
		function (v) {
			// Replace variable as word...
			var r = new RegExp("\\b" + v + "\\b", "mg");
			// With currents variable value
			expr = expr.replace(r, options.vars[v]);
		}
	);
	//console.log("AFTER_VARS_REPLACED=", expr);
	// Return parsed expression
	return expr;
};

/*
A function to the wiki object parsing an expression so as to substitute {text!!refernces} or <macros>.
*/
exports.parseExpressionReferences = function(expr,options,stack) {
	var bracket,n,nextBracketPos,r,text,undef,v,what,
		e = "",was = 1,p = 0,wiki = this;

	// Recursively replace
	stack = stack === undefined ? 0 : stack++;
	//console.log("UNPARSED_REFERENCES=",expr,"\nstack:",stack);

	// At most seven times
	if(stack === 7) {
		throw("max stack level reached");
	// Next stack-level
	} else {
		stack++;
		// Remember last expression
		was = expr;
	}

	// Look for text references or variables
	do {
		// Reset current reference or variable
		r = v = undefined;
		// Find opening bracket, either { or <
		nextBracketPos = expr.substring(p).search(/[\{<]{2}[^\s]+/);
		console.log(expr,p,nextBracketPos);
		// None, found
		if(nextBracketPos < 0) {
			// Return expression as is
			e += expr.substr(p);
			p = expr.length;
		// Found opening { or <
		} else {
			// Move pointer
			nextBracketPos += p;
			// Bracket type
			bracket = expr.charAt(nextBracketPos);
			// Add anything before that as literal
			e += expr.substring(p,nextBracketPos);
			// Move past bracket
			p = nextBracketPos + 2;
			// Depending on bracket type
			switch (bracket) {
				case "{":
					// As text reference
					r = true;
					// Find matching closing bracket
					nextBracketPos = expr.indexOf("}}",p);
					break;
				case "<":
					// As variable
					v = true;
					// Find matching closing bracket
					nextBracketPos = expr.indexOf(">>",p);
					break;
			}
			// No closing bracket for opening bracket of a reference or variable?
			if((r || v) && nextBracketPos === -1) {
				throw "Missing closing bracket in expression";
			// Proceed
			} else {
				n = [];
				// The reference
				what = expr.substring(p,nextBracketPos);
				// Move pointer past closing bracket
				p = nextBracketPos + 2;
				// Split reference by semi-colon
				what = what.split(";");
				// Any options?
				if(what.length > 1) {
					// Split second option element by comma
					n = what[2].split(",");
				}
				// Any "undefined" value for reference? => take that or zero
				undef = what[1] === undefined ? 0 : what[1];
				// Actual reference
				what = what[0];
				// Get reference as either
				text = r ?
					// Text reference
					wiki.getTextReference(what,"",options.tiddler) :
					// Vartiable
					options.widget ? options.widget.getVariable(what) : "";
				// Any options?
				if(n) {
					// Get string before split characters?
					text = n[2] ?
						// Take those
						text.split(n[2])[0] :
						// Otherwise calculate substring
						text.substr(
							n[0] === undefined ? 0 : parseInt(n[0]) ,
							n[1] === undefined ? n[1] : parseInt(n[1])
					);
				}
				// No text for reference?
				if(text === "" || text === undefined) {
					// Set to undefined value
					text = undef;
				}
				// Add to return expression
				e += text;
			}
		}
	// While there is more to process
	} while(p < expr.length);

	// Did we replace anything?
	if(e != was) {
		// Start over, next stack-level
		e = wiki.parseExpressionReferences(e, options, stack);
	}

	//console.log("PARSED_REFERENCES=",e);
	// Return replaced expression
	return e;
};

})();