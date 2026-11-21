import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { adminNav } from '../data/navigation';
import Sidebar from '../components/layout/Sidebar';
import AppTopbar from '../components/layout/AppTopbar';
import PageTransition from './PageTransition';
import SkipLink from './SkipLink';

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  return (
    <div className="workspace workspace--admin">
      <SkipLink />
      <Sidebar items={adminNav} variant="dark" mobile="drawer" open={open} onClose={() => setOpen(false)} layoutId="admin-active" />
      <div className="workspace__main">
        <AppTopbar onMenu={() => setOpen(true)} />
        <main id="main" tabIndex={-1} className="workspace__content"><PageTransition /></main>
      </div>
    </div>
  );
}
