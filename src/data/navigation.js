import {
  LayoutDashboard, Compass, ClipboardList, HeartHandshake, UserRound, Home, Bookmark, Settings,
  ListChecks, BadgeCheck, FileText, UploadCloud, ScanSearch, PencilLine, ClipboardCheck, FileDown, Route as RouteIcon,
  Library, FileSearch, GitCompareArrows, ShieldCheck, Globe2,
} from 'lucide-react';

// Demo application used by the guided flow until real schemes are wired in (batch 2/4).
export const DEMO_SCHEME_ID = 'ssp-post-matric-scholarship';

export const publicNav = [
  { id: 'home', to: '/', key: 'nav.home', end: true },
  { id: 'explore', to: '/schemes', key: 'nav.explore' },
  { id: 'categories', to: '/categories', key: 'nav.categories', menu: true },
  { id: 'how', to: '/how-it-works', key: 'nav.how' },
  { id: 'about', to: '/about', key: 'nav.about' },
];

export const citizenNav = [
  { to: '/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/schemes', key: 'nav.explore', icon: Compass, mobile: false },
  { to: `/apply/${DEMO_SCHEME_ID}/eligibility`, match: '/apply', key: 'nav.myApplication', icon: ClipboardList },
  { to: '/saved', key: 'nav.saved', icon: Bookmark },
  { to: '/helper/workspace', key: 'nav.helper', icon: HeartHandshake },
  { to: '/profile', key: 'nav.profile', icon: UserRound },
  { to: '/settings', key: 'nav.settings', icon: Settings, mobile: false },
];

export const adminNav = [
  { to: '/admin', key: 'nav.admin.dashboard', icon: ShieldCheck, end: true },
  { to: '/admin/schemes', key: 'nav.admin.schemes', icon: Library },
  { to: '/admin/sources', key: 'nav.admin.sources', icon: Globe2 },
  { to: '/admin/rulebook', key: 'nav.admin.rulebook', icon: FileSearch },
  { to: '/admin/policy-changes', key: 'nav.admin.policy', icon: GitCompareArrows },
  { to: '/', key: 'nav.backToSite', icon: Home, end: true },
];

export const applicationSteps = [
  { id: 'eligibility', path: 'eligibility', key: 'step.eligibility', icon: ListChecks },
  { id: 'results', path: 'results', key: 'step.results', icon: BadgeCheck },
  { id: 'documents', path: 'documents', key: 'step.documents', icon: FileText },
  { id: 'upload', path: 'upload', key: 'step.upload', icon: UploadCloud },
  { id: 'review', path: 'review', key: 'step.review', icon: ScanSearch },
  { id: 'corrections', path: 'corrections', key: 'step.corrections', icon: PencilLine },
  { id: 'final', path: 'final', key: 'step.final', icon: ClipboardCheck },
  { id: 'packet', path: 'packet', key: 'step.packet', icon: FileDown },
  { id: 'tracker', path: 'tracker', key: 'step.tracker', icon: RouteIcon },
];
