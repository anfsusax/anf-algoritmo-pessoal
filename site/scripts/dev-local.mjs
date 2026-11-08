import { watch } from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const site=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let timer;
const watcher=watch(path.resolve(site,'../_ia'),(_,name)=>{
 if(!name||!String(name).endsWith('.md'))return;
 clearTimeout(timer);timer=setTimeout(()=>{try{execFileSync(process.execPath,[path.join(site,'scripts/sync-content.mjs')],{cwd:site,stdio:'inherit'});}catch{console.error('Conteúdo anterior preservado. Verifique os arquivos da memória.');}},350);
});
const standalone=process.argv.includes('--standalone');
execFileSync(process.execPath,[path.join(site,'scripts/sync-content.mjs')],{cwd:site,stdio:'inherit'});
const command=standalone?[path.join(site,'node_modules/vite/bin/vite.js'),'--config','vite.local.config.ts']:[path.join(site,'scripts/run-framework.mjs'),'dev','--hostname','127.0.0.1'];
const child=spawn(process.execPath,command,{cwd:site,stdio:'inherit'});
child.on('exit',code=>{watcher.close();process.exitCode=code??0;});
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>{watcher.close();clearTimeout(timer);child.kill(signal);});
