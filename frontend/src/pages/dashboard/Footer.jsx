import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.copyright}>
          <p>&copy; {new Date().getFullYear()} GenesisCode. {t('allRightsReserved')}</p>
        </div>
        <div style={styles.links}>
          <a href="#" style={styles.link}>{t('legalNotice')}</a>
          <a href="#" style={styles.link}>{t('contact')}</a>
          <a href="#" style={styles.link}>{t('support')}</a>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '24px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  copyright: {
    marginBottom: '16px',
    textAlign: 'center',
  },
  links: {
    display: 'flex',
    gap: '16px',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
  },
};

// Media queries and hover effects
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @media (min-width: 768px) {
    .container {
      flex-direction: row !important;
      justify-content: space-between !important;
      align-items: center !important;
    }
    .copyright {
      margin-bottom: 0 !important;
    }
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  .link:hover {
    color: #a5b4fc !important;
  }
`, styleSheet.cssRules.length);