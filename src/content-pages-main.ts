import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import './style.css';
import './appearance';
import './content-pages.css';
import { mountArtPlayground } from './art-playground';
document.querySelectorAll<HTMLElement>('[data-art-id]').forEach(mountArtPlayground);

const data = document.querySelector('#method-samples');
if (data?.textContent) {
  const entry = JSON.parse(data.textContent) as {title:string;presets:{id:string;label:string}[];samples:{preset:string;image:string;label?:string;note?:string}[]};
  const select = document.querySelector<HTMLSelectElement>('#method-preset')!;
  const image = document.querySelector<HTMLImageElement>('#method-image');
  const caption = document.querySelector('#method-caption');
  const status = document.querySelector('#preset-status')!;
  const show = () => {
    const sample = entry.samples.find(p=>p.preset===select.value);
    const label=entry.presets.find(p=>p.id===select.value)?.label??select.value;
    if(image && sample){image.src=sample.image;image.alt=`${entry.title}, ${label} preset sample`;if(caption)caption.textContent=label;}
    status.textContent=sample ? `Selected preset: ${label}. ${sample.note ?? `${entry.samples.length} of ${entry.presets.length} stills available.`}` : `A still for ${label} is being prepared. The image above remains the last available sample.`;
  };
  select.addEventListener('change',show);
  document.querySelectorAll<HTMLAnchorElement>('.preset-image-link').forEach(a=>a.addEventListener('click',event=>{
    event.preventDefault();select.value=a.dataset.preset!;show();image?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'center'});
  }));
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('video').forEach(v=>v.pause());});
