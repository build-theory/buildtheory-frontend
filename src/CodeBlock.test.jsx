import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import ReactMarkdown from 'react-markdown';
import {describe, it, expect, vi} from 'vitest';
import CodeBlock from './CodeBlock';

describe('code responses', () => {
  it('highlights fenced code, draws indentation guides, and copies the original text', async () => {
    const copy = vi.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', {value:{writeText:copy}, configurable:true});
    const {container} = render(<ReactMarkdown components={{pre:CodeBlock}}>{'```python\ndef hello():\n    return "hello"\n```'}</ReactMarkdown>);
    expect(container.querySelector('.hljs-keyword').textContent).toBe('def');
    expect(container.querySelectorAll('.chat-code-line')[1].querySelector('.chat-code-guides').style.width).toBe('4ch');
    fireEvent.click(screen.getByRole('button', {name:'Copy code'}));
    await waitFor(() => expect(copy).toHaveBeenCalledWith('def hello():\n    return "hello"'));
  });
  it('renders unknown languages as plain text', () => {
    const {container} = render(<ReactMarkdown components={{pre:CodeBlock}}>{'```mystery\n  plain text\n```'}</ReactMarkdown>);
    expect(container.querySelector('code').textContent).toContain('  plain text');
  });
});
