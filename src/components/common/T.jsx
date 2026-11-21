import { useLanguage } from '../../context/LanguageContext';

// Renders translated text. English mode: English only. Kannada mode: Kannada with English beneath.
export default function T({ k, vars, as: Tag = 'span', className = '', inline = false }) {
  const { bilingual } = useLanguage();
  const { primary, secondary, fallback } = bilingual(k, vars);
  if (!secondary) {
    return (
      <Tag className={className || undefined} {...(fallback ? { 'data-fallback': 'true', title: 'Translation pending: showing English' } : {})}>
        {primary}
      </Tag>
    );
  }
  return (
    <Tag className={`bi${inline ? ' bi--inline' : ''} ${className}`.trim()}>
      <span className="bi__primary" lang="kn">{primary}</span>
      <span className="bi__secondary" lang="en">{secondary}</span>
    </Tag>
  );
}
