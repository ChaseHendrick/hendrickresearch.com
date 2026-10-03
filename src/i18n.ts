// Interface translations. English is the default and the source text; a visitor whose browser prefers
// one of the other languages gets it automatically, and the Appearance panel lets anyone choose.
// Paper titles, project names and project descriptions stay in English.
export const languages = { en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch', pt: 'Português', ja: '日本語', zh: '中文' } as const;
export type Lang = keyof typeof languages;
export const languageKey = 'hendrick-language';

type Row = Partial<Record<Exclude<Lang, 'en'>, string>>;
// Keyed by the English text (or a data-i18n key for longer passages).
const t: Record<string, Row> = {
  // Navigation, shared on every page.
  'Home': { es: 'Inicio', fr: 'Accueil', de: 'Start', pt: 'Início', ja: 'ホーム', zh: '首页' },
  'Projects': { es: 'Proyectos', fr: 'Projets', de: 'Projekte', pt: 'Projetos', ja: 'プロジェクト', zh: '项目' },
  'Games': { es: 'Juegos', fr: 'Jeux', de: 'Spiele', pt: 'Jogos', ja: 'ゲーム', zh: '游戏' },
  'Music': { es: 'Música', fr: 'Musique', de: 'Musik', pt: 'Música', ja: '音楽', zh: '音乐' },
  'Sieges': { es: 'Asedios', fr: 'Sièges', de: 'Belagerungen', pt: 'Cercos', ja: '攻城戦', zh: '围城' },
  'Art': { es: 'Arte', fr: 'Art', de: 'Kunst', pt: 'Arte', ja: 'アート', zh: '艺术' },
  'Generative art': { es: 'Arte generativo', fr: 'Art génératif', de: 'Generative Kunst', pt: 'Arte generativa', ja: 'ジェネラティブアート', zh: '生成艺术' },
  'Research': { es: 'Investigación', fr: 'Recherche', de: 'Forschung', pt: 'Pesquisa', ja: '研究', zh: '研究' },
  'About': { es: 'Acerca de', fr: 'À propos', de: 'Über', pt: 'Sobre', ja: '概要', zh: '关于' },
  // Appearance panel.
  'Appearance': { es: 'Apariencia', fr: 'Apparence', de: 'Darstellung', pt: 'Aparência', ja: '表示', zh: '外观' },
  'Choose your preferred light.': { es: 'Elige el modo de color.', fr: 'Choisissez le mode d’affichage.', de: 'Wählen Sie die Darstellung.', pt: 'Escolha o modo de cor.', ja: '表示モードを選んでください。', zh: '选择显示模式。' },
  'Light': { es: 'Claro', fr: 'Clair', de: 'Hell', pt: 'Claro', ja: 'ライト', zh: '浅色' },
  'Dark': { es: 'Oscuro', fr: 'Sombre', de: 'Dunkel', pt: 'Escuro', ja: 'ダーク', zh: '深色' },
  'System': { es: 'Sistema', fr: 'Système', de: 'System', pt: 'Sistema', ja: 'システム', zh: '跟随系统' },
  'Follow your device': { es: 'Según tu dispositivo', fr: 'Selon votre appareil', de: 'Wie Ihr Gerät', pt: 'Igual ao dispositivo', ja: 'デバイスに合わせる', zh: '跟随设备' },
  'Language': { es: 'Idioma', fr: 'Langue', de: 'Sprache', pt: 'Idioma', ja: '言語', zh: '语言' },
  // Homepage.
  'hero.title': { es: 'Investigación, software<br /><em>y algunos juegos.</em>', fr: 'Recherche, logiciels<br /><em>et quelques jeux.</em>', de: 'Forschung, Software<br /><em>und ein paar Spiele.</em>', pt: 'Pesquisa, software<br /><em>e alguns jogos.</em>', ja: '研究とソフトウェア、<br /><em>それにゲームも少し。</em>', zh: '研究、软件<br /><em>和几款游戏。</em>' },
  'hero.desc': { es: 'Escribo demostraciones asistidas por computadora sobre vórtices, neuronas y células cardíacas, y en el camino creo herramientas y juegos. Cada artículo enlaza a su archivo y al código que lo verifica.', fr: 'J’écris des preuves assistées par ordinateur sur les tourbillons, les neurones et les cellules cardiaques, et je construis des outils et des jeux en chemin. Chaque article renvoie à son archive et au code qui le vérifie.', de: 'Ich schreibe computergestützte Beweise über Wirbel, Neuronen und Herzzellen und baue dabei Werkzeuge und Spiele. Jede Arbeit verweist auf ihr Archiv und den Code, der sie prüft.', pt: 'Escrevo demonstrações assistidas por computador sobre vórtices, neurônios e células cardíacas, e no caminho crio ferramentas e jogos. Cada artigo leva ao seu arquivo e ao código que o verifica.', ja: '渦、ニューロン、心筋細胞についての計算機援用証明を書き、その過程でツールやゲームも作っています。各論文にはアーカイブと検証コードへのリンクがあります。', zh: '我撰写关于涡旋、神经元和心肌细胞的计算机辅助证明，并在此过程中制作工具和游戏。每篇论文都链接到其存档和验证代码。' },
  'See the projects': { es: 'Ver los proyectos', fr: 'Voir les projets', de: 'Projekte ansehen', pt: 'Ver os projetos', ja: 'プロジェクトを見る', zh: '查看项目' },
  'Read the papers': { es: 'Leer los artículos', fr: 'Lire les articles', de: 'Arbeiten lesen', pt: 'Ler os artigos', ja: '論文を読む', zh: '阅读论文' },
  'intro.count': { es: '{p} proyectos y {n} preprints.', fr: '{p} projets et {n} prépublications.', de: '{p} Projekte und {n} Preprints.', pt: '{p} projetos e {n} preprints.', ja: '{p} 件のプロジェクトと {n} 本のプレプリント。', zh: '{p} 个项目和 {n} 篇预印本。' },
  'PROJECTS': { es: 'PROYECTOS', fr: 'PROJETS', de: 'PROJEKTE', pt: 'PROJETOS', ja: 'プロジェクト', zh: '项目' },
  'Things I’ve made.': { es: 'Cosas que he hecho.', fr: 'Ce que j’ai fait.', de: 'Was ich gebaut habe.', pt: 'Coisas que fiz.', ja: '作ったもの。', zh: '我做的东西。' },
  'projects.desc': { es: 'Software de investigación, pequeñas herramientas y juegos.<br />La mayoría son de código abierto.', fr: 'Logiciels de recherche, petits outils et jeux.<br />La plupart sont open source.', de: 'Forschungssoftware, kleine Werkzeuge und Spiele.<br />Die meisten sind Open Source.', pt: 'Software de pesquisa, pequenas ferramentas e jogos.<br />A maioria é de código aberto.', ja: '研究用ソフトウェア、小さなツール、ゲーム。<br />ほとんどがオープンソースです。', zh: '研究软件、小工具和游戏。<br />大多数是开源的。' },
  'All work': { es: 'Todo', fr: 'Tout', de: 'Alles', pt: 'Tudo', ja: 'すべて', zh: '全部' },
  'Tools': { es: 'Herramientas', fr: 'Outils', de: 'Werkzeuge', pt: 'Ferramentas', ja: 'ツール', zh: '工具' },
  'Play': { es: 'Juegos', fr: 'Jeux', de: 'Spiele', pt: 'Jogos', ja: '遊び', zh: '娱乐' },
  'FEATURED': { es: 'DESTACADO', fr: 'À LA UNE', de: 'IM FOKUS', pt: 'DESTAQUE', ja: '注目', zh: '精选' },
  'The simulation workspace behind the papers.': { es: 'El espacio de simulación detrás de los artículos.', fr: 'L’atelier de simulation derrière les articles.', de: 'Die Simulationsumgebung hinter den Arbeiten.', pt: 'O ambiente de simulação por trás dos artigos.', ja: '論文を支えるシミュレーション環境。', zh: '论文背后的仿真工作区。' },
  'Show all projects': { es: 'Ver todos los proyectos', fr: 'Voir tous les projets', de: 'Alle Projekte zeigen', pt: 'Ver todos os projetos', ja: 'すべてのプロジェクトを表示', zh: '显示全部项目' },
  'PAPERS': { es: 'ARTÍCULOS', fr: 'ARTICLES', de: 'ARBEITEN', pt: 'ARTIGOS', ja: '論文', zh: '论文' },
  'Preprints.': { es: 'Preprints.', fr: 'Prépublications.', de: 'Preprints.', pt: 'Preprints.', ja: 'プレプリント。', zh: '预印本。' },
  'papers.desc': { es: 'Cada uno enlaza a su PDF archivado,<br />su DOI y los programas que lo respaldan.', fr: 'Chacun renvoie à son PDF archivé,<br />à son DOI et aux programmes associés.', de: 'Jede verweist auf ihr archiviertes PDF,<br />ihren DOI und die Programme dahinter.', pt: 'Cada um leva ao seu PDF arquivado,<br />ao seu DOI e aos programas por trás dele.', ja: '各論文はアーカイブ済みPDF、<br />DOI、関連プログラムにリンクしています。', zh: '每篇都链接到存档的 PDF、<br />DOI 及其背后的程序。' },
  'Preprints. Not yet peer reviewed.': { es: 'Preprints. Aún sin revisión por pares.', fr: 'Prépublications. Pas encore évaluées par des pairs.', de: 'Preprints. Noch nicht begutachtet.', pt: 'Preprints. Ainda sem revisão por pares.', ja: 'プレプリント。査読はまだです。', zh: '预印本，尚未经过同行评审。' },
  'All topics': { es: 'Todos los temas', fr: 'Tous les sujets', de: 'Alle Themen', pt: 'Todos os temas', ja: 'すべての分野', zh: '全部主题' },
  'Search papers': { es: 'Buscar artículos', fr: 'Rechercher des articles', de: 'Arbeiten suchen', pt: 'Buscar artigos', ja: '論文を検索', zh: '搜索论文' },
  'ABOUT': { es: 'ACERCA DE', fr: 'À PROPOS', de: 'ÜBER', pt: 'SOBRE', ja: '概要', zh: '关于' },
  'About this site.': { es: 'Sobre este sitio.', fr: 'À propos de ce site.', de: 'Über diese Seite.', pt: 'Sobre este site.', ja: 'このサイトについて。', zh: '关于本站。' },
  'about.p1': { es: 'Aquí guardo lo que hago: demostraciones asistidas por computadora y las simulaciones detrás de ellas, pequeñas herramientas, juegos y software musical.', fr: 'C’est ici que je range ce que je fais : des preuves assistées par ordinateur et les simulations derrière elles, de petits outils, des jeux et des logiciels musicaux.', de: 'Hier sammle ich, was ich mache: computergestützte Beweise und die Simulationen dahinter, kleine Werkzeuge, Spiele und Musiksoftware.', pt: 'Aqui guardo o que faço: demonstrações assistidas por computador e as simulações por trás delas, pequenas ferramentas, jogos e software musical.', ja: 'ここには私が作ったものを置いています。計算機援用証明とその裏にあるシミュレーション、小さなツール、ゲーム、音楽ソフトウェアです。', zh: '这里存放我做的东西：计算机辅助证明及其背后的仿真、小工具、游戏和音乐软件。' },
  'about.p2': { es: 'Construyo la mayor parte con asistentes de programación de IA. Yo elijo las preguntas y compruebo los resultados, y donde el código es público está enlazado para que tú también puedas comprobarlos. Los artículos son preprints sin revisión por pares; cada uno indica qué se comprobó y qué no.', fr: 'Je construis l’essentiel avec des assistants de programmation par IA. Je choisis les questions et je vérifie les résultats ; quand le code est public, il est en lien pour que vous puissiez vérifier aussi. Les articles sont des prépublications non évaluées par des pairs ; chacun précise ce qui a été vérifié et ce qui ne l’a pas été.', de: 'Das meiste baue ich mit KI-Programmierassistenten. Ich wähle die Fragen und prüfe die Ergebnisse; wo der Code öffentlich ist, ist er verlinkt, damit Sie sie ebenfalls prüfen können. Die Arbeiten sind nicht begutachtete Preprints; jede sagt, was geprüft wurde und was nicht.', pt: 'Construo a maior parte com assistentes de programação de IA. Eu escolho as perguntas e confiro os resultados, e onde o código é público ele está no link para que você também confira. Os artigos são preprints sem revisão por pares; cada um diz o que foi e o que não foi verificado.', ja: 'ほとんどはAIコーディングアシスタントを使って作っています。問いを選び結果を確かめるのは私で、コードが公開されているものはリンクしてあるので、あなたも確かめられます。論文は査読前のプレプリントで、何を確認し何を確認していないかをそれぞれ明記しています。', zh: '这些大多是我借助 AI 编程助手完成的。问题由我选择，结果由我检查；凡是公开的代码都附有链接，你也可以自己检查。论文是未经同行评审的预印本，每篇都说明了检查过和未检查的内容。' },
  'Corrections and questions are welcome on GitHub.': { es: 'Correcciones y preguntas son bienvenidas en GitHub.', fr: 'Corrections et questions sont les bienvenues sur GitHub.', de: 'Korrekturen und Fragen gern auf GitHub.', pt: 'Correções e perguntas são bem-vindas no GitHub.', ja: '訂正や質問はGitHubでどうぞ。', zh: '欢迎在 GitHub 上提出更正和问题。' },
  'Back to top ↑': { es: 'Volver arriba ↑', fr: 'Haut de page ↑', de: 'Nach oben ↑', pt: 'Voltar ao topo ↑', ja: 'トップへ ↑', zh: '回到顶部 ↑' },
};

export function preferredLanguage(): Lang {
  try { const saved = localStorage.getItem(languageKey); if (saved && saved in languages) return saved as Lang; } catch { /* storage unavailable */ }
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = (tag || '').toLowerCase().split('-')[0];
    if (base in languages) return base as Lang;
  }
  return 'en';
}

const fill = (text: string, el: Element) => text.replace(/\{(\w+)\}/g, (_, k) => el.getAttribute(`data-i18n-${k}`) ?? '');

/** Translate everything marked with data-i18n, plus navigation, buttons and labels whose text is a known English string. */
export function applyLanguage(lang: Lang, root: ParentNode = document) {
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n!;
    if (el.dataset.i18nEn === undefined) el.dataset.i18nEn = el.innerHTML;
    const text = lang === 'en' ? el.dataset.i18nEn : t[key]?.[lang];
    if (text) el.innerHTML = fill(text, el);
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder!;
    (el as HTMLInputElement).placeholder = lang === 'en' ? key : t[key]?.[lang] ?? key;
  });
  root.querySelectorAll<HTMLElement>('nav a, .filter, .paper-filter, .appearance legend, .appearance p, .appearance label > span, .appearance small, .appearance-toggle > span, .footer-links a').forEach(el => {
    if (el.children.length) return;
    if (el.dataset.i18nEn === undefined) el.dataset.i18nEn = el.textContent!.trim();
    const en = el.dataset.i18nEn;
    const text = lang === 'en' ? en : t[en]?.[lang];
    if (text) el.textContent = text;
  });
}
