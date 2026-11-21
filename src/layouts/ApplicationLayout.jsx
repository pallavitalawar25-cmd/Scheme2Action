import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { applicationSteps } from '../data/navigation';
import Stepper from '../components/forms/Stepper';
import Button from '../components/common/Button';
import T from '../components/common/T';
import AppTopbar from '../components/layout/AppTopbar';
import DisclaimerStrip from '../components/layout/DisclaimerStrip';
import PageTransition from './PageTransition';
import SkipLink from './SkipLink';
import HelperBanner from '../components/citizen/HelperBanner';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

// Application journey shell: persistent stepper above every preparation screen.
export default function ApplicationLayout() {
  const { schemeId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const routeName = pathname.split('/').filter(Boolean).pop();
  const last = routeName === 'result' ? 'results' : routeName;
  const current = Math.max(0, applicationSteps.findIndex((s) => s.path === last));
  return (
    <div className="appshell">
      <SkipLink />
      <HelperBanner />
      <AppTopbar showLogo>
        <Link to="/dashboard" className="back-link"><ArrowLeft size={18} aria-hidden="true" /><T k="nav.dashboard" /></Link>
      </AppTopbar>
      <div className="appshell__stepbar">
        <div className="container appshell__stepinner">
          <Stepper steps={applicationSteps} current={current} basePath={`/apply/${schemeId}`} />
          <Button variant="ghost" size="sm" iconLeft={Save} className="appshell__save" onClick={() => { toast.success(t('toast.savedExit')); navigate('/dashboard'); }}><T k="common.saveExit" /></Button>
        </div>
      </div>
      <main id="main" tabIndex={-1} className="appshell__content"><PageTransition /></main>
      <DisclaimerStrip />
    </div>
  );
}
