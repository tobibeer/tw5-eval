/*\
title: $:/plugins/tobibeer/eval/filters/eval.js
type: application/javascript
module-type: filteroperator

a filter to compute and compare numbers, booleans and dates

@preserve
\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var wiki = require("$:/plugins/tobibeer/eval/lib.js"),
	lib = wiki.getLibrary("$:/plugins/tobibeer/eval/libraries");

// No math.js found or defined
if(lib && lib.jsWarning) {
	console.log("Warning eval filter: no math.js found, running in javascript eval mode!");
}

/*
The eval filter function...

operand items separated via "\"...
	vars:
		.init
			init value, define as:
				\\ init: <expression>
		.value
			result for input title
		.final
			total value up until now, define as:
				\\ final: <expression>
		.title
			current input title
		.format
			math.js output format, define as:
				\\ format: notation: "fixed", precision: 2
		.if
			outputs <value> only if(<if-value>), define as:
				\\ if:true

	{foo!bar}
		substitute text-reference
	<foo>
		substitute macro
	undef
		define undefined value via:
			{title!!field;value when undefined;substr_0,substr_len,split_before}

suffixes...
	modes prefixed $:
		$ => any, meaning: pass only those input titles where <value> is truthy
		$all => pass all input titles if there is one truthy <value>
		$val => output item values => each <value>
		$expr => output evaluated expressions per input title
		$eq => output equations as "<expr> = <value>" per input title
*/
exports.eval = function(source,operator,options) {

	var e,expr,f,l,match,mode,results,v,vars={},
		modes={not:[]},
		widget = options.widget,
		current = widget ? widget.getVariable("currentTiddler") : "",
		reVAR = /^\s*([\w\d\/]*):(.*)(?:\s*)$/,
		re$ = /^\s*\$([\w]*)(?:\s*)$/,
		wiki = options.wiki;

	// return errors
	try {
		// test for output mode (has a $)
		match = re$.exec(operator.suffix || "");
		// only one mode
		if(match && !mode) {
			// $ on it's own = "any", otherwise given value
			mode = match[1] ? match[1] : "any";
			modes[mode] = [];
		}
		// each
		$tw.utils.each(
			// operand item, split via "\"
			(operator.operand || "").split("\\"),
			function(arg) {
				// skip empty
				if(arg) {
					// test for var definition
					match = reVAR.exec(arg);
					// is var?
					if(match) {
						// store in vars as... var_name: var_expression
						vars[match[1]] = match[2];
					// otherwise, and only once
					} else if(expr === undefined) {
						// save as expression
						expr = arg;
					}
				}
			}
		);

		// Library specified?
		if(vars.lib) {
			// Parse library string as "<type> <id>"
			l = vars.lib.trim().split(" ");
			// Load library
			vars.lib = wiki.getLibrary({
				type: l[0],
				id: l[1] ? l[1] : undefined
			});
		// No library specified
		} else {
			// Use globally configured default
			vars.lib = lib;
		}
		// Do nothing without a lib
		if(!vars.lib || !vars.lib.eval) {
			throw("Error in eval filter: No suitable library configured.");
		}

		// Default: empty expression
		expr = expr || "";

		// Parse & calc vars only once, on init
		$tw.utils.each(
			Object.keys(vars),
			function(va){
				// Except for current title suffix, if, final or format
				if(["current","if","final","format","lib"].indexOf(va) < 0) {
					// Parse expression
					e = wiki.parseExpressionReferences(vars[va],{
						widget:widget,
						tiddler:current
					});
					// Eval expression value
					v = vars.lib.eval(e);
					// Store value for var, default: 0
					vars[va] = v === undefined ? 0 : v;
				}
			}
		);
		// If there is a format
		if(vars.format) {
			// And the library supports it
			if(lib.format) {
				// If it's a JSON string
				if(vars.format.indexOf(':') >= 0) {
					// Create parseable JSON
					f = ("{" + vars.format + "}")
						.replace(/[\'\"]/g, '"').replace(/(\w+):/g, '"$1":');
					// Parse it
					vars.format = JSON.parse(f);
				}
			// No format
			} else {
				// Can't use it then
				vars.format = undefined;
			}
		}

		// Init value as either 0 or specified init value
		vars.value = vars.init === undefined ? 0 : vars.init;
		//console.log(vars);

		// Anything to calc?
		if(expr || vars.value || vars.final !== undefined) {
			// Each input title
			source(function(tiddler,title) {
				// Store title
				vars.title = title;
				// Title suffix
				var t = vars.current ? vars.current.replace(/%title%/mg, vars.title) : "";
				//console.log("TITLE OUT",t);
				//console.log("PARSE VALUE ...");
				// Parse expression
				e = wiki.parseExpression(expr,{
						widget:widget,
						tiddler:title,
						vars:vars,
						title:title,
						references:true
					});
				// Calc parsed expression
				v = vars.lib.eval(e.trim());
				// Store value
				vars.value = v;

				// Format defined and output mode returns item values?
				if(vars.format && (modes.val || modes.eq)) {
					// Format value
					v = (v ? lib.format(v,vars.format) : v);
				}
				// Return item values?
				if(modes.val) {
					// Return as <value> ...plus current title suffix
					modes.val.push(v + t);
				}
				//console.log("VALUE:",v,"TITLE",title);
				// Truthy value?
				if(v) {
					// Return only those input titles for which value is truthy?
					if(modes.any) {
						// Then store this title
						modes.any.push(title);
					}
				// Falsy value
				} else {
					// Save to input titles with falsy value
					modes.not.push(title);
				}
				// Return all tids? ...if there's one where value is truthy
				if(modes.all) {
					// Add current input title
					modes.all.push(title);
				}
				// Return expressions?
				if(modes.expr) {
					// Add <expression> ...plus current title suffix
					modes.expr.push(e + t);
				}
				// Return equations?
				if(modes.eq) {
					// Add <expression> = <value> ...plus current title suffix
					modes.eq.push(e + " = " + v + t);
				}
			});
			// After all input, handle final
			if(vars.final !== undefined) {
				//console.log("PARSE FINAL ...", vars.final);
				// Evaluate final expression
				e = wiki.parseExpression(vars.final,{
					widget:widget,
					tiddler:current,
					vars:vars,
					title:"",
					references:true
				});
				//console.log("PARSED X ...", e);
				// Store final value
				vars.value = v = vars.lib.eval(e);
				//Output expressions?
				if(modes.expr) {
					// Also add final expression
					modes.expr.push(e);
				}
				// Output equations?
				if(modes.eq) {
					// Also add final equation
					modes.eq.push(e + " = " + v);
				}
			}
		// Nothing to evaluate
		} else {
			// Always return false
			vars.value = "false";
		}

		// Defined mode-suffix?
		if(mode) {
			// Take results from modes object
			results = modes[mode];
		// Otherwise
		} else {
			// Get value, formatted if specified
			v = (vars.format ? lib.format(vars.value,vars.format) : vars.value).toString();
			// Return as array of single value
			results = [v];
		}
		// Output only when condition met?
		if(vars.if !== undefined) {
			//console.log("PARSE when ...");
			// Parse condition expression
			e = wiki.parseExpression(vars.if,{
				widget:widget,
				tiddler:current,
				vars:vars,
				references:true
			});
			// Eval condition value
			v = vars.lib.eval(e);
			// If condition value is NOT the final value
			if(vars.value.toString() !== (v === undefined ? "" : v).toString()) {
				// Nothing to return
				return [];
			}
		}

	// On error...
	} catch(e) {
		return ["Error in eval filter:\n" + e];
	}

	// Return filter results
	return results;
};

})();