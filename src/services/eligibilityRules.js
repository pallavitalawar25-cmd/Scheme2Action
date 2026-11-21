// Configurable demonstration rules only. Replace with scheme rules reviewed against official sources.
export const eligibilityRules = {
  'ssp-post-matric-scholarship': [
    { id: 'student', answer: 'yes' },
    { id: 'karnataka', answer: 'yes' },
    { id: 'postMatric', answer: 'yes' },
    { id: 'incomeKnown', answer: 'yes', when: (answers) => answers.student === 'yes' },
  ],
};

export function assessEligibility(schemeId, answers) {
  const rules = eligibilityRules[schemeId];
  if (!rules) return { outcome: 'unknown', evaluated: [], passed: [], failed: [], missing: [] };
  const applicable = rules.filter((rule) => !rule.when || rule.when(answers));
  const missing = applicable.filter((rule) => !answers[rule.id] || answers[rule.id] === 'unknown').map((rule) => rule.id);
  const failed = applicable.filter((rule) => answers[rule.id] && answers[rule.id] !== 'unknown' && answers[rule.id] !== rule.answer).map((rule) => rule.id);
  const passed = applicable.filter((rule) => answers[rule.id] === rule.answer).map((rule) => rule.id);
  return { outcome: missing.length ? 'unknown' : failed.length ? 'not' : 'likely', evaluated: applicable.map((rule) => rule.id), passed, failed, missing };
}
