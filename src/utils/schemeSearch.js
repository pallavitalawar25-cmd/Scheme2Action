import en from '../translations/en';
import kn from '../translations/kn';

const dict = { en, kn };
const norm = (s) => (s || '').toString().toLowerCase();

// Searchable text in BOTH languages so English and Kannada queries work in either UI language.
function haystack(scheme) {
  const get = (f) => `${en[`scheme.${scheme.id}.${f}`] || ''} ${kn[`scheme.${scheme.id}.${f}`] || ''}`;
  return {
    name: norm(get('name')),
    short: norm(`${get('short')} ${get('dept')} ${get('audience')}`),
    keywords: norm(scheme.keywords.join(' ')),
    category: norm(`${en[`cat.${scheme.category}`] || ''} ${kn[`cat.${scheme.category}`] || ''}`),
  };
}

export function scoreScheme(scheme, query) {
  const q = norm(query).trim();
  if (!q) return 1;
  const h = haystack(scheme);
  const terms = q.split(/\s+/);
  let total = 0;
  for (const term of terms) {
    let s = 0;
    if (h.name.includes(term)) s += 4;
    if (h.keywords.includes(term)) s += 3;
    if (h.category.includes(term)) s += 2;
    if (h.short.includes(term)) s += 1;
    if (!s) return 0; // every term must match something
    total += s;
  }
  return total;
}

export function filterSchemes(list, { q = '', categories = [], level = 'all', statuses = [] }) {
  return list
    .map((s) => ({ s, score: scoreScheme(s, q) }))
    .filter(({ s, score }) => score > 0
      && (!categories.length || categories.includes(s.category))
      && (level === 'all' || s.level === level)
      && (!statuses.length || statuses.includes(s.status)))
    .map((x) => x);
}

export function sortSchemes(entries, sort, language) {
  const copy = [...entries];
  if (sort === 'name') {
    const locale = language === 'kn' ? 'kn' : 'en';
    copy.sort((a, b) => (dict[language][`scheme.${a.s.id}.name`] || en[`scheme.${a.s.id}.name`]).localeCompare(dict[language][`scheme.${b.s.id}.name`] || en[`scheme.${b.s.id}.name`], locale));
  } else if (sort === 'updated') {
    copy.sort((a, b) => b.s.lastUpdated.localeCompare(a.s.lastUpdated));
  } else {
    copy.sort((a, b) => b.score - a.score);
  }
  return copy.map((x) => x.s);
}
