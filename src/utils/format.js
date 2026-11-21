export const formatDate = (iso, language) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(language === 'kn' ? 'kn-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
};
