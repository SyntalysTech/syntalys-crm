'use client';

import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/lib/translations';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.nav.settings}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.settings.description}
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Tema */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t.settings.appearance}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t.settings.theme}
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                  theme === 'light'
                    ? 'border-syntalys-blue bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">{t.settings.lightMode}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.settings.lightModeDesc}</p>
                </div>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-syntalys-blue bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">{t.settings.darkMode}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.settings.darkModeDesc}</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Idioma */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t.settings.language}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t.settings.languageDesc}
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => setLanguage('es')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                language === 'es'
                  ? 'border-syntalys-blue bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <Image
                src="/images/Flag_of_Spain-256x171.png"
                alt="Español"
                width={40}
                height={27}
                className="rounded shadow-sm"
              />
              <span className="font-medium text-gray-900 dark:text-white">
                {t.settings.spanish}
              </span>
            </button>

            <button
              onClick={() => setLanguage('fr')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                language === 'fr'
                  ? 'border-syntalys-blue bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <Image
                src="/images/Flag_of_France-256x171.png"
                alt="Français"
                width={40}
                height={27}
                className="rounded shadow-sm"
              />
              <span className="font-medium text-gray-900 dark:text-white">
                {t.settings.french}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
