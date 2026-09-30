import { cleanRecipe, makeArtSVG, palettes, type ArtRecipe, type ArtSubject } from './art-sketch';
import './art-playground.css';

export function mountArtPlayground(root: HTMLElement) {
  const subject:ArtSubject={id:root.dataset.artId!,title:root.dataset.artTitle!,category:root.dataset.artCategory!};
  const storageKey='hendrick-art:'+subject.id;
  let saved:Partial<ArtRecipe>={};try{const parsed=JSON.parse(localStorage.getItem(storageKey)??'{}');if(parsed && typeof parsed==='object' && !Array.isArray(parsed))saved=parsed;}catch{}
  const query=new URL(location.href).searchParams;
  if(query.has('artSeed'))saved={seed:query.get('artSeed')!,density:Number(query.get('artDensity')??55),scale:Number(query.get('artScale')??1),complexity:Number(query.get('artComplexity')??5),palette:query.get('artPalette')??'forest'};
  let recipe=cleanRecipe(saved),art='';
  const seed=root.querySelector<HTMLInputElement>('[name="art-seed"]')!;
  const palette=root.querySelector<HTMLSelectElement>('[name="art-palette"]')!;
  palette.innerHTML=Object.keys(palettes).map(key=>`<option value="${key}">${key[0].toUpperCase()+key.slice(1)}</option>`).join('');
  const sliders=[...root.querySelectorAll<HTMLInputElement>('input[type="range"]')];
  const image=root.querySelector<HTMLImageElement>('.art-preview')!;
  const status=root.querySelector<HTMLElement>('.art-status')!;
  let previewURL='',pending=0;
  function draw(){
    recipe=cleanRecipe({seed:seed.value,palette:palette.value,...Object.fromEntries(sliders.map(s=>[s.dataset.artParam!,Number(s.value)]))});
    sliders.forEach(s=>root.querySelector<HTMLOutputElement>(`[data-art-value="${s.dataset.artParam}"]`)!.value=s.value);
    art=makeArtSVG(subject,recipe);const url=URL.createObjectURL(new Blob([art],{type:'image/svg+xml'}));
    if(previewURL)URL.revokeObjectURL(previewURL);previewURL=url;image.src=url;
    try{localStorage.setItem(storageKey,JSON.stringify(recipe));}catch{}
    status.textContent='Art sketch ready. Your recipe stays in this browser.';
  }
  function restore(){seed.value=recipe.seed;palette.value=recipe.palette;sliders.forEach(s=>s.value=String(recipe[s.dataset.artParam as 'density'|'scale'|'complexity']));draw();}
  function schedule(){cancelAnimationFrame(pending);pending=requestAnimationFrame(draw);}
  restore();seed.addEventListener('input',schedule);palette.addEventListener('change',draw);sliders.forEach(s=>s.addEventListener('input',schedule));
  root.querySelector('[data-art-random]')!.addEventListener('click',()=>{const numbers=crypto.getRandomValues(new Uint32Array(2));seed.value=[...numbers].map(n=>n.toString(36)).join('-');draw();});
  root.querySelector('[data-art-reset]')!.addEventListener('click',()=>{recipe=cleanRecipe({});restore();});
  const filename=()=>subject.id+'-art-'+recipe.seed.replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,45);
  function download(blob:Blob,suffix:string){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=filename()+suffix;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  root.querySelector('[data-art-svg]')!.addEventListener('click',()=>{draw();download(new Blob([art],{type:'image/svg+xml'}),'.svg');status.textContent='Vector SVG downloaded. It can be scaled for printing.';});
  root.querySelector('[data-art-png]')!.addEventListener('click',async()=>{
    const button=root.querySelector<HTMLButtonElement>('[data-art-png]')!;button.disabled=true;draw();
    try{const raster=new Image(),url=URL.createObjectURL(new Blob([art],{type:'image/svg+xml'}));try{raster.src=url;await raster.decode();const c=document.createElement('canvas');c.width=3200;c.height=2240;c.getContext('2d')!.drawImage(raster,0,0,c.width,c.height);const blob=await new Promise<Blob|null>(resolve=>c.toBlob(resolve,'image/png'));if(!blob)throw Error();download(blob,'.png');status.textContent='3200 × 2240 PNG downloaded.';}finally{URL.revokeObjectURL(url);}}catch{status.textContent='PNG could not be exported. Try downloading the SVG.';}finally{button.disabled=false;}
  });
  root.querySelector('[data-art-share]')!.addEventListener('click',async()=>{
    draw();const url=new URL(location.href);for(const [key,value] of Object.entries(recipe))url.searchParams.set('art'+key[0].toUpperCase()+key.slice(1),String(value));url.hash='art-playground';
    try{await navigator.clipboard.writeText(url.href);status.textContent='Recipe link copied. It reproduces this public art sketch.';}catch{const field=root.querySelector<HTMLInputElement>('.art-share-fallback')!;field.hidden=false;field.value=url.href;field.focus();field.select();status.textContent='Copy the recipe link from the field below.';}
  });
  root.querySelector('[data-art-print]')!.addEventListener('click',()=>{
    draw();const printWindow=window.open('','_blank');if(!printWindow){status.textContent='Allow the print window, or download SVG to print.';return;}
    const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
    printWindow.document.write(`<!doctype html><html lang="en"><head><title>${escape(subject.title)} art sketch</title><meta name="robots" content="noindex"/><style>body{margin:24px;font:12px system-ui;color:#253c31}svg{width:100%;height:auto;max-height:85vh}p{margin-top:14px}@page{size:landscape;margin:12mm}@media print{button{display:none}body{margin:0}}</style></head><body>${art}<p>${escape(subject.title)} · Public art sketch · Seed ${escape(recipe.seed)} · ${escape(recipe.palette)} · Density ${recipe.density} · Scale ${recipe.scale} · Complexity ${recipe.complexity}</p><button onclick="window.print()">Print / Save as PDF</button></body></html>`);
    printWindow.document.close();printWindow.opener=null;printWindow.focus();setTimeout(()=>{if(!printWindow.closed)printWindow.print();},300);status.textContent='Print view opened. Choose your printer or Save as PDF.';
  });
  window.addEventListener('pagehide',()=>{URL.revokeObjectURL(previewURL);cancelAnimationFrame(pending);});
}
