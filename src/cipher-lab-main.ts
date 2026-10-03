import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import './style.css';
import './cipher-lab.css';
import './appearance';
import { cipherExamples, cipherTools, renderCipherLab } from './cipher-lab';
import { escapeHTML } from './content-pages';
import { CipherLabRuntime, type CipherLabToolName, type JsonValue, type CipherLabStatusEvent } from './cipher-lab-runtime';

const app = document.querySelector<HTMLDivElement>('#app')!;
if (!app.querySelector('main')) app.innerHTML = renderCipherLab();
const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const input = element<HTMLTextAreaElement>('cipher-input');
const tool = element<HTMLSelectElement>('cipher-tool');
const fields = element<HTMLFieldSetElement>('cipher-fields');
const results = element<HTMLDivElement>('cipher-results');
const status = element<HTMLParagraphElement>('cipher-status');
const cancel = element<HTMLButtonElement>('cipher-cancel');
let report: JsonValue | null = null;
let active = false;
let selectedMode: 'search' | 'bob' = 'search';
const object = (value: unknown): Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const show = (value: unknown) => escapeHTML(String(value ?? 'Not recorded'));

function onStatus(event: CipherLabStatusEvent) {
  status.textContent = event.message;
  element<HTMLElement>('cipher-state').textContent = event.state === 'ready' ? 'Engine ready' : event.state.charAt(0).toUpperCase() + event.state.slice(1);
  if (event.manifest) {
    const m = event.manifest;
    element<HTMLElement>('cipher-provenance').innerHTML = `Engine snapshot ${escapeHTML(m.source_git_commit?.slice(0,12) ?? 'local')} · model ${escapeHTML(m.model_sha256.slice(0,12))} · <a href="/cipher-lab/manifest.json">exact file hashes</a>${m.source_dirty ? '. This snapshot includes documented local source changes.' : '.'}`;
  }
}
const runtime = new CipherLabRuntime({onStatus});
function setActive(value: boolean) {
  active = value; fields.disabled = value; cancel.hidden = !value;
  document.querySelector('.cipher-output')!.setAttribute('aria-busy',String(value));
  document.querySelectorAll<HTMLButtonElement>('[data-example], [data-policy], #cipher-clear').forEach(b=>b.disabled=value);
}
function updateCount() {
  const length = (input.value.match(/[a-z]/gi) ?? []).length;
  element<HTMLElement>('cipher-count').textContent = `${length} letters`;
}
function clearReport() {
  report = null;
  document.querySelector<HTMLElement>('.cipher-export')!.hidden = true;
  element<HTMLDetailsElement>('cipher-raw').hidden = true;
  element<HTMLElement>('cipher-json').textContent = '';
  element<HTMLElement>('cipher-state').textContent = 'Ready for input';
}
function changed() {
  document.querySelectorAll('[data-example]').forEach(b=>b.setAttribute('aria-pressed','false'));
  element<HTMLElement>('cipher-example-note').textContent = 'Your transcription. Search results still require independent checks.';
  updateCount();
  if (report !== null) {clearReport(); results.innerHTML = '<p class="cipher-result-note">The input or settings changed. Run again to obtain a report for these settings.</p>'; status.textContent = 'Ready for your updated input.';}
}
function updateClues() {
  const name=tool.value;
  const groups:Record<string,boolean>={fitting:name!=='detective', unplaced:['detective','persona-council'].includes(name), keywords:['inheritance','persona-council'].includes(name), lexicon:['inheritance','persona-council'].includes(name), proposal:['adversary','skeptic','persona-council'].includes(name), verification:['skeptic','persona-council'].includes(name)};
  document.querySelectorAll<HTMLElement>('[data-clue-group]').forEach(group=>{group.hidden=!groups[group.dataset.clueGroup!];});
  const needed=['detective','inheritance','mechanic','hill-inference','skeptic'].includes(name);
  element<HTMLElement>('cipher-clue-summary').textContent=needed?'Add the required clue':'Add clues (optional)';
  if(needed&&selectedMode==='search') document.querySelector<HTMLDetailsElement>('.cipher-clues')!.open=true;
  element<HTMLElement>('cipher-tool-note').textContent=cipherTools.find(t=>t.id===name)!.note;
}
function selectMode(mode:'search'|'bob') {
  if(active)return;
  selectedMode=mode;
  const search=element<HTMLButtonElement>('cipher-mode-search'),bob=element<HTMLButtonElement>('cipher-bob');
  search.setAttribute('aria-selected',String(mode==='search'));search.tabIndex=mode==='search'?0:-1;
  bob.setAttribute('aria-selected',String(mode==='bob'));bob.tabIndex=mode==='bob'?0:-1;
  element<HTMLElement>('cipher-search-settings').hidden=mode!=='search';
  element<HTMLElement>('cipher-bob-explainer').hidden=mode!=='bob';
  element<HTMLButtonElement>('cipher-run').innerHTML=mode==='search'?'Run solver <span aria-hidden="true">↗</span>':'Identify family <span aria-hidden="true">↗</span>';
  element<HTMLElement>('cipher-action-note').textContent=mode==='search'?'A bounded search with explicit checks.':'Family advice from Bob the Neural Net.';
  changed();updateClues();
}
for(const [id,mode] of [['cipher-mode-search','search'],['cipher-bob','bob']] as const) {
  element<HTMLButtonElement>(id).addEventListener('click',()=>selectMode(mode));
  element<HTMLButtonElement>(id).addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?'search':event.key==='End'?'bob':selectedMode==='search'?'bob':'search';selectMode(next);element<HTMLButtonElement>(next==='search'?'cipher-mode-search':'cipher-bob').focus();}});
}

