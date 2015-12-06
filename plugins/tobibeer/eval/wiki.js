/*\
title: $:/plugins/tobibeer/eval/wiki.js
type: application/javascript
module-type: wikimethod

Provides parsing for filter-like references.

@preserve
\*/
(function(){"use strict";exports.parseExpression=function(e,s){if(!s){s={}}s.vars=s.vars||{};var r=this;if(s.references){e=r.parseExpressionReferences(e,s)}$tw.utils.each(Object.keys(s.vars),function(r){var i=new RegExp("\\b"+r+"\\b","mg");e=e.replace(i,s.vars[r])});return e};exports.parseExpressionReferences=function(e,s,r){var i,n,t,a,f,c,u,d,p="",l=1,o=0,g=this;r=r===undefined?0:r++;if(r===7){throw"max stack level reached"}else{r++;l=e}do{a=u=undefined;t=e.substring(o).search(/[\{<]{1}[^\s]+/);if(t<0){p+=e.substr(o);o=e.length}else{t+=o;i=e.charAt(t);p+=e.substring(o,t);o=t+1;switch(i){case"{":a=true;t=e.indexOf("}",o);break;case"<":u=true;t=e.indexOf(">",o);break}if((a||u)&&t===-1){throw"Missing closing bracket in expression"}else{n=[];d=e.substring(o,t);o=t+1;d=d.split(";");if(d.length>1){n=d[2].split(",")}c=d[1]===undefined?0:d[1];d=d[0];f=a?g.getTextReference(d,"",s.tiddler):s.widget?s.widget.getVariable(d):"";if(n){f=n[2]?f.split(n[2])[0]:f.substr(n[0]===undefined?0:parseInt(n[0]),n[1]===undefined?n[1]:parseInt(n[1]))}if(f===""||f===undefined){f=c}p+=f}}}while(o<e.length);if(p!=l){p=g.parseExpressionReferences(p,s,r)}return p}})();