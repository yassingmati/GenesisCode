// Footer moderne et professionnel pour le dashboard client
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { 
  FiHeart, 
  FiGithub, 
  FiTwitter, 
  FiLinkedin, 
  FiMail,
  FiExternalLink,
  FiCode,
  FiUsers,
  FiGlobe
} from 'react-icons/fi';
import './ModernFooter.css';

const ModernFooter = () => {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: t('features'), href: '/features' },
      { label: t('pricing'), href: '/pricing' },
      { label: t('documentation'), href: '/docs' },
      { label: t('api'), href: '/api' }
    ],
    company: [
      { label: t('about'), href: '/about' },
      { label: t('blog'), href: '/blog' },
      { label: t('careers'), href: '/careers' },
      { label: t('contact'), href: '/contact' }
    ],
    support: [
      { label: t('helpCenter'), href: '/help' },
      { label: t('community'), href: '/community' },
      { label: t('status'), href: '/status' },
      { label: t('security'), href: '/security' }
    ],
    legal: [
      { label: t('privacy'), href: '/privacy' },
      { label: t('terms'), href: '/terms' },
      { label: t('cookies'), href: '/cookies' },
      { label: t('gdpr'), href: '/gdpr' }
    ]
  };

  const socialLinks = [
    { icon: FiGithub, href: 'https://github.com/genesis-code', label: 'GitHub' },
    { icon: FiTwitter, href: 'https://twitter.com/genesis-code', label: 'Twitter' },
    { icon: FiLinkedin, href: 'https://linkedin.com/company/genesis-code', label: 'LinkedIn' },
    { icon: FiMail, href: 'mailto:contact@genesis-code.com', label: 'Email' }
  ];

  const stats = [
    { icon: FiUsers, value: '10K+', label: t('activeUsers') },
    { icon: FiCode, value: '500+', label: t('codeExercises') },
    { icon: FiGlobe, value: '50+', label: t('countries') }
  ];

  return (
    <footer className="modern-footer">
      <div className="footer-container">
        {/* Section principale */}
        <div className="footer-main">
          {/* Brand et description */}
          <div className="footer-brand">
            <div className="brand-logo">
              <div className="logo-icon">🚀</div>
              <span className="logo-text">GenesisCode</span>
            </div>
            <p className="brand-description">
              {t('footerDescription')}
            </p>
            
            {/* Statistiques */}
            <div className="footer-stats">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="stat-item">
                    <Icon className="stat-icon" />
                    <div className="stat-content">
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Liens de navigation */}
          <div className="footer-links">
            <div className="link-group">
              <h3 className="link-group-title">{t('product')}</h3>
              <ul className="link-list">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-group">
              <h3 className="link-group-title">{t('company')}</h3>
              <ul className="link-list">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-group">
              <h3 className="link-group-title">{t('support')}</h3>
              <ul className="link-list">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-group">
              <h3 className="link-group-title">{t('legal')}</h3>
              <ul className="link-list">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="footer-newsletter">
          <div className="newsletter-content">
            <h3 className="newsletter-title">{t('stayUpdated')}</h3>
            <p className="newsletter-description">
              {t('newsletterDescription')}
            </p>
            <form className="newsletter-form">
              <div className="newsletter-input-group">
                <input
                  type="email"
                  placeholder={t('enterEmail')}
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="newsletter-button">
                  {t('subscribe')}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Section du bas */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>
                &copy; {currentYear} GenesisCode. {t('allRightsReserved')}
              </p>
            </div>

            <div className="footer-bottom-links">
              <div className="social-links">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className="social-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>

              <div className="footer-actions">
                <a href="/status" className="footer-action-link">
                  <span>{t('systemStatus')}</span>
                  <FiExternalLink />
                </a>
                <a href="/changelog" className="footer-action-link">
                  <span>{t('changelog')}</span>
                  <FiExternalLink />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cœur flottant */}
      <div className="floating-heart">
        <FiHeart />
      </div>
    </footer>
  );
};

export default ModernFooter;