input.addEventListener('input',changed);
document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('#cipher-form input, #cipher-form textarea').forEach(field=>{if(field!==input) field.addEventListener('input',changed);});
element<HTMLFormElement>('cipher-form').addEventListener('change',event=>{
  if (event.target === tool) updateClues();
  changed();
});
document.querySelectorAll<HTMLButtonElement>('[data-example]').forEach(button=>button.addEventListener('click',()=>{
  if (active) return;
  const example = cipherExamples[Number(button.dataset.example)];
  selectMode('search'); input.value = example.text; tool.value = example.tool;
  element<HTMLTextAreaElement>('cipher-cribs').value = example.cribs;
  element<HTMLInputElement>('cipher-keywords').value = example.keywords;
  for (const id of ['cipher-unplaced','cipher-lexicon','cipher-proposal','cipher-reserved','cipher-reference']) element<HTMLInputElement>(id).value='';
  changed();
  updateClues();
  element<HTMLElement>('cipher-example-note').innerHTML = escapeHTML(example.note) + ('source' in example ? ` <a href="${escapeHTML(example.source)}" target="_blank" rel="noopener noreferrer">Published source ↗</a>` : '');
  button.setAttribute('aria-pressed','true');
}));
element<HTMLButtonElement>('cipher-clear').addEventListener('click',()=>{
  input.value=''; for (const id of ['cipher-cribs','cipher-keywords','cipher-unplaced','cipher-lexicon','cipher-proposal','cipher-reserved','cipher-reference']) element<HTMLInputElement>(id).value='';
  changed(); input.focus();
});
document.addEventListener('click',event=>{
  const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-policy]');
  if(!button||active)return;
  selectMode('search');tool.value=button.dataset.policy!;changed();updateClues();
  element<HTMLElement>('workbench').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});tool.focus({preventScroll:true});
});


function cribs(id: string): JsonValue[] {
  const rows=element<HTMLTextAreaElement>(id).value.trim().split('\n').filter(row=>row.trim());
  if (rows.length>8) throw new Error('Use at most eight cribs per field in this browser workbench.');
  return rows.map(row=>{
    const match=row.match(/^\s*(\d+)\s*:\s*([A-Za-z\s]+)\s*$/);
    if(!match) throw new Error('Each crib needs offset:word, for example 0:ATTACK.');
    return {offset:Number(match[1]),plaintext:match[2].replace(/\s/g,'').toUpperCase()};
  });
}
function words(id: string): string[] {
  const value=element<HTMLInputElement>(id).value.trim();
  const rows=value ? value.split(/[\s,]+/) : [];
  if(rows.length>100 || rows.some(row=>!/^[A-Za-z]{1,32}$/.test(row))) throw new Error('Clue lists accept up to 100 A-Z words, each at most 32 letters.');
  return rows.map(row=>row.toUpperCase());
}
function parameters(name: CipherLabToolName): {[key:string]:JsonValue} {
  const fitting=name==='detective'?[]:cribs('cipher-cribs'), reserved=['persona-council','skeptic'].includes(name)?cribs('cipher-reserved'):[];
  const reference=['persona-council','skeptic'].includes(name)?element<HTMLInputElement>('cipher-reference').value.trim().toLowerCase():'';
  if(reference && !/^[a-f0-9]{64}$/.test(reference)) throw new Error('A plaintext SHA-256 must contain exactly 64 hexadecimal characters.');
  if((reserved.length||reference) && !['persona-council','skeptic'].includes(name)) throw new Error('Reserved checks are available through Solver council or Skeptic. Choose one of those policies.');
  const p:{[key:string]:JsonValue}={max_checks:Number(element<HTMLSelectElement>('cipher-budget').value),max_candidates:10};
  if(fitting.length) p.cribs=fitting;
  const unplaced=element<HTMLInputElement>('cipher-unplaced').value.trim();
  if(name==='detective') {if(!unplaced) throw new Error('Detective needs an unplaced crib. Add a clue first.'); p.crib=unplaced; p.max_period=16;}
  if(name==='hill-inference'&&!fitting.length) throw new Error('Hill inference needs at least one aligned fitting crib.');
  if(name==='inheritance'||name==='persona-council') {
    const keywords=words('cipher-keywords'),lexicon=words('cipher-lexicon');
    if(keywords.length) p.keywords=keywords;
    if(lexicon.length) p.lexicon=lexicon;
    if(name==='inheritance'&&!fitting.length&&!keywords.length&&!lexicon.length) throw new Error('Inheritance needs a crib, keyword guesses or a word list.');
  }
  const proposed=element<HTMLTextAreaElement>('cipher-proposal').value.trim();
  if(name==='adversary'&&proposed) p.candidate=proposed;
  if(name==='skeptic') {if(!proposed) throw new Error('Standalone Skeptic needs a proposed plaintext to review.'); p.candidate_plaintexts=[proposed];}
  if(name==='persona-council') {if(unplaced) p.unplaced_crib=unplaced; if(proposed) p.proposed_plaintext=proposed;}
  if(name==='persona-council'||name==='skeptic') {if(reserved.length) p.verification_cribs=reserved; if(reference) p.expected_plaintext_sha256=reference;}
  return p;
}

