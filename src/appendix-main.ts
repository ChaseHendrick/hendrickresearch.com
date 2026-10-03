import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/instrument-serif/latin-400.css';
import './style.css';
import './appearance';
import './content-pages.css';
import './appendix.css';
import { forgetSecrets, foundSecrets, recordSecret, secretEvent } from './secrets';
import { renderSecretList } from './appendix';

const list = document.querySelector<HTMLDivElement>('#secret-list')!;
const render = () => { list.innerHTML = renderSecretList(foundSecrets()); };
window.addEventListener(secretEvent, render);
window.addEventListener('storage', render);
if (!recordSecret('appendix')) render();
document.querySelector('#secret-reset')!.addEventListener('click', () => { forgetSecrets(); recordSecret('appendix'); });
