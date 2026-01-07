// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>GenesisCode</h5>
            <ul>
              <li><Link to="/about">{t('footer.about')}</Link></li>
              <li><Link to="/contact">{t('footer.contact')}</Link></li>
              <li><Link to="/privacy">{t('footer.privacyPolicy')}</Link></li>
              <li><Link to="/terms">{t('footer.termsOfService')}</Link></li>
            </ul>
            <p>&copy; {new Date().getFullYear()} GenesisCode. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;