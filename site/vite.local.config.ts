import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig({
 root:path.resolve(import.meta.dirname,'local'),
 publicDir:path.resolve(import.meta.dirname,'public'),
 plugins:[react()],
 css:{postcss:{plugins:[]}},
 server:{host:'127.0.0.1',port:5173,strictPort:true,fs:{allow:[import.meta.dirname]}},
 build:{outDir:path.resolve(import.meta.dirname,'dist/local'),emptyOutDir:true},
});
