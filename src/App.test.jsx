import { render, screen } from '@testing-library/react';
import App from './App';
import template from '../index.html?raw';
beforeEach(()=>{document.head.innerHTML=template.match(/<head>([\s\S]*?)<\/head>/)[1];window.history.pushState({},'','/');global.fetch=vi.fn(()=>Promise.resolve({ok:true,json:()=>Promise.resolve({early_access_enabled:false,csrf:'test'})}));window.scrollTo=vi.fn();});
test('homepage describes the actual product and links to the workspace',()=>{
 render(<App/>);
 expect(screen.getByRole('heading',{name:/Catch claim issues/})).toBeInTheDocument();
 expect(screen.getByRole('link',{name:'Try the sample case',exact:true})).toHaveAttribute('href','/app');
 expect(screen.getByText(/Currently in development/)).toBeInTheDocument();
});
test('privacy discloses external processing',()=>{
 window.history.pushState({},'', '/privacy');render(<App/>);
 expect(screen.getByRole('heading',{name:/How this beta handles data/})).toBeInTheDocument();
 expect(screen.getByText(/Live analysis and document chat send original documents/)).toBeInTheDocument();
});
