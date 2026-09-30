export type ArtRecipe = {seed: string; density: number; scale: number; complexity: number; palette: string};
export type ArtSubject = {id: string; title: string; category: string};
export const palettes: Record<string, string[]> = {
  forest: ['#f7f4e9','#284b41','#8b9a72','#bd7957','#d4bc86'],
  midnight: ['#111b2b','#73c5bd','#e1c082','#c77c91','#597cad'],
  terracotta: ['#f9eee0','#793c34','#c66e4a','#d5a772','#425f52'],
  ocean: ['#edf3f0','#174f62','#3b8b8d','#95bdab','#c29262'],
  graphite: ['#f5f3eb','#252b2a','#65716b','#9ba19a','#bbbdb3'],
};
export function cleanRecipe(value: Partial<ArtRecipe>): ArtRecipe {
  const bound = (n: unknown, fallback: number, lo: number, hi: number) => typeof n === 'number' && Number.isFinite(n) ? Math.max(lo,Math.min(hi,n)) : fallback;
  return {seed:String(value.seed??'hendrick').slice(0,100),density:Math.round(bound(value.density,55,10,100)),scale:bound(value.scale,1,.5,2),complexity:Math.round(bound(value.complexity,5,1,10)),palette:value.palette && Object.hasOwn(palettes,value.palette) ? value.palette : 'forest'};
}
const esc = (value: string) => value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
function random(seed: string) {
  let state = 2166136261;
  for (const c of seed) state = Math.imul(state^c.charCodeAt(0),16777619);
  return () => {state=(state+0x6d2b79f5)|0;let n=Math.imul(state^(state>>>15),state|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296;};
}
/** Original public illustrations. No research solver, source, or parameters are imported. */
export function makeArtSVG(subject: ArtSubject, raw: Partial<ArtRecipe>): string {
  const p=cleanRecipe(raw),rand=random(subject.id+'|'+p.seed),colors=palettes[p.palette],paths:string[]=[];
  const count=Math.round(30+p.density*3),phase=rand()*Math.PI*2,frequency=1+rand()*3,step=4/p.scale;
  const color=()=>colors[1+Math.floor(rand()*(colors.length-1))];
  const number=(n:number)=>n.toFixed(2);
  const path=(d:string,stroke:string,width=1,opacity=.7,fill='none')=>paths.push(`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`);
  const circle=(x:number,y:number,r:number,fill:string,opacity=.7)=>paths.push(`<circle cx="${number(x)}" cy="${number(y)}" r="${number(r)}" fill="${fill}" opacity="${opacity}"/>`);
  let mode='flow';
  if(subject.category==='Geometry and tilings')mode='tiles';
  else if(subject.category==='Growth and patterns')mode='growth';
  else if(subject.category==='Neuroscience and collective systems')mode='networks';
  else if(subject.category==='Quantum and optical structures')mode='waves';
  else if(subject.category==='Particles and dynamics')mode='orbits';
  const id=subject.id.toLowerCase();
  if(/phyllotaxis|sunflower|spiral/.test(id))mode='bloom';
  if(/snow|lichen|drain|tree/.test(id))mode='branches';
  if(/turing|cortex|potts|phase|cell|life|foam|cyclic/.test(id))mode='cells';
  const dotScale=p.scale;
  if(mode==='flow'){
    const centers=Array.from({length:2+p.complexity},()=>({x:rand()*1000,y:rand()*700,spin:rand()>.5?1:-1}));
    for(let i=0;i<count;i++){
      let x=rand()*1000,y=rand()*700,d=`M${number(x)},${number(y)}`;
      for(let j=0;j<45+p.complexity*13;j++){
        let angle=phase+Math.sin(x*.004*frequency+phase)*1.2+Math.cos(y*.006)*.8;
        for(const c of centers){const dx=x-c.x,dy=y-c.y,dist=Math.hypot(dx,dy);angle+=Math.atan2(dy,dx)*c.spin*180/(dist+180);}
        x+=Math.cos(angle)*step;y+=Math.sin(angle)*step;
        if(x<20||x>980||y<20||y>680)break;
        d+=`L${number(x)},${number(y)}`;
      }
      path(d,color(),.6+rand()*1.7,.3+rand()*.5);
    }
  }else if(mode==='tiles'){
    const size=(90-p.density*.45)*p.scale,variant=Math.floor(rand()*4);
    for(let y=35;y<685;y+=size)for(let x=35;x<985;x+=size){
      const a=rand()*Math.PI*2,c=color(),n=3+(p.complexity%6),radius=size*(.25+rand()*.25);
      if(variant%2===0){let d='';for(let k=0;k<n;k++)d+=`${k?'L':'M'}${number(x+Math.cos(a+k*2*Math.PI/n)*radius)},${number(y+Math.sin(a+k*2*Math.PI/n)*radius)}`;path(d+'Z',c,1,.7,rand()>.65?c:'none');}
      else{const flip=rand()>.5;path(`M${x},${y}q${size/2},${flip?size:-size} ${size},0`,c,1+rand()*2,.65);}
    }
  }else if(mode==='bloom'||mode==='orbits'){
    const n=count*(mode==='bloom'?5:2),golden=Math.PI*(3-Math.sqrt(5)),rotation=phase;
    for(let i=0;i<n;i++){
      const angle=i*golden+rotation+(mode==='orbits'?Math.sin(i*.035)*p.complexity*.12:0),r=Math.sqrt(i/n)*290/dotScale;
      const x=500+Math.cos(angle)*r*1.35,y=350+Math.sin(angle)*r;
      circle(x,y,(1.2+rand()*3)*dotScale,color(),.4+rand()*.4);
      if(mode==='orbits'&&i%6===0)path(`M${number(x)},${number(y)}q${number(Math.sin(angle)*30)},${number(Math.cos(angle)*30)} ${number(Math.cos(angle)*60)},${number(Math.sin(angle)*60)}`,color(),.6,.45);
    }
  }else if(mode==='waves'){
    const n=30+Math.round(p.density*.7),sources=Array.from({length:2+Math.floor(p.complexity/2)},()=>({x:rand()*1000,y:rand()*700,p:rand()*6.3}));
    for(let k=0;k<n;k++){
      let d='';const base=25+k*650/n;
      for(let x=25;x<=975;x+=4){let y=base;for(const s of sources)y+=Math.sin(Math.hypot(x-s.x,base-s.y)*.012*p.scale+s.p)*5*p.complexity/sources.length;d+=`${x===25?'M':'L'}${x},${number(y)}`;}
      path(d,color(),.6+rand()*.7,.55);
    }
  }else if(mode==='branches'){
    const branch=(x:number,y:number,angle:number,length:number,depth:number)=>{
      const bend=(rand()-.5)*.8,nx=x+Math.cos(angle+bend)*length,ny=y+Math.sin(angle+bend)*length;
      path(`M${number(x)},${number(y)}Q${number(x+Math.cos(angle)*length*.5)},${number(y+Math.sin(angle)*length*.5)} ${number(nx)},${number(ny)}`,color(),.4+depth*.35,.7);
      if(depth>0){branch(nx,ny,angle-.25-rand()*.55,length*(.6+rand()*.15),depth-1);branch(nx,ny,angle+.25+rand()*.55,length*(.6+rand()*.15),depth-1);}
      else circle(nx,ny,1.5*dotScale,color());
    };
    for(let k=0;k<3+Math.floor(p.density/15);k++)branch(100+rand()*800,570+rand()*80,-Math.PI/2,70*dotScale,Math.min(7,2+Math.floor(p.complexity/2)));
  }else if(mode==='networks'){
    const nodes=Array.from({length:count},()=>({x:40+rand()*920,y:40+rand()*620}));
    for(let i=0;i<nodes.length;i++){
      const a=nodes[i];for(let j=i+1;j<nodes.length;j++){const b=nodes[j],dist=Math.hypot(a.x-b.x,a.y-b.y);if(dist<40+p.complexity*8&&rand()<.6)path(`M${number(a.x)},${number(a.y)}Q${number((a.x+b.x)/2+15*Math.sin(phase))},${number((a.y+b.y)/2-15)} ${number(b.x)},${number(b.y)}`,color(),.7,.24);}
      circle(a.x,a.y,(1+rand()*3)*dotScale,color(),.8);
    }
  }else{
    for(let i=0;i<count;i++){
      const x=35+rand()*930,y=35+rand()*630,r=(8+rand()*23)*dotScale,n=18+p.complexity*3,c=color();let d='';
      for(let k=0;k<n;k++){const a=k*2*Math.PI/n,rr=r*(1+.23*Math.sin(a*(2+p.complexity%5)+phase+i));d+=`${k?'L':'M'}${number(x+Math.cos(a)*rr)},${number(y+Math.sin(a)*rr)}`;}
      path(d+'Z',c,.7,.3+rand()*.4,i%5===0?c:'none');
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700" role="img" aria-label="${esc(subject.title)} public art sketch"><title>${esc(subject.title)}: art sketch</title><desc>Independent seeded illustration. Seed: ${esc(p.seed)}. Density: ${p.density}; scale: ${p.scale}; complexity: ${p.complexity}; palette: ${esc(p.palette)}. This does not run the GENChase research engine.</desc><rect width="1000" height="700" fill="${colors[0]}"/>${paths.join('')}</svg>`;
}
