import React from 'react';
import { ShieldCheck, Languages } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div className={language === 'ur' ? 'text-right' : 'text-left'}>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 leading-none">
                {language === 'en' ? 'PriceGuard' : 'پرائس گارڈ'}
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                {language === 'en' ? 'Real Prices. Real People.' : 'اصلی قیمتیں، اصلی لوگ'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm"
            >
              <Languages className="h-4 w-4 text-emerald-600" />
              <span className={language === 'ur' ? 'font-bold' : ''}>
                {language === 'en' ? 'اردو' : 'English'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;