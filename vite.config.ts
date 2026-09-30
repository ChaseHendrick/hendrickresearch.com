import { defineConfig } from 'vite';
import { renderPage } from './src/page';
import { papers, projects, profile } from './src/content';
import { renderCatalog, type CatalogEntry } from './src/catalog-ui';
import catalogData from './src/genchase-data.json';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {rollupOptions: {input: {home:fileURLToPath(new URL('./index.html',import.meta.url)),genchase:fileURLToPath(new URL('./genchase/index.html',import.meta.url))}}},
  plugins: [{
    name: 'prerender-portfolio',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if(html.includes('<!--catalog-html-->')) {
          const entries = catalogData.entries as CatalogEntry[];
          const schema = {'@context':'https://schema.org','@type':'CollectionPage',name:'GENChase public technique catalog',url:'https://www.hendrickresearch.com/genchase/',author:{'@type':'Person',name:profile.name},mainEntity:{'@type':'ItemList',numberOfItems:entries.length,itemListElement:entries.map((entry,index) => ({'@type':'ListItem',position:index+1,item:{'@type':'CreativeWork',name:entry.title,description:entry.description}}))}};
          const rendered = renderCatalog(entries,{areas:catalogData.workspaceAreas,tools:catalogData.workspaceTools});
          return html.replace('<!--catalog-html-->',rendered).replace('</head>',`<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script><noscript><style>.catalog-search-field,.catalog-selectors,.catalog-toolbar,.catalog-categories,.catalog-more,.catalog-card-open{display:none!important}</style></noscript></head>`);
        }
        const catalog = {
          '@context': 'https://schema.org',
          '@graph': [
            ...projects.map(project => ({'@type':'SoftwareSourceCode',name:project.name,description:project.description,...(!project.privateWorkspace ? {codeRepository:project.source} : {}),url:project.launch?.startsWith('/') ? `https://www.hendrickresearch.com${project.launch}` : project.launch ?? project.source,author:{'@type':'Person',name:profile.name}})),
            ...papers.map(paper => ({'@type':'ScholarlyArticle',headline:paper.title,description:paper.summary,url:paper.doi,genre:'Preprint',author:{'@type':'Person',name:profile.name,sameAs:profile.orcid},encoding:{'@type':'MediaObject',contentUrl:paper.pdf,encodingFormat:'application/pdf'}})),
          ],
        };
        const json = JSON.stringify(catalog).replace(/</g,'\\u003c');
        return html.replace('<!--app-html-->', renderPage()).replace('</head>',`<script type="application/ld+json">${json}</script></head>`);
      },
    },
  }],
});
