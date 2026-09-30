import { transformWithEsbuild } from 'vite';

export async function compactBrowserAsset(source: string, filename: string): Promise<string> {
  const loader = filename.endsWith('.css') ? 'css' : 'js';
  const result = await transformWithEsbuild(source,filename,{loader,minify:true,sourcemap:false,target:'es2020',legalComments:'eof'});
  return result.code;
}

/** Compact public browser code while retaining required dependency notices. */
export async function compactGameHTML(html: string, filename: string): Promise<string> {
  const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let output='',last=0;
  for (const match of html.matchAll(pattern)) {
    const attributes=match[1],source=match[2],index=match.index!;
    output+=html.slice(last,index);last=index+match[0].length;
    const type=attributes.match(/type=["']([^"']*)["']/i)?.[1];
    if(!source.trim() || /\bsrc\s*=/.test(attributes) || (type && !['module','text/javascript','application/javascript'].includes(type))) {output+=match[0];continue;}
    const result=await transformWithEsbuild(source,filename,{loader:'js',minify:true,sourcemap:false,target:'es2020',legalComments:'eof'});
    output+=`<script${attributes}>${result.code.replace(/<\/script/gi,'<\\/script')}</script>`;
  }
  return output+html.slice(last);
}
