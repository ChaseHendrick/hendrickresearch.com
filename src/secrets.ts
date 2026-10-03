// The one owner of the "secrets found" list. Browser storage only; nothing leaves the device.
export const secretsKey = 'hr_secrets';
export const secretRoute = '/appendix-z/';
export const secretEvent = 'hr-secret';

export type SecretId = 'appendix' | 'konami' | 'knock' | 'lab';
export type Secret = { id: SecretId; title: string; found: string; hint: string };

export const secretCatalog: readonly Secret[] = [
  { id: 'appendix', title: 'Appendix Z', found: 'You reached the page that no menu links to.', hint: 'Some pages are filed at the very back.' },
  { id: 'konami', title: 'Player 2', found: 'You entered the old cheat code and joined the session.', hint: 'Arrows up, down, left and right, as an old console would ask, then two letters.' },
  { id: 'knock', title: 'Seven knocks', found: 'You knocked on the home page logo until it answered.', hint: 'On the home page, the logo opens up to anyone who knocks often enough.' },
  { id: 'lab', title: 'Lab result', found: 'You carried the console note to the Cipher Lab.', hint: 'The browser console keeps a sealed note. One lab here can read it.' },
];

const known = new Set<string>(secretCatalog.map(s => s.id));

export function foundSecrets(): SecretId[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(secretsKey) ?? '[]');
    return Array.isArray(saved) ? saved.filter((id): id is SecretId => typeof id === 'string' && known.has(id)) : [];
  } catch { return []; }
}

/** Records a secret and returns true the first time it is found. */
export function recordSecret(id: SecretId): boolean {
  const found = foundSecrets();
  if (found.includes(id)) return false;
  try { localStorage.setItem(secretsKey, JSON.stringify([...found, id])); } catch { /* This visit only. */ }
  window.dispatchEvent(new CustomEvent(secretEvent, { detail: id }));
  return true;
}

export function forgetSecrets() {
  try { localStorage.removeItem(secretsKey); } catch { /* Nothing stored. */ }
  window.dispatchEvent(new CustomEvent(secretEvent));
}
