const origin = 'https://www.hendrickresearch.com';
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const decode = (value: string) => value.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&#x27;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const json = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
function meta(html: string, key: string): string {
  const tag = html.match(new RegExp(`<meta\\b[^>]*(?:name|property)="${key}"[^>]*>`, 'i'))?.[0];
  return decode(tag?.match(/content="([^"]*)"/)?.[1] ?? '');
}

/** Add metadata to a verified atlas export without changing its content or evidence. */
export function atlasSEO(html: string, relativePath: string, duplicateTitle: boolean): string {
  if (relativePath === 'offline.html') {
    return html.replace('</head>', `<meta name="robots" content="noindex,follow"/><link rel="canonical" href="${origin}/fibers/"/></head>`);
  }
  const url = origin + '/fibers/' + relativePath.replace(/index\.html$/, '');
  let title = decode(html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? 'Fibers of Earth');
  let description = meta(html, 'description');
  const record = relativePath.match(/-(q\d+)\//i)?.[1]?.toUpperCase();
  if (duplicateTitle && record) {
    title = title.replace(' | Fibers of Earth', `: Catalog Record ${record} | Fibers of Earth`);
    description += ` Catalog source: Wikidata ${record}.`;
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escape(title)}</title>`)
      .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${escape(description)}"/>`);
  }
  const tags: Record<string, string> = {
    'og:type': relativePath === 'index.html' ? 'website' : 'article',
    'og:title': title, 'og:description': description, 'og:url': url,
    'og:image': origin + '/social-card.png', 'og:site_name': 'Hendrick Research',
    'twitter:card': 'summary_large_image', 'twitter:title': title,
    'twitter:description': description, 'twitter:image': origin + '/social-card.png',
  };
  for (const [key, value] of Object.entries(tags)) {
    const tag = `<meta ${key.startsWith('og:') ? 'property' : 'name'}="${key}" content="${escape(value)}"/>`;
    const existing = new RegExp(`<meta\\b[^>]*(?:name|property)="${key}"[^>]*>`, 'i');
    html = existing.test(html) ? html.replace(existing, tag) : html.replace('</head>', tag + '</head>');
  }
  if (!html.includes('application/ld+json')) {
    html = html.replace('</head>', `<script type="application/ld+json">${json({'@context':'https://schema.org','@type':'CollectionPage',name:title,description,url,inLanguage:'en',isPartOf:{'@type':'WebSite',name:'Hendrick Research',url:origin+'/'}})}</script></head>`);
  }
  const section = relativePath.split('/')[0];
  const labels: Record<string,string> = {materials:'Materials',glossary:'Textile glossary',weaves:'Weaves and patterns',learn:'Field notes',brands:'Brand directory',mills:'Mill directory'};
  const parts = [{name:'Hendrick Research',item:origin+'/'},{name:'Fibers of Earth',item:origin+'/fibers/'}];
  if (labels[section] && relativePath !== section+'/index.html') parts.push({name:labels[section],item:origin+'/fibers/'+section+'/'});
  if (relativePath !== 'index.html') parts.push({name:title.replace(/ \| Fibers of Earth$/, ''),item:url});
  return html.replace('</head>', `<script type="application/ld+json">${json({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:parts.map((p,i)=>({'@type':'ListItem',position:i+1,...p}))})}</script></head>`);
}
