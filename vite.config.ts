import { defineConfig } from 'vite';
import { renderPage } from './src/page';
import { papers, projects, profile } from './src/content';

export default defineConfig({
  plugins: [{
    name: 'prerender-portfolio',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const catalog = {
          '@context': 'https://schema.org',
          '@graph': [
            ...projects.map(project => ({'@type':'SoftwareSourceCode',name:project.name,description:project.description,codeRepository:project.source,url:project.launch ?? project.source,author:{'@type':'Person',name:profile.name}})),
            ...papers.map(paper => ({'@type':'ScholarlyArticle',headline:paper.title,description:paper.summary,url:paper.doi,genre:'Preprint',author:{'@type':'Person',name:profile.name,sameAs:profile.orcid},encoding:{'@type':'MediaObject',contentUrl:paper.pdf,encodingFormat:'application/pdf'}})),
          ],
        };
        const json = JSON.stringify(catalog).replace(/</g,'\\u003c');
        return html.replace('<!--app-html-->', renderPage()).replace('</head>',`<script type="application/ld+json">${json}</script></head>`);
      },
    },
  }],
});
