import js from '@eslint/js';
import globals from 'globals';
export default [{ignores:['build/**','legacy/**','node_modules/**']},js.configs.recommended,{files:['src/**/*.{js,jsx}'],languageOptions:{globals:{...globals.browser,...globals.node,...globals.vitest,vi:'readonly',test:'readonly',expect:'readonly',beforeEach:'readonly'},parserOptions:{ecmaFeatures:{jsx:true}}},rules:{'no-unused-vars':['error',{varsIgnorePattern:'^[A-Z]',argsIgnorePattern:'^_'}]}}];
