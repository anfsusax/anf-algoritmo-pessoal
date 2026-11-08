import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicMode = process.argv.includes('--public') || process.env.VERCEL === '1';
const memory = publicMode ? path.resolve(site, 'content/public') : path.resolve(site, '../_ia');
const names = publicMode ? ['PROPOSITO.md','FRUTOS_DE_UMA_VIDA_EM_CRISTO.md'] : ['PERFIL_ALEX.md','PROJETO_DE_VIDA.md','FRUTOS_DE_UMA_VIDA_EM_CRISTO.md','ESTADO.md','TAREFAS.md','DECISOES.md','DIARIO.md','ORIGEM.md'];
const documents = [];
for (const name of names) {
 let content = await readFile(path.join(memory,name),'utf8');
 if(name==='PERFIL_ALEX.md') content=content.split('\n').filter(line=>!/^\- (Nascimento:|Veículo:|Casa própria)/.test(line)).join('\n');
 documents.push({id:name,title:({'PROPOSITO.md':'Propósito e prioridades','PERFIL_ALEX.md':'Meu perfil','PROJETO_DE_VIDA.md':'Meu projeto de vida','FRUTOS_DE_UMA_VIDA_EM_CRISTO.md':'Os frutos de uma vida em Cristo','ESTADO.md':'Onde estamos','TAREFAS.md':'Próximos passos','DECISOES.md':'Escolhas e direção','DIARIO.md':'Memória da caminhada','ORIGEM.md':'Como tudo começou'})[name],content});
}
const source=documents.find(d=>d.id==='FRUTOS_DE_UMA_VIDA_EM_CRISTO.md').content;
let group='';const fruits=[];
for(const line of source.split('\n')) {
 const category=line.match(/^## Categoria \d+: (.+)/);
 if(category) group=category[1];
 const item=line.match(/^(\d+)\. (.+)/);
 if(item) fruits.push({id:Number(item[1]),name:item[2],group});
}
if(fruits.length!==69 || fruits.some((f,i)=>f.id!==i+1)) throw new Error('A lista deve preservar os 69 frutos em ordem.');
await mkdir(path.join(site,'data'),{recursive:true});
await writeFile(path.join(site,'data/content.json'),JSON.stringify({scope:publicMode?'public':'local',updatedAt:new Date().toISOString(),fruits,documents},null,2)+'\n');
console.log(`Conteúdo ${publicMode ? "para publicação" : "local"} sincronizado: ${documents.length} documentos e ${fruits.length} frutos.`);
