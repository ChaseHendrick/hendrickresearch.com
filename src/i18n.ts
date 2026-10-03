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
  'hero.title': { es: 'Investigación computacional<br /><em>y software.</em>', fr: 'Recherche computationnelle<br /><em>et logiciels.</em>', de: 'Computergestützte Forschung<br /><em>und Software.</em>', pt: 'Pesquisa computacional<br /><em>e software.</em>', ja: '計算科学研究と<br /><em>ソフトウェア。</em>', zh: '计算研究<br /><em>与软件。</em>' },
  'hero.desc': { es: 'Hendrick Research desarrolla demostraciones asistidas por computadora en dinámica de fluidos, sistemas dinámicos y biología matemática, junto con software de investigación abierto, simulaciones y herramientas interactivas. Cada resultado se archiva con los programas que lo verifican.', fr: 'Hendrick Research développe des preuves assistées par ordinateur en dynamique des fluides, systèmes dynamiques et biologie mathématique, ainsi que des logiciels de recherche ouverts, des simulations et des outils interactifs. Chaque résultat est archivé avec les programmes qui le vérifient.', de: 'Hendrick Research entwickelt computergestützte Beweise in Strömungsdynamik, dynamischen Systemen und mathematischer Biologie sowie offene Forschungssoftware, Simulationen und interaktive Werkzeuge. Jedes Ergebnis wird mit den Programmen archiviert, die es prüfen.', pt: 'A Hendrick Research desenvolve demonstrações assistidas por computador em dinâmica dos fluidos, sistemas dinâmicos e biologia matemática, além de software de pesquisa aberto, simulações e ferramentas interativas. Cada resultado é arquivado com os programas que o verificam.', ja: 'Hendrick Research は、流体力学、力学系、数理生物学における計算機援用証明と、オープンな研究用ソフトウェア、シミュレーション、インタラクティブツールを開発しています。すべての結果は検証プログラムとともにアーカイブされています。', zh: 'Hendrick Research 在流体力学、动力系统和数学生物学领域开展计算机辅助证明，并开发开放的研究软件、仿真和交互式工具。每项结果都与验证它的程序一同存档。' },
  'View the work': { es: 'Ver el trabajo', fr: 'Voir les travaux', de: 'Arbeiten ansehen', pt: 'Ver o trabalho', ja: '成果を見る', zh: '查看成果' },
  'Read the publications': { es: 'Leer las publicaciones', fr: 'Lire les publications', de: 'Publikationen lesen', pt: 'Ler as publicações', ja: '論文を読む', zh: '阅读出版物' },
  'intro.count': { es: '{p} proyectos y {n} preprints.', fr: '{p} projets et {n} prépublications.', de: '{p} Projekte und {n} Preprints.', pt: '{p} projetos e {n} preprints.', ja: '{p} 件のプロジェクトと {n} 本のプレプリント。', zh: '{p} 个项目和 {n} 篇预印本。' },
  'PROJECTS': { es: 'PROYECTOS', fr: 'PROJETS', de: 'PROJEKTE', pt: 'PROJETOS', ja: 'プロジェクト', zh: '项目' },
  'Research software and tools.': { es: 'Software de investigación y herramientas.', fr: 'Logiciels de recherche et outils.', de: 'Forschungssoftware und Werkzeuge.', pt: 'Software de pesquisa e ferramentas.', ja: '研究用ソフトウェアとツール。', zh: '研究软件与工具。' },
  'projects.desc': { es: 'Entornos de simulación, herramientas de análisis<br />y trabajo interactivo. La mayoría es de código abierto.', fr: 'Environnements de simulation, outils d’analyse<br />et travaux interactifs. La plupart sont open source.', de: 'Simulationsumgebungen, Analysewerkzeuge<br />und interaktive Arbeiten. Die meisten sind Open Source.', pt: 'Ambientes de simulação, ferramentas de análise<br />e trabalhos interativos. A maioria é de código aberto.', ja: 'シミュレーション環境、解析ツール、<br />インタラクティブな作品。ほとんどがオープンソースです。', zh: '仿真环境、分析工具<br />和交互作品。大多数是开源的。' },
  'All work': { es: 'Todo', fr: 'Tout', de: 'Alles', pt: 'Tudo', ja: 'すべて', zh: '全部' },
  'Tools': { es: 'Herramientas', fr: 'Outils', de: 'Werkzeuge', pt: 'Ferramentas', ja: 'ツール', zh: '工具' },
  'Play': { es: 'Juegos', fr: 'Jeux', de: 'Spiele', pt: 'Jogos', ja: '遊び', zh: '娱乐' },
  'FEATURED': { es: 'DESTACADO', fr: 'À LA UNE', de: 'IM FOKUS', pt: 'DESTAQUE', ja: '注目', zh: '精选' },
  'The simulation environment behind the publications.': { es: 'El entorno de simulación detrás de las publicaciones.', fr: 'L’environnement de simulation derrière les publications.', de: 'Die Simulationsumgebung hinter den Publikationen.', pt: 'O ambiente de simulação por trás das publicações.', ja: '論文を支えるシミュレーション環境。', zh: '出版物背后的仿真环境。' },
  'Show all projects': { es: 'Ver todos los proyectos', fr: 'Voir tous les projets', de: 'Alle Projekte zeigen', pt: 'Ver todos os projetos', ja: 'すべてのプロジェクトを表示', zh: '显示全部项目' },
  'PUBLICATIONS': { es: 'PUBLICACIONES', fr: 'PUBLICATIONS', de: 'PUBLIKATIONEN', pt: 'PUBLICAÇÕES', ja: '論文', zh: '出版物' },
  'Publications.': { es: 'Publicaciones.', fr: 'Publications.', de: 'Publikationen.', pt: 'Publicações.', ja: '論文。', zh: '出版物。' },
  'papers.desc': { es: 'Preprints archivados en Zenodo, cada uno con<br />su DOI y los programas que lo verifican.', fr: 'Prépublications archivées sur Zenodo, chacune avec<br />son DOI et les programmes qui la vérifient.', de: 'Auf Zenodo archivierte Preprints, jeweils mit<br />DOI und den Programmen, die sie prüfen.', pt: 'Preprints arquivados no Zenodo, cada um com<br />seu DOI e os programas que o verificam.', ja: 'Zenodo にアーカイブされたプレプリント。<br />各論文に DOI と検証プログラムがあります。', zh: '存档于 Zenodo 的预印本，<br />每篇附有 DOI 及验证程序。' },
  'Preprints. Not yet peer reviewed.': { es: 'Preprints. Aún sin revisión por pares.', fr: 'Prépublications. Pas encore évaluées par des pairs.', de: 'Preprints. Noch nicht begutachtet.', pt: 'Preprints. Ainda sem revisão por pares.', ja: 'プレプリント。査読はまだです。', zh: '预印本，尚未经过同行评审。' },
  'All topics': { es: 'Todos los temas', fr: 'Tous les sujets', de: 'Alle Themen', pt: 'Todos os temas', ja: 'すべての分野', zh: '全部主题' },
  'Search papers': { es: 'Buscar artículos', fr: 'Rechercher des articles', de: 'Arbeiten suchen', pt: 'Buscar artigos', ja: '論文を検索', zh: '搜索论文' },
  'ABOUT': { es: 'ACERCA DE', fr: 'À PROPOS', de: 'ÜBER', pt: 'SOBRE', ja: '概要', zh: '关于' },
  'About Hendrick Research.': { es: 'Acerca de Hendrick Research.', fr: 'À propos de Hendrick Research.', de: 'Über Hendrick Research.', pt: 'Sobre a Hendrick Research.', ja: 'Hendrick Research について。', zh: '关于 Hendrick Research。' },
  'about.p1': { es: 'Hendrick Research es una práctica de investigación independiente en la intersección de las matemáticas, la computación y las ciencias de la vida. Su trabajo se centra en resultados rigurosos asistidos por computadora: demostraciones en las que cada desigualdad se decide con aritmética de intervalos o de bolas.', fr: 'Hendrick Research est une structure de recherche indépendante à la croisée des mathématiques, du calcul et des sciences du vivant. Ses travaux portent sur des résultats rigoureux assistés par ordinateur : des preuves dont chaque inégalité est tranchée en arithmétique d’intervalles ou de boules.', de: 'Hendrick Research ist eine unabhängige Forschungspraxis an der Schnittstelle von Mathematik, Informatik und Lebenswissenschaften. Im Mittelpunkt stehen rigorose computergestützte Ergebnisse: Beweise, in denen jede Ungleichung in Intervall- oder Ballarithmetik entschieden wird.', pt: 'A Hendrick Research é uma prática de pesquisa independente na interseção entre matemática, computação e ciências da vida. Seu trabalho se concentra em resultados rigorosos assistidos por computador: demonstrações em que cada desigualdade é decidida em aritmética intervalar ou de bolas.', ja: 'Hendrick Research は、数学・計算・生命科学が交わる領域で活動する独立した研究組織です。中心となるのは厳密な計算機援用の結果、つまりすべての不等式を区間演算またはボール演算で判定する証明です。', zh: 'Hendrick Research 是一家位于数学、计算与生命科学交叉领域的独立研究机构，工作重点是严格的计算机辅助结果：每个不等式都用区间或球算术判定的证明。' },
  'about.p2': { es: 'El software se desarrolla con programación asistida por IA bajo dirección humana; las preguntas, los métodos y la verificación los fija y comprueba una persona. Los resultados se publican como preprints con sus programas y datos, y cada artículo indica qué se verificó y qué no. Ninguno ha sido revisado por pares todavía.', fr: 'Les logiciels sont développés avec une programmation assistée par IA sous direction humaine ; les questions, les méthodes et la vérification sont fixées et contrôlées par une personne. Les résultats sont publiés en prépublications avec leurs programmes et données, et chaque article précise ce qui a été vérifié et ce qui ne l’a pas été. Aucun n’a encore été évalué par des pairs.', de: 'Die Software entsteht mit KI-gestützter Programmierung unter menschlicher Leitung; Fragen, Methoden und Prüfung legt ein Mensch fest und kontrolliert sie. Ergebnisse erscheinen als Preprints mit Programmen und Daten, und jede Arbeit sagt, was geprüft wurde und was nicht. Keine ist bisher begutachtet.', pt: 'O software é desenvolvido com programação assistida por IA sob direção humana; as perguntas, os métodos e a verificação são definidos e conferidos por uma pessoa. Os resultados são publicados como preprints com seus programas e dados, e cada artigo diz o que foi e o que não foi verificado. Nenhum foi revisado por pares ainda.', ja: 'ソフトウェアは人間の指示のもとAI支援プログラミングで開発されており、問い・手法・検証は人が設定し確認しています。結果はプログラムとデータとともにプレプリントとして公開され、各論文には何を検証し何を検証していないかが明記されています。いずれもまだ査読を受けていません。', zh: '软件在人工指导下借助 AI 辅助编程开发；问题、方法和验证均由人设定并检查。结果以预印本形式连同程序和数据一起发布，每篇论文都说明了验证过和未验证的内容。目前均未经同行评审。' },
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
