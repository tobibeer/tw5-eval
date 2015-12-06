/*\
title: $:/plugins/tobibeer/eval/wiki.js
type: application/javascript
module-type: wikimethod

Provides parsing for filter-like references.

@preserve
\*/
(function(){"use strict";exports.parseExpression=function(e,s){if(!s){s={}}s.vars=s.vars||{};var r=this;if(s.references){e=r.parseExpressionReferences(e,s)}$tw.utils.each(Object.keys(s.vars),function(r){var n=new RegExp("\\b"+r+"\\b","mg");e=e.replace(n,s.vars[r])});return e};exports.parseExpressionReferences=function(e,s,r){var n,i,t,a,f,c,u,d,l="",o=1,p=0,g=this;r=r===undefined?0:r++;if(r===7){throw"max stack level reached"}else{r++;o=e}do{a=u=undefined;t=e.substring(p).search(/[\{<]{2}[^\s]+/);console.log(e,p,t);if(t<0){l+=e.substr(p);p=e.length}else{t+=p;n=e.charAt(t);l+=e.substring(p,t);p=t+2;switch(n){case"{":a=true;t=e.indexOf("}}",p);break;case"<":u=true;t=e.indexOf(">>",p);break}if((a||u)&&t===-1){throw"Missing closing bracket in expression"}else{i=[];d=e.substring(p,t);p=t+2;d=d.split(";");if(d.length>1){i=d[2].split(",")}c=d[1]===undefined?0:d[1];d=d[0];f=a?g.getTextReference(d,"",s.tiddler):s.widget?s.widget.getVariable(d):"";if(i){f=i[2]?f.split(i[2])[0]:f.substr(i[0]===undefined?0:parseInt(i[0]),i[1]===undefined?i[1]:parseInt(i[1]))}if(f===""||f===undefined){f=c}l+=f}}}while(p<e.length);if(l!=o){l=g.parseExpressionReferences(l,s,r)}return l}})();