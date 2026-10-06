import{t as e}from"./rolldown-runtime-DK3Fl9T5.js";import{n as t}from"./resonator-DxHSA3UT.js";var n=`
struct Params {
  n: u32, W: u32, S: u32, stepBase: u32,
  nSteps: u32, sampleBase: u32, entBase: u32, nEnt: u32,
  A1: f32, inv: f32, al: f32, mu: f32,
  r: f32, p0: u32, p1: u32, p2: u32,
  pick: array<vec4<u32>, 2>,
};
@group(0) @binding(0) var<uniform> p: Params;
`,r=n+`
@group(0) @binding(1) var<storage, read> src: array<f32>;
@group(0) @binding(2) var<storage, read_write> dst: array<f32>;
@group(0) @binding(3) var<storage, read> stiff: array<f32>;
@group(0) @binding(4) var<storage, read> entCell: array<u32>;
@group(0) @binding(5) var<storage, read> entW: array<f32>;
@group(0) @binding(6) var<storage, read> amps: array<f32>;
@group(0) @binding(7) var<storage, read_write> outp: array<f32>;

const T: u32 = 16u;
const K: u32 = 8u;
const R: u32 = 32u;
const RR: u32 = 1024u;
var<workgroup> a: array<f32, 2048>;
var<workgroup> l: array<f32, 1024>;

fn inside(gx: i32, gy: i32) -> bool {
  return gx >= 1 && gy >= 1 && gx <= i32(p.n) && gy <= i32(p.n);
}

@compute @workgroup_size(16, 16)
fn advance(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_index) li: u32) {
  let W = p.W;
  let WW = W * W;
  let ox = i32(wg.x * T) + 1 - i32(K);
  let oy = i32(wg.y * T) + 1 - i32(K);
  for (var q = li; q < RR; q += T * T) {
    let gx = ox + i32(q % R);
    let gy = oy + i32(q / R);
    var u0 = 0.0; var u1 = 0.0; var l0 = 0.0;
    if (inside(gx, gy)) {
      let k = u32(gy) * W + u32(gx);
      u0 = src[k]; u1 = src[WW + k]; l0 = src[2u * WW + k];
    }
    a[q] = u0; a[RR + q] = u1; l[q] = l0;
  }
  workgroupBarrier();
  var cur = 0u;
  for (var t = 0u; t < p.nSteps; t++) {
    let g = p.stepBase + t;
    let sub = g % p.S;
    let smp = p.sampleBase + g / p.S;
    let lo = i32(t) + 1;
    let hi = i32(R) - 2 - i32(t);
    let cu = cur * RR;
    let pu = (1u - cur) * RR;
    for (var q = li; q < RR; q += T * T) {
      let lx = i32(q % R);
      let ly = i32(q / R);
      let gx = ox + lx;
      let gy = oy + ly;
      if (lx >= lo && lx <= hi && ly >= lo && ly <= hi && inside(gx, gy)) {
        let c = a[cu + q];
        let lap = a[cu + q - 1u] + a[cu + q + 1u] + a[cu + q - R] + a[cu + q + R] - 4.0 * c;
        let k = u32(gy) * W + u32(gx);
        a[pu + q] = (2.0 * c - p.A1 * a[pu + q] + stiff[k] * (p.al * lap - p.mu * l[q])) * p.inv;
        l[q] = lap;
      }
    }
    workgroupBarrier();
    if (li < p.nEnt) {
      let e = p.entBase + li;
      let k = entCell[e];
      let lx = i32(k % W) - ox;
      let ly = i32(k / W) - oy;
      if (lx >= 0 && ly >= 0 && lx < i32(R) && ly < i32(R)) {
        let m = smp * 5u;
        let w = e * 5u;
        var v = entW[w] * amps[m];
        if (sub == 0u) {
          v = v + (entW[w + 1u] * amps[m + 1u] + entW[w + 2u] * amps[m + 2u] + entW[w + 3u] * amps[m + 3u] + entW[w + 4u] * amps[m + 4u]);
        }
        let q = u32(ly) * R + u32(lx);
        a[pu + q] = a[pu + q] + v;
      }
    }
    workgroupBarrier();
    if (sub == p.S - 1u && li < 8u) {
      let k = p.pick[li / 4u][li % 4u];
      let lx = i32(k % W) - ox;
      let ly = i32(k / W) - oy;
      if (lx >= i32(K) && ly >= i32(K) && lx < i32(K + T) && ly < i32(K + T)) {
        outp[smp * 8u + li] = a[pu + u32(ly) * R + u32(lx)];
      }
    }
    cur = 1u - cur;
  }
  for (var q = li; q < RR; q += T * T) {
    let lx = i32(q % R);
    let ly = i32(q / R);
    let gx = ox + lx;
    let gy = oy + ly;
    if (lx >= i32(K) && ly >= i32(K) && lx < i32(K + T) && ly < i32(K + T) && inside(gx, gy)) {
      let k = u32(gy) * W + u32(gx);
      dst[k] = a[cur * RR + q];
      dst[WW + k] = a[(1u - cur) * RR + q];
      dst[2u * WW + k] = l[q];
    }
  }
}
`,i=n+`
@group(0) @binding(1) var<storage, read_write> st: array<f32>;

@compute @workgroup_size(16, 16)
fn resubA(@builtin(global_invocation_id) id: vec3<u32>) {
  if (id.x >= p.n || id.y >= p.n) { return; }
  let WW = p.W * p.W;
  let k = (id.y + 1u) * p.W + id.x + 1u;
  st[WW + k] = st[k] - (st[k] - st[WW + k]) * p.r;
}

@compute @workgroup_size(16, 16)
fn resubB(@builtin(global_invocation_id) id: vec3<u32>) {
  if (id.x >= p.n || id.y >= p.n) { return; }
  let W = p.W;
  let WW = W * W;
  let k = (id.y + 1u) * W + id.x + 1u;
  st[2u * WW + k] = st[WW + k - 1u] + st[WW + k + 1u] + st[WW + k - W] + st[WW + k + W] - 4.0 * st[WW + k];
}
`,a=Math.fround;function o(e,t,n,r,i,o,s,c){let l=e.u,u=e.up,d=e.lp;i=a(i),o=a(o),s=a(s),c=a(c);for(let e=1;e<=n;e++)for(let f=1;f<=n;f++){let n=e*r+f,p=l[n],m=a(a(a(a(l[n-1]+l[n+1])+l[n-r])+l[n+r])-a(4*p));u[n]=a(a(a(a(2*p)-a(i*u[n]))+a(t[n]*a(a(s*m)-a(c*d[n]))))*o),d[n]=m}e.u=u,e.up=l}function s(e,t,n,r,i,o,s,c){let l=e.u,u=s*5;for(let e=0;e<i;e++){let i=r+e,s=i*5,d=a(n[s]*o[u]);c===0&&(d=a(d+a(a(a(a(n[s+1]*o[u+1])+a(n[s+2]*o[u+2]))+a(n[s+3]*o[u+3]))+a(n[s+4]*o[u+4]))));let f=t[i];l[f]=a(l[f]+d)}}function c(e,t,n,r){let i=e.u,o=e.up,s=e.lp;r=a(r);for(let e=1;e<=t;e++)for(let s=1;s<=t;s++){let t=e*n+s;o[t]=a(i[t]-a(a(i[t]-o[t])*r))}for(let e=1;e<=t;e++)for(let r=1;r<=t;r++){let t=e*n+r;s[t]=a(a(a(a(a(o[t-1]+o[t+1])+o[t-n])+o[t+n]))-a(4*o[t]))}}var l=e({BLOCK:()=>256,CHUNK:()=>64,FRAME:()=>11,GPU_DETAIL_DEFAULT:()=>128,JsMembrane:()=>_,LATENCY_BLOCKS:()=>3,MAX_CHUNKS:()=>u,MAX_RECORDS:()=>d,MAX_STRIKES_PER_BLOCK:()=>32,MAX_SUB:()=>32,OP_RESUB:()=>1,OP_STEP:()=>0,ResoGpuPlan:()=>g,gpuLatencySec:()=>p,pitchCeiling:()=>m});Object.freeze({128:Object.freeze({n:128,sub:16}),192:Object.freeze({n:192,sub:24}),256:Object.freeze({n:256,sub:32})});var u=36,d=1024+3*u,f=64;function p(e){return 768*Math.max(1,Math.round(e/24e3))/e}function m(e,t,n){return 2*Math.asin(Math.min(1,Math.sqrt(.45*e)/2))*t*n/(2*Math.PI)}var h=class extends t{constructor(e,t){super(e,`standard`,t),this.resubR=0}resubstep(e){e!==this.S&&(this.resubR=this.S/e),this.S=e}},g=class{constructor(e,t){this.grid=t,this.n=t.n,this.W=t.n+2,this.R=new h(e,t),this.D=this.R.D,this.fs=this.R.fs,this.records=new ArrayBuffer(d*256),this.ru=new Uint32Array(this.records),this.rf=new Float32Array(this.records),this.ops=new Uint8Array(d),this.nRec=0,this.entCell=new Uint32Array(u*128),this.entW=new Float32Array(u*128*5),this.nEntAll=0,this.amps=new Float32Array(1280),this.chStart=new Int32Array(u),this.chLen=new Int32Array(u),this.chPick=new Float64Array(u*8),this.nChunks=0,this.nSamples=0,this.cfg=[NaN,NaN,NaN,NaN],this.strikesInBlock=0,this.started=!1,this.pick=new Uint32Array(8)}get g1(){return this.R.g1}get ready(){return this.R.g1>0}get stiffness(){return this.R.s}terrain(e,t,n){return this.R.derive(e?[e]:null,t?[t]:null,n),this.R.g1}ceiling(){return m(this.R.g1,this.grid.sub,this.fs)}record(e){let t=this.nRec++;this.ops[t]=e;let n=t*f,r=this.ru,i=this.rf,a=this.R;return r[n]=this.n,r[n+1]=this.W,r[n+2]=a.S,i[n+8]=a.A1,i[n+9]=a.inv,i[n+10]=a.al,i[n+11]=a.mu,n}plan(e,t,n){let r=this.R,i=this.n,a=this.W,o=this.D;this.nRec=0,this.nEntAll=0,this.nChunks=0,this.nSamples=n,this.strikesInBlock=0;let s=this.amps,c=0;for(;c<n;){let l=t+c*11,d=e[l+7],f=e[l+8],p=e[l+9],m=e[l+10],h=this.cfg;(d!==h[0]||f!==h[1]||p!==h[2]||m!==h[3])&&(r.configure(d,.5,f,p,1,m),h[0]=d,h[1]=f,h[2]=p,h[3]=m),e[l+1]>0&&(r.fTarget=e[l+1],this.started||=(r.fCur=r.fTarget,!0)),r.setDot(e[l+2],e[l+3]),e[l+4]>0&&this.strikesInBlock<32&&(this.strikesInBlock++,r.fCur=r.fTarget,r.strike(e[l+5],e[l+6],e[l+4]));let g=1;for(;c+g<n&&g<64&&!(e[l+g*11+4]>0);)g++;if(this.nChunks>=u&&(g=n-c),r.g1>0&&r.control(g*o),r.resubR!==0){let e=this.record(1);this.rf[e+12]=r.resubR,r.resubR=0}let _=r.mode===2;for(let n=c;n<c+g;n++){let i=e[t+n*11],a=n*5;s[a]=_&&i!==0?i*r.gDrive:0;for(let e=0;e<4;e++){let t=r.pAmp[e];if(t===0){s[a+1+e]=0;continue}let n=r.pT[e];s[a+1+e]=t*r.pulse[n]*r.gStrike,n+1>=r.pulse.length?r.pAmp[e]=0:r.pT[e]=n+1}}let v=this.nEntAll,y=0,b=(e,t,n)=>{let r=-1;for(let t=0;t<y;t++)if(this.entCell[v+t]===e){r=v+t;break}if(r<0){if(y>=128)return;r=v+y++,this.entCell[r]=e,this.entW.fill(0,r*5,r*5+5)}this.entW[r*5+t]=n};if(_)for(let e=0;e<r.dCnt;e++)b(r.dIdx[e],0,r.dW[e]);for(let e=0;e<4;e++){let t=!1;for(let n=c;n<c+g&&!t;n++)s[n*5+1+e]!==0&&(t=!0);if(!t)continue;let n=e*25;for(let t=0;t<r.pCnt[e];t++)b(r.pIdx[n+t],1+e,r.pW[n+t])}this.nEntAll+=y;let x=this.nChunks++;this.chStart[x]=c,this.chLen[x]=g;let S=this.pick;for(let e=0;e<8;e++){let t=r.kIdx[e],n=t%a,o=(t-n)/a,s=n>=1&&o>=1&&n<=i&&o<=i;S[e]=s?t:a+1,this.chPick[x*8+e]=s?r.kW[e]:0}let C=g*r.S;for(let e=0;e<C;e+=8){let t=this.record(0),n=this.ru;n[t+3]=e,n[t+4]=Math.min(8,C-e),n[t+5]=c,n[t+6]=v,n[t+7]=y;for(let e=0;e<8;e++)n[t+16+e]=S[e]}c+=g}return this.nRec}finish(e,t,n){for(let r=0;r<this.nChunks;r++){let i=this.chPick,a=r*8;for(let o=this.chStart[r],s=o+this.chLen[r];o<s;o++){let r=o*8;t[n+2*o]=e[r]*i[a]+e[r+1]*i[a+1]+e[r+2]*i[a+2]+e[r+3]*i[a+3],t[n+2*o+1]=e[r+4]*i[a+4]+e[r+5]*i[a+5]+e[r+6]*i[a+6]+e[r+7]*i[a+7]}}}},_=class{constructor(e){this.n=e,this.W=e+2;let t=this.W*this.W;this.st={u:new Float32Array(t),up:new Float32Array(t),lp:new Float32Array(t)},this.s=new Float32Array(t),this.raw=new Float32Array(2048)}setStiffness(e){this.s.set(e.subarray?e.subarray(0,this.s.length):e)}reset(){this.st.u.fill(0),this.st.up.fill(0),this.st.lp.fill(0)}run(e){let t=this.st,n=this.n,r=this.W,i=e.ru,a=e.rf,l=this.raw;for(let u=0;u<e.nRec;u++){let d=u*f;if(e.ops[u]===1){c(t,n,r,a[d+12]);continue}let p=i[d+2],m=i[d+3],h=i[d+4],g=i[d+5];for(let c=0;c<h;c++){let u=m+c,f=u%p,h=g+Math.floor(u/p);if(o(t,this.s,n,r,a[d+8],a[d+9],a[d+10],a[d+11]),s(t,e.entCell,e.entW,i[d+6],i[d+7],e.amps,h,f),f===p-1)for(let e=0;e<8;e++)l[h*8+e]=t.u[i[d+16+e]]}}return l}};export{l as a,g as i,u as n,i as o,d as r,r as s,_ as t};