/* Generate crawlable marketing HTML from the actual React pages; no separate landing-page copy. */
process.env.NODE_ENV = 'production';
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const root = path.resolve(__dirname, '..');
const original = require.extensions['.js'];
require.extensions['.css'] = () => {};
const compile = (module, filename) => {
 if (!filename.startsWith(path.join(root,'src'))) return original(module,filename);
 const result=babel.transformSync(fs.readFileSync(filename,'utf8'),{filename, presets:[['@babel/preset-env',{targets:{node:'current'}}],'@babel/preset-react']});
 module._compile(result.code,filename);
};
require.extensions['.js'] = compile;
require.extensions['.jsx'] = compile;
const dotenv = require('dotenv');
for (const file of ['.env.production.local','.env.local','.env.production','.env']) {
 if(fs.existsSync(path.join(root,file)))dotenv.config({path:path.join(root,file),quiet:true});
}
const React = require('react');
const {renderToString} = require('react-dom/server');
const {MemoryRouter} = require('react-router-dom');
const {Layout} = require('../src/App.jsx');
const template = fs.readFileSync(path.join(root,'build/index.html'),'utf8');
const pages={ '/contact':['Contact','Contact BuildTheory about insurance workflows, technical collaboration and early access.'], '/':['Agentic AI for insurance operations','BuildTheory connects insurance document facts with specialized AI extraction and consistency checks for human review.'], '/product':['Claim document intelligence','Explore the BuildTheory workflow for policies, bills, discharge summaries, prescriptions and test reports.'], '/technology':['Technology & architecture','Specialized document agents, provider-backed extraction, deterministic checks and human review.'], '/about':['About BuildTheory','BuildTheory is in development and preparing for private beta, starting with insurance case documents.'], '/privacy':['Privacy','How the BuildTheory beta processes documents, external model calls, session cookies and case storage.'], '/terms':['Beta terms','Assistive use, human review responsibilities and availability limits for the BuildTheory beta.'] };
for (const [route,[title,description]] of Object.entries(pages)) {
 const content=renderToString(React.createElement(MemoryRouter,{initialEntries:[route]},React.createElement(Layout)));
 let html=template.replace('<div id="root"></div>',`<div id="root">${content}</div>`)
 .replace(/<title>.*?<\/title>/,`<title>${title} | BuildTheory</title>`)
 .replace(/(<meta name="description" content=")[^"]*/,`$1${description}`)
 .replace(/(<link rel="canonical" href=")[^"]*/,`$1https://buildtheory.dev${route}`)
 .replace(/(<meta property="og:title" content=")[^"]*/,`$1${title} | BuildTheory`)
 .replace(/(<meta property="og:description" content=")[^"]*/,`$1${description}`)
 .replace(/(<meta property="og:url" content=")[^"]*/,`$1https://buildtheory.dev${route}`)
 .replace(/(<meta name="twitter:title" content=")[^"]*/,`$1${title} | BuildTheory`)
 .replace(/(<meta name="twitter:description" content=")[^"]*/,`$1${description}`);
 const directory=path.join(root,'build',route.slice(1));fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'index.html'),html);
}
console.log('Prerendered seven marketing routes from React.');
