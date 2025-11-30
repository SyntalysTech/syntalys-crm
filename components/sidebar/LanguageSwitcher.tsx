'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/translations';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇨🇭' },
  ];

  return (
    <div className="px-4 py-3">
      <div className="bg-white/5 rounded-lg p-2 backdrop-blur-sm border border-white/10">
        <div className="flex items-center gap-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                language === lang.code
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={lang.label}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
