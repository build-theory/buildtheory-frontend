import React, {useState} from 'react';
import {common, createLowlight} from 'lowlight';

const lowlight = createLowlight(common);

function textOf(node) {
  return node.type === 'text' ? node.value : (node.children || []).map(textOf).join('');
}

function highlightedLines(tree) {
  const lines = [[]];
  function walk(node, classes = []) {
    if (node.type === 'text') {
      const parts = node.value.split('\n');
      parts.forEach((part, index) => {
        if (index) lines.push([]);
        if (part) lines[lines.length - 1].push({text:part, className:classes.join(' ')});
      });
    } else {
      const names = node.properties?.className || [];
      (node.children || []).forEach(child => walk(child, [...classes, ...names]));
    }
  }
  walk(tree);
  return lines;
}

function indentColumns(line) {
  const indent = (line.match(/^[ \t]*/) || [''])[0];
  let columns = 0;
  for (const char of indent) columns = char === '\t' ? columns + 4 - columns % 4 : columns + 1;
  return columns;
}

export default function CodeBlock({node}) {
  const [copied, setCopied] = useState(false);
  const codeNode = node.children?.find(child => child.tagName === 'code');
  if (!codeNode) return <pre>{textOf(node)}</pre>;
  const code = textOf(codeNode).replace(/\n$/, '');
  const language = (codeNode.properties?.className || []).find(name => name.startsWith('language-'))?.slice(9) || '';
  let tree;
  try { tree = language && lowlight.registered(language) ? lowlight.highlight(language, code) : lowlight.highlight('plaintext', code); }
  catch { tree = {children:[{type:'text', value:code}]}; }
  const lines = highlightedLines(tree);
  const originalLines = code.split('\n');
  const indents = originalLines.filter(line => line.trim()).map(indentColumns).filter(Boolean);
  const indentStep = indents.length ? Math.min(...indents) : 4;
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { setCopied(false); }
  }
  return <div className="chat-code-block" style={{'--chat-indent-step':`${indentStep}ch`}}><div className="chat-code-head"><span>{language || 'Code'}</span><button type="button" onClick={copy} aria-label="Copy code">{copied?'Copied':'Copy'}</button></div><pre><code>{lines.map((line, index) => {
    const columns = indentColumns(originalLines[index]);
    return <span className="chat-code-line" key={index}><span aria-hidden="true" className="chat-code-guides" style={{width:`${columns}ch`}}/>{line.map((part, i)=><span className={part.className} key={i}>{part.text}</span>)}{!line.length && '\u200b'}</span>;
  })}</code></pre></div>;
}
