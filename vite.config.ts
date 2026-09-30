import { defineConfig } from 'vite';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderPage } from './src/page';
import { papers, projects, profile } from './src/content';
import { renderCatalog, type CatalogEntry } from './src/catalog-ui';
import catalogData from './src/genchase-data.json';
import { gamePages, renderGamePage } from './src/game-pages';
import { contentPages, renderContentPage, pageHead, origin } from './src/content-pages';

const entries = catalogData.entries as CatalogEntry[];
const editorialPages = contentPages();
const xml = (value: string) => value.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
const input = {home:fileURLToPath(new URL('./index.html',import.meta.url)),genchase:fileURLToPath(new URL('./genchase/index.html',import.meta.url)),editorial:fileURLToPath(new URL('./editorial/index.html',import.meta.url)),...Object.fromEntries(gamePages.map(g=>[g.id,fileURLToPath(new URL(`./${g.htmlFile}`,import.meta.url))]))};

export default defineConfig({
  appType: 'mpa',
  build: {rollupOptions: {input}},
  plugins: [{
    name: 'prerender-portfolio',
    enforce: 'post',
    configureServer(server) {
      server.middlewares.use(async (req,res,next)=>{
        const route=(req.url??'').split('?')[0];
        const page=editorialPages.find(p=>p.route===route);
        if(!page)return next();
        try {
          const template=readFileSync(fileURLToPath(new URL('./editorial/index.html',import.meta.url)),'utf8');
          const html=template.replace('<!--editorial-head-->',pageHead(page)).replace('<!--editorial-body-->',renderContentPage(page));
          res.setHeader('Content-Type','text/html');res.end(await server.transformIndexHtml(route,html));
        } catch(error){next(error);}
      });
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if(html.includes('<!--editorial-head-->'))return html;
        const game=gamePages.find(g=>html.includes(`data-game="${g.id}"`));
        if(game){
          const head=pageHead({route:game.route,title:`Play ${game.title} in Your Browser | Hendrick Research`,description:game.description,schema:{'@type':['VideoGame','WebApplication'],name:game.title,applicationCategory:'GameApplication',operatingSystem:'Web browser',url:origin+game.route,isAccessibleForFree:true}});
          return html.replace(/<title>[^<]*<\/title>/,'').replace(/<meta name="description"[^>]*\/>/,'').replace('</head>',head+'</head>').replace('<div id="app"></div>',`<div id="app">${renderGamePage(game)}</div>`);
        }
        if(html.includes('<!--catalog-html-->')) {
          const schema = {'@context':'https://schema.org','@type':'CollectionPage',name:'GENChase public technique catalog',url:origin+'/genchase/',mainEntity:{'@type':'ItemList',numberOfItems:entries.length,itemListElement:entries.map((entry,index) => ({'@type':'ListItem',position:index+1,item:{'@type':'CreativeWork',name:entry.title,description:entry.description,url:`${origin}/genchase/${entry.id}/`,...(entry.previews?.[0] ? {image:origin+entry.previews[0].image} : {})}}))}};
          return html.replace('<!--catalog-html-->',renderCatalog(entries,{areas:catalogData.workspaceAreas,tools:catalogData.workspaceTools})).replace('</head>',`<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script><noscript><style>.catalog-search-field,.catalog-selectors,.catalog-toolbar,.catalog-categories,.catalog-more,.catalog-card-open{display:none!important}</style></noscript></head>`);
        }
        if(!html.includes('<!--app-html-->'))return html;
        const catalog = {'@context':'https://schema.org','@graph':[
          ...projects.map(p=>({'@type':'SoftwareSourceCode',name:p.name,description:p.description,...(!p.privateWorkspace ? {codeRepository:p.source}:{}),url:p.launch?.startsWith('/') ? origin+p.launch:p.launch??p.source,author:{'@type':'Person',name:profile.name}})),
          ...papers.map(p=>({'@type':'ScholarlyArticle',headline:p.title,description:p.summary,url:p.doi,genre:'Preprint',author:{'@type':'Person',name:profile.name,sameAs:profile.orcid},encoding:{'@type':'MediaObject',contentUrl:p.pdf,encodingFormat:'application/pdf'}})),
        ]};
        return html.replace('<!--app-html-->',renderPage()).replace('</head>',`<script type="application/ld+json">${JSON.stringify(catalog).replace(/</g,'\\u003c')}</script></head>`);
      },
    },
    generateBundle(_,bundle) {
      const template=bundle['editorial/index.html'];
      if(!template || template.type!=='asset')throw new Error('Missing editorial page template');
      const source=String(template.source);
      for(const page of editorialPages){this.emitFile({type:'asset',fileName:page.route.slice(1)+'index.html',source:source.replace('<!--editorial-head-->',pageHead(page)).replace('<!--editorial-body-->',renderContentPage(page))});}
      delete bundle['editorial/index.html'];
      const routes=['/','/genchase/',...gamePages.map(g=>g.route),...editorialPages.map(p=>p.route)];
      const sitemap=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${routes.map(route=>{const entry=entries.find(e=>route===`/genchase/${e.id}/`);return `<url><loc>${origin}${route}</loc>${entry?.previews?.map(p=>`<image:image><image:loc>${xml(origin+p.image)}</image:loc></image:image>`).join('')??''}</url>`;}).join('')}</urlset>`;
      this.emitFile({type:'asset',fileName:'sitemap-site.xml',source:sitemap});
      const fibersSitemap=existsSync(fileURLToPath(new URL('./public/fibers/sitemap.xml',import.meta.url))) ? `<sitemap><loc>${origin}/fibers/sitemap.xml</loc></sitemap>`:'';
      this.emitFile({type:'asset',fileName:'sitemap.xml',source:`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${origin}/sitemap-site.xml</loc></sitemap>${fibersSitemap}</sitemapindex>`});
    },
  }],
});
