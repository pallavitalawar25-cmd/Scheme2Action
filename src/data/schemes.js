// DEMONSTRATION DATA. Scheme names, departments and one-line descriptions are real-world references,
// but verification status, dates and readiness are sample values that show the workflow.
// No benefit amounts or eligibility rules are included on purpose: they must come from official documents
// reviewed in the admin Rulebook Verification workflow. Text lives in translations (scheme.<id>.*).
//
// level: 'central' | 'karnataka'   status: 'verified' | 'info-verified' | 'pending'
// readiness: 'ready' (eligibility + document rules configured) | 'partial' | 'soon'
export const schemes = [
  { id: 'pm-kisan', category: 'agriculture', level: 'central', status: 'info-verified', readiness: 'partial', benefitType: 'income', lastUpdated: '2026-10-28', lastVerified: '2026-10-28', keywords: ['farmer', 'kisan', 'income support', 'ರೈತ', 'ಕಿಸಾನ್'], source: 'https://pmkisan.gov.in', featured: 1 },
  { id: 'nsp-scholarships', category: 'education', level: 'central', status: 'info-verified', readiness: 'partial', benefitType: 'scholarship', lastUpdated: '2026-11-04', lastVerified: '2026-11-04', keywords: ['scholarship', 'student', 'nsp', 'ವಿದ್ಯಾರ್ಥಿವೇತನ'], source: 'https://scholarships.gov.in', featured: 2 },
  { id: 'pmay', category: 'housing', level: 'central', status: 'pending', readiness: 'soon', benefitType: 'housing', lastUpdated: '2026-09-15', lastVerified: null, keywords: ['house', 'home', 'awas', 'ಮನೆ', 'ಆವಾಸ್'], source: 'https://pmay-urban.gov.in', featured: 3 },
  { id: 'pmjay', category: 'healthcare', level: 'central', status: 'info-verified', readiness: 'partial', benefitType: 'health', lastUpdated: '2026-10-02', lastVerified: '2026-10-02', keywords: ['health', 'hospital', 'insurance', 'ayushman', 'ಆರೋಗ್ಯ', 'ಆಯುಷ್ಮಾನ್'], source: 'https://pmjay.gov.in', featured: 4 },
  { id: 'ssp-post-matric-scholarship', category: 'education', level: 'karnataka', status: 'verified', readiness: 'ready', benefitType: 'scholarship', lastUpdated: '2026-11-12', lastVerified: '2026-11-12', keywords: ['scholarship', 'post matric', 'ssp', 'student', 'ವಿದ್ಯಾರ್ಥಿವೇತನ'], source: 'https://ssp.karnataka.gov.in', featured: 5 },
  { id: 'gruha-lakshmi', category: 'women-children', level: 'karnataka', status: 'pending', readiness: 'soon', benefitType: 'cash', lastUpdated: '2026-08-20', lastVerified: null, keywords: ['women', 'household', 'gruha', 'ಮಹಿಳೆ', 'ಗೃಹ'], source: 'https://sevasindhu.karnataka.gov.in', featured: 6 },
  { id: 'anna-bhagya', category: 'food', level: 'karnataka', status: 'pending', readiness: 'soon', benefitType: 'food', lastUpdated: '2026-07-30', lastVerified: null, keywords: ['ration', 'food', 'grain', 'ಪಡಿತರ', 'ಅನ್ನ'], source: 'https://ahara.kar.nic.in' },
  { id: 'nsap', category: 'pension', level: 'central', status: 'pending', readiness: 'soon', benefitType: 'pension', lastUpdated: '2026-09-01', lastVerified: null, keywords: ['pension', 'widow', 'disability', 'old age', 'ಪಿಂಚಣಿ'], source: 'https://nsap.nic.in' },
  { id: 'sandhya-suraksha', category: 'pension', level: 'karnataka', status: 'pending', readiness: 'soon', benefitType: 'pension', lastUpdated: '2026-08-11', lastVerified: null, keywords: ['senior citizen', 'pension', 'old age', 'ಹಿರಿಯ', 'ಪಿಂಚಣಿ'], source: 'https://sevasindhu.karnataka.gov.in' },
  { id: 'pm-mudra', category: 'employment', level: 'central', status: 'info-verified', readiness: 'partial', benefitType: 'loan', lastUpdated: '2026-10-19', lastVerified: '2026-10-19', keywords: ['loan', 'business', 'mudra', 'enterprise', 'ಸಾಲ', 'ವ್ಯಾಪಾರ'], source: 'https://www.mudra.org.in' },
  { id: 'yuva-nidhi', category: 'employment', level: 'karnataka', status: 'pending', readiness: 'soon', benefitType: 'jobseeker', lastUpdated: '2026-09-27', lastVerified: null, keywords: ['graduate', 'unemployed', 'youth', 'diploma', 'ಯುವ', 'ನಿರುದ್ಯೋಗ'], source: 'https://sevasindhu.karnataka.gov.in' },
];

export const verificationOrder = ['verified', 'info-verified', 'pending'];
export const getScheme = (id) => schemes.find((s) => s.id === id);
export const schemeKey = (id, field) => `scheme.${id}.${field}`;

// Sample document list, only for the complete scholarship demonstration. Labelled "sample" in the UI.
export const sampleDocuments = {
  'ssp-post-matric-scholarship': [
    { key: 'doc.aadhaar', mandatory: true },
    { key: 'doc.income', mandatory: true },
    { key: 'doc.marks', mandatory: true },
    { key: 'doc.admission', mandatory: true },
    { key: 'doc.bank', mandatory: true },
    { key: 'doc.caste', mandatory: false },
  ],
};
