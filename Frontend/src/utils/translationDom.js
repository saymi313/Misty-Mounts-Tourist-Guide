const BLOCKS = 'p,h1,h2,h3,h4,h5,h6,button,a,label,li,option,summary,figcaption,blockquote,td,th,legend,dt,dd';
const SKIP = 'script,style,noscript,code,pre,textarea,svg,[data-no-translate],[translate="no"],[contenteditable],[lang="ur"]:not(html)';
const CONTROLS = 'a,button,input,select,textarea,[role="button"],[contenteditable]';
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
const hasEnglish = text => /[A-Za-z]/.test(text);
const hasUrdu = text => /[\u0600-\u06ff]/.test(text);
const normalize = text => text.replace(/\s+/g, ' ').trim();

export function translationBatches(texts) {
  const batches = [];
  let batch = [], size = 0;
  for (const text of texts) {
    if (batch.length === 12 || size + text.length > 24000) {
      batches.push(batch); batch = []; size = 0;
    }
    batch.push(text); size += text.length;
  }
  if (batch.length) batches.push(batch);
  return batches;
}

// Keep React's text nodes intact. Only their values change, never their identity,
// parent or event handlers. Reconstruct English from our last writes on rescans.
export function createTranslationCollector() {
  const written = new WeakMap();
  const attributes = new WeakMap();
  const original = node => {
    const saved = written.get(node);
    return saved && saved.output === node.nodeValue ? saved.source : node.nodeValue;
  };
  return function collect(root) {
    const jobs = [], groups = new Map();
    const doc = root.ownerDocument || root;
    const walker = doc.createTreeWalker(root, 4); // SHOW_TEXT
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.closest(SKIP)) continue;
      const block = parent.closest(BLOCKS);
      const safe = block && root.contains(block) && !block.querySelector(`${CONTROLS},${SKIP}`) && !block.querySelector(BLOCKS);
      const owner = safe ? block : node;
      if (!groups.has(owner)) groups.set(owner, []);
      groups.get(owner).push(node);
    }
    for (const [owner, nodes] of groups) {
      const sources = nodes.map(original);
      const originals = new Map(nodes.map((item, index) => [item, sources[index]]));
      const read = item => item.nodeType === 3 ? originals.get(item) || '' : item.nodeName === 'BR' ? ' ' : Array.from(item.childNodes).map(read).join('');
      const source = normalize(read(owner));
      if (!source || !hasEnglish(source) || hasUrdu(source) || source.length > 6000) continue;
      // Place the complete Urdu sentence in one existing node. English emphasis
      // boundaries cannot safely represent Urdu's different word order.
      const target = sources.findIndex(text => text.trim());
      const snapshot = nodes.map(item => item.nodeValue);
      if (target < 0) continue;
      jobs.push({ key: source, apply(text) {
        if (!nodes.every((item, i) => item.isConnected && item.nodeValue === snapshot[i])) return;
        nodes.forEach((item, i) => {
          const output = i === target ? `${sources[0].match(/^\s*/)[0]}${text}${sources.at(-1).match(/\s*$/)[0]}` : '';
          written.set(item, { source: sources[i], output });
          if (item.nodeValue !== output) item.nodeValue = output;
        });
      } });
    }
    root.querySelectorAll('[placeholder],[title],[aria-label],[alt]').forEach(element => {
      if (element.closest(SKIP)) return;
      for (const attr of ATTRS) {
        const current = element.getAttribute(attr);
        const previous = attributes.get(element)?.[attr];
        const source = previous?.output === current ? previous.source : current;
        if (!source || !hasEnglish(source) || hasUrdu(source) || source.length > 6000) continue;
        jobs.push({ key: normalize(source), apply(text) {
          if (!element.isConnected || element.getAttribute(attr) !== current) return;
          attributes.set(element, { ...attributes.get(element), [attr]: { source, output: text } });
          if (current !== text) element.setAttribute(attr, text);
        } });
      }
    });
    return jobs;
  };
}
