import {defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'REACT_APP_');
 return {plugins:[react()],define:{'process.env':JSON.stringify(env)},build:{outDir:'build'},server:{proxy:{'/api':'http://127.0.0.1:5000','/health':'http://127.0.0.1:5000'}},test:{globals:true,environment:'jsdom',setupFiles:['./src/setupTests.js']}};
});
