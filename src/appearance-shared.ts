export const appearanceKey = 'hendrick-appearance';

// Run before styles paint, including on the atlas's static reading pages.
export const appearanceBootstrap = `<script data-appearance-bootstrap>(function(){var p='system';try{var s=localStorage.getItem('${appearanceKey}');if(s==='light'||s==='dark'||s==='system')p=s}catch(e){}var t=p==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t})()</script>`;
