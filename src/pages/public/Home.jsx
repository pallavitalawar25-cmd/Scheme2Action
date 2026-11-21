import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Languages, UserCheck } from 'lucide-react';
import TricolourRibbon from '../../components/decor/TricolourRibbon';
import ChakraGeometry from '../../components/decor/ChakraGeometry';
import HeritageSkyline from '../../components/decor/HeritageSkyline';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import T from '../../components/common/T';
import Reveal from '../../components/common/Reveal';
import CategoryCard from '../../components/schemes/CategoryCard';
import HeroIllustration from '../../components/home/HeroIllustration';
import StatsStrip from '../../components/home/StatsStrip';
import FeaturedSchemes from '../../components/home/FeaturedSchemes';
import HowItWorks from '../../components/home/HowItWorks';
import TrustGuard from '../../components/home/TrustGuard';
import RecentlyUpdated from '../../components/home/RecentlyUpdated';
import WhySection from '../../components/home/WhySection';
import LanguageShowcase from '../../components/home/LanguageShowcase';
import HelperIntro from '../../components/home/HelperIntro';
import FinalCta from '../../components/home/FinalCta';
import { categories } from '../../data/categories';
import { EASE, stagger, fadeUp } from '../../utils/motion';

export default function Home() {
  const navigate = useNavigate();
  const chips = [{ k: 'hero.chip1', icon: BadgeCheck }, { k: 'hero.chip2', icon: UserCheck }, { k: 'hero.chip3', icon: Languages }];
  return (
    <>
      <section className="hero">
        <ChakraGeometry size={640} className="hero__chakra" />
        <TricolourRibbon className="hero__ribbon" />
        <div className="container hero__inner">
          <motion.div variants={stagger(0.12, 0.05)} initial="hidden" animate="show" className="hero__copy">
            <motion.p variants={fadeUp} className="hero__support"><T k="brand.support" /></motion.p>
            <motion.h1 variants={fadeUp} className="hero__title"><T k="hero.title" /></motion.h1>
            <motion.p variants={fadeUp} className="hero__desc"><T k="hero.sub" /></motion.p>
            <motion.div variants={fadeUp} className="hero__search"><SearchBar onSearch={(q) => navigate(`/schemes${q ? `?q=${encodeURIComponent(q)}` : ''}`)} /></motion.div>
            <motion.div variants={fadeUp} className="cluster hero__ctas">
              <Button to="/schemes" size="lg" iconRight={ArrowRight} className="btn--arrow"><T k="hero.cta.explore" /></Button>
              <Button to="/how-it-works" size="lg" variant="secondary"><T k="hero.cta.how" /></Button>
            </motion.div>
            <motion.p variants={fadeUp} className="hero__more"><T k="hero.desc" /></motion.p>
            <motion.ul variants={fadeUp} className="hero__chips">{chips.map(({ k, icon: Icon }) => <li key={k}><Icon size={16} aria-hidden="true" /><T k={k} /></li>)}</motion.ul>
          </motion.div>
          <motion.div className="hero__art" initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: EASE }}>
            <HeroIllustration />
          </motion.div>
        </div>
        <HeritageSkyline className="hero__skyline" />
      </section>

      <StatsStrip />

      <section className="section" aria-labelledby="cats-h">
        <div className="container">
          <Reveal><h2 id="cats-h"><T k="home.categories.title" /></h2><p className="muted"><T k="home.categories.sub" /></p></Reveal>
          <motion.ul className="grid-cats" variants={stagger(0.07)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            {categories.map((c) => (
              <motion.li key={c.slug} variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}>
                <CategoryCard category={c} />
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      <FeaturedSchemes />
      <HowItWorks />
      <TrustGuard />
      <RecentlyUpdated />
      <WhySection />
      <LanguageShowcase />
      <HelperIntro />
      <FinalCta />
    </>
  );
}
