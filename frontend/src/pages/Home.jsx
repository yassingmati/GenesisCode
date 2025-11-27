// src/pages/Home.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRocket, FaCode, FaUserGraduate, FaUserTie, FaShieldAlt,
  FaLaptopCode, FaTrophy, FaQuestionCircle, FaChevronDown,
  FaCheck, FaStar, FaEnvelope, FaPaperPlane
} from 'react-icons/fa';

const Home = () => {
  const { t } = useTranslation();
  // FAQ State
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex-1 text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium text-sm">
                {t('home.hero.badge')}
              </motion.div>
              <motion.h1 variants={fadeInUp} className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight">
                {t('home.hero.title')}
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t('home.hero.subtitle')}
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all flex items-center justify-center gap-2">
                  <FaRocket /> {t('home.hero.tryFree')}
                </Link>
                <Link to="/demo" className="px-8 py-4 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2">
                  <FaLaptopCode /> {t('home.hero.viewDemo')}
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-12 flex flex-wrap justify-center lg:justify-start gap-6">
                {(t('home.heroFeatures') || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-xs">✓</div>
                    {item}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 relative"
            >
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"
                  alt="Coding Interface"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <div className="text-sm font-mono text-blue-300 mb-1">Challenge du jour</div>
                    <div className="text-xl font-bold">Créer ton premier jeu vidéo</div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                    <FaTrophy />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Niveau atteint</div>
                    <div className="font-bold text-slate-800 dark:text-white">Expert Python</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-5 -left-5 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                    <FaCheck />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Exercice validé</div>
                    <div className="font-bold text-slate-800 dark:text-white">+50 XP gagnés</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">{t('home.features.title')}</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <FaCode />, title: t('home.featuresList.interactive.title'), desc: t('home.featuresList.interactive.desc') },
              { icon: <FaTrophy />, title: t('home.featuresList.gamification.title'), desc: t('home.featuresList.gamification.desc') },
              { icon: <FaShieldAlt />, title: t('home.featuresList.secure.title'), desc: t('home.featuresList.secure.desc') },
              { icon: <FaUserGraduate />, title: t('home.featuresList.adapted.title'), desc: t('home.featuresList.adapted.desc') },
              { icon: <FaLaptopCode />, title: t('home.featuresList.projects.title'), desc: t('home.featuresList.projects.desc') },
              { icon: <FaUserTie />, title: t('home.featuresList.parental.title'), desc: t('home.featuresList.parental.desc') }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-2xl text-blue-600 dark:text-blue-400 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* UX Scenarios */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">{t('home.scenarios.title')}</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t('home.scenarios.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Student Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-full -mr-8 -mt-8" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl text-orange-500">
                  <FaUserGraduate />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('home.scenariosList.student.title')}</h3>
                  <p className="text-orange-500 font-medium">{t('home.scenariosList.student.subtitle')}</p>
                </div>
              </div>
              <ul className="space-y-4">
                {(t('home.scenariosList.student.features') || []).map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <FaCheck className="text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register" className="block w-full py-3 text-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors">
                  {t('home.scenariosList.student.action')}
                </Link>
              </div>
            </motion.div>

            {/* Parent Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl text-purple-500">
                  <FaUserTie />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('home.scenariosList.parent.title')}</h3>
                  <p className="text-purple-500 font-medium">{t('home.scenariosList.parent.subtitle')}</p>
                </div>
              </div>
              <ul className="space-y-4">
                {(t('home.scenariosList.parent.features') || []).map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <FaCheck className="text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register?type=parent" className="block w-full py-3 text-center rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition-colors">
                  {t('home.scenariosList.parent.action')}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Levels Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">{t('home.levels.title')}</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t('home.levels.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: t('home.levelsList.beginner.title'), color: "text-green-500", border: "border-green-500", bg: "bg-green-500", steps: t('home.levelsList.beginner.steps') || [] },
              { title: t('home.levelsList.intermediate.title'), color: "text-blue-500", border: "border-blue-500", bg: "bg-blue-500", steps: t('home.levelsList.intermediate.steps') || [] },
              { title: t('home.levelsList.advanced.title'), color: "text-red-500", border: "border-red-500", bg: "bg-red-500", steps: t('home.levelsList.advanced.steps') || [] }
            ].map((level, index) => (
              <div key={index} className={`bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border-t-4 ${level.border} shadow-lg relative overflow-hidden`}>
                <h3 className={`text-2xl font-bold mb-6 ${level.color}`}>{level.title}</h3>
                <div className="space-y-6 relative z-10">
                  {level.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full ${level.bg} bg-opacity-20 flex items-center justify-center font-bold ${level.color} flex-shrink-0`}>
                        {i + 1}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold mb-12 text-center text-slate-900 dark:text-white">{t('home.testimonials.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(t('home.testimonialsList') || []).map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg relative">
                <FaStar className="text-yellow-400 text-2xl mb-4" />
                <p className="text-slate-600 dark:text-slate-300 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl lg:text-4xl font-bold mb-12 text-center text-slate-900 dark:text-white">{t('home.faq.title')}</h2>
          <div className="space-y-4">
            {(t('home.faqList') || []).map((item, index) => (
              <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 flex items-center justify-between text-left bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200">{item.q}</span>
                  <FaChevronDown className={`transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-white dark:bg-slate-900 px-6 py-4 text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">{t('home.contact.title')}</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('home.contact.subtitle')}
          </p>
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl max-w-2xl mx-auto border border-white/20">
            <form className="space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 ml-1">{t('home.contact.name')}</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/10 focus:outline-none focus:bg-white/30 transition-colors placeholder-blue-200" placeholder={t('home.contact.name')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 ml-1">{t('home.contact.email')}</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/10 focus:outline-none focus:bg-white/30 transition-colors placeholder-blue-200" placeholder="votre@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 ml-1">{t('home.contact.message')}</label>
                <textarea className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/10 focus:outline-none focus:bg-white/30 transition-colors placeholder-blue-200 h-32 resize-none" placeholder={t('home.contact.message')}></textarea>
              </div>
              <button type="button" className="w-full py-4 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                <FaPaperPlane /> {t('home.contact.send')}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="text-2xl font-bold text-white mb-4 block">CodeGenesis</Link>
              <p className="text-sm">
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t('footer.platform.title')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/courses" className="hover:text-white transition-colors">{t('footer.platform.courses')}</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">{t('footer.platform.pricing')}</Link></li>
                <li><Link to="/security" className="hover:text-white transition-colors">{t('footer.platform.security')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t('footer.resources.title')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/blog" className="hover:text-white transition-colors">{t('footer.resources.blog')}</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">{t('footer.resources.help')}</Link></li>
                <li><Link to="/parents" className="hover:text-white transition-colors">{t('footer.resources.parents')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t('footer.legal.title')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms" className="hover:text-white transition-colors">{t('footer.legal.terms')}</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">{t('footer.legal.privacy')}</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition-colors">{t('footer.legal.cookies')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-sm">
            © {new Date().getFullYear()} CodeGenesis. {t('footer.allRightsReserved')}.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;