import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from '@nextui-org/react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} <span className="text-white font-semibold">GenesisCode</span>. {t('allRightsReserved')}
          </p>
        </div>

        <div className="flex gap-6">
          <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
            {t('legalNotice')}
          </Link>
          <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
            {t('contact')}
          </Link>
          <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
            {t('support')}
          </Link>
        </div>
      </div>
    </footer>
  );
}