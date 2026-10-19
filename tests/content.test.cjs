'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'content.js'),'utf8'),ctx);
const C=ctx.window.PlanContent;

test('todas las secciones y archivos del documento existen',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const [id] of C.sections)assert.ok(html.includes(`id="${id}"`),id);
  const refs=[...html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)].map(m=>m[1]);
  refs.forEach(ref=>assert.ok(fs.existsSync(path.join(root,ref)),ref));
  assert.equal(C.sections.length,9);
});
test('la ruta tiene identificadores únicos y responsables reconocidos',()=>{
  const tasks=C.phases.flatMap(p=>p.tasks);
  assert.equal(tasks.length,19);
  assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
  tasks.forEach(t=>assert.ok(['Ambos','Socio/a 1','Socio/a 2'].includes(t.owner)));
});
test('las fuentes incluyen enlaces públicos y límites de evidencia',()=>{
  assert.ok(C.sources.length>=10);
  C.sources.forEach(s=>{assert.ok(s.url.startsWith('https://'));assert.ok(s.limit.length>30);});
});
test('productos e ideas se identifican sin duplicados',()=>{
  [C.products,C.contentIdeas].forEach(items=>assert.equal(new Set(items.map(x=>x.id)).size,items.length));
  assert.equal(C.products.reduce((n,p)=>n+p.sample,0),275);
});