function renderReport(value: JsonValue, bob: boolean) {
  report=value;
  const envelope=object(value),r=bob?envelope:object(envelope.result);
  if(bob) {
    results.innerHTML=`<p class="cipher-result-note"><strong>Bob the Neural Net</strong> ${r.uncertain?'is uncertain about this family.':'has a leading family suggestion.'} These probabilities are conditional on its training examples; they are not a plaintext confidence score.</p>`+list(r.candidates).slice(0,5).map(item=>{const row=object(item),probability=Number(row.probability);const percentage=Number.isFinite(probability)?Math.max(0,Math.min(100,probability*100)):0;return `<div class="cipher-bob-row"><span>${show(row.family)}</span><div class="cipher-bob-bar"><span style="width:${percentage}%"></span></div><span>${percentage.toFixed(1)}%</span></div>`;}).join('')+`<p class="cipher-result-note">${show(r.scope)}</p>`;
    const leading=String(object(list(r.candidates)[0]).family ?? '');
    const nextPolicy:Record<string,CipherLabToolName>={caesar:'normal-man',affine:'pacifist','rail-fence':'cartographer','columnar-transposition':'transposition-ensemble',redefence:'cartographer',substitution:'inheritance',vigenere:'inheritance',beaufort:'emperor',autokey:'mechanic','progressive-key':'mechanic'};
    if(nextPolicy[leading])results.innerHTML+=`<button type="button" class="text-link cipher-bob-next" data-policy="${nextPolicy[leading]}">Try ${escapeHTML(cipherTools.find(t=>t.id===nextPolicy[leading])!.name)} next ↗</button>`;
  } else {
    const candidates=list(r.candidates),reviews=list(r.reviews);
    const suppliedCribs=tool.value!=='detective'&&element<HTMLTextAreaElement>('cipher-cribs').value.trim().length>0;
    results.innerHTML=`<dl class="cipher-result-facts"><div><dt>Checks used</dt><dd>${show(r.checks??r.total_checks)}</dd></div><div><dt>Declared search</dt><dd>${r.search_complete===true?'Complete':'Partial'}</dd></div><div><dt>Retained candidates</dt><dd>${candidates.length}</dd></div></dl><p class="cipher-result-note">${r.search_complete===true?'All settings declared by this policy were checked.':'The search was bounded or requires more evidence.'} This does not establish uniqueness across every possible cipher.</p>`;
    results.innerHTML+=candidates.map((item,index)=>{
      const c=object(item),review=object(c.skeptic_review);
      const voice=list(c.supporting_personas).map(show).join(', ');
      return `<article class="cipher-candidate"${index>=3?' data-extra hidden':''}><div class="cipher-candidate-meta"><span>${String(index+1).padStart(2,'0')} / ${show(c.family??'composed search')}</span><span>Unverified candidate</span></div><pre>${show(c.plaintext)}</pre><div class="cipher-candidate-details"><span>Forward check: ${c.forward_consistent===true?'passed':c.forward_consistent===false?'failed':'see witnesses'}</span><span>${!suppliedCribs?'No fitting cribs supplied':`Fitting cribs: ${c.crib_match===true?'matched':c.crib_match===false?'failed':'see report'}`}</span>${review.status?`<span>Skeptic: ${show(review.status)}</span>`:''}</div>${voice?`<p class="cipher-result-note">Supporting policies: ${voice}. Agreement is not independent evidence.</p>`:''}<details><summary>Key & transform evidence</summary><pre>${escapeHTML(JSON.stringify({key:c.key??null,evidence:c.evidence??null,witnesses:c.witnesses??null},null,2))}</pre></details></article>`;
    }).join('');
    if(candidates.length>3)results.innerHTML+=`<button type="button" class="cipher-more-candidates text-link" data-more-candidates aria-expanded="false">Show ${candidates.length-3} more candidates ↓</button>`;
    results.innerHTML+=reviews.map(item=>{const row=object(item);return `<div class="cipher-review"><strong>${show(row.status)}</strong><p>${show(row.plaintext)}</p><p class="cipher-hint">Reference match: ${row.reference_hash_match===true?'yes':row.reference_hash_match===false?'no':'not supplied'}. Reserved crib positions: ${show(row.verification_crib_positions)}.</p></div>`;}).join('');
    if(!candidates.length&&!reviews.length) results.innerHTML+='<p class="cipher-result-note">No candidate was retained within these settings. Inspect the full report for missing evidence, contradictions and remaining models.</p>';
    if(typeof r.narration==='string') results.innerHTML+=`<p class="cipher-result-note">${escapeHTML(r.narration)}</p>`;
    results.innerHTML+='<p class="cipher-result-note">A forward check verifies the stated transformation. It does not authenticate a historical reading. Keep a separate reference or reserved evidence for verification.</p>';
  }
  element<HTMLElement>('cipher-json').textContent=JSON.stringify(value,null,2);
  element<HTMLDetailsElement>('cipher-raw').hidden=false;
  document.querySelector<HTMLElement>('.cipher-export')!.hidden=false;
}
async function run(bob:boolean) {
  if(active) return;
  try {
    const length=(input.value.match(/[a-z]/gi)??[]).length;
    if(/[^\x00-\x7f]|[0-9]/.test(input.value)) throw new Error('This workbench accepts A-Z letters with spaces and punctuation. Choose the repository tools for other alphabets or numeric codes.');
    if(length<(bob?16:4)||length>512) throw new Error(bob?'Bob needs 16 to 512 A-Z letters.':'Enter 4 to 512 A-Z letters.');
    const p=bob?{}:parameters(tool.value as CipherLabToolName);
    clearReport(); results.innerHTML='<p class="cipher-result-note">Preparing a bounded local run. You can cancel while Python loads or while the solver works.</p>'; setActive(true);
    const value=bob?await runtime.predictBob(input.value):await runtime.runTool(tool.value as CipherLabToolName,input.value,p);
    renderReport(value,bob);
  } catch(error) {
    const message=error instanceof Error?error.message:'The run failed. Review your input and try again.';
    status.textContent=message;
    results.innerHTML=`<p class="cipher-result-note">${escapeHTML(message)}</p>`;
  } finally {setActive(false);}
}
element<HTMLFormElement>('cipher-form').addEventListener('submit',event=>{event.preventDefault();void run(selectedMode==='bob');});
results.addEventListener('click',event=>{const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-more-candidates]');if(!button)return;const expanded=button.getAttribute('aria-expanded')!=='true';results.querySelectorAll<HTMLElement>('[data-extra]').forEach(row=>row.hidden=!expanded);button.setAttribute('aria-expanded',String(expanded));button.textContent=expanded?'Show fewer candidates ↑':`Show ${results.querySelectorAll('[data-extra]').length} more candidates ↓`;});
cancel.addEventListener('click',()=>runtime.cancel());
element<HTMLButtonElement>('cipher-download').addEventListener('click',()=>{
  if(report===null) return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)+'\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='cipher-lab-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
element<HTMLButtonElement>('cipher-copy').addEventListener('click',()=>{
  if(report===null)return;
  if(!navigator.clipboard) {status.textContent='Clipboard is unavailable. Download the report instead.';return;}
  void navigator.clipboard.writeText(JSON.stringify(report,null,2)).then(()=>status.textContent='Report copied.').catch(()=>status.textContent='Clipboard is unavailable. Download the report instead.');
});
const menu=document.querySelector<HTMLButtonElement>('.menu-toggle')!,mobileNav=element<HTMLElement>('mobile-nav');
const closeMenu=()=>{menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');mobileNav.hidden=true;};
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');mobileNav.hidden=!open;});
mobileNav.addEventListener('click',event=>{if((event.target as HTMLElement).closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
window.addEventListener('pagehide',()=>runtime.dispose());
updateCount();
updateClues();

document.querySelectorAll<HTMLAnchorElement>('a[href="#methods"], a[href="#cipher-engine-details"]').forEach(link=>link.addEventListener('click',()=>{const target=document.querySelector<HTMLDetailsElement>(link.hash);if(target)target.open=true;}));
