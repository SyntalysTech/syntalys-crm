'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { FaUsers, FaProjectDiagram, FaChartLine, FaMoneyBillWave, FaFileInvoice, FaCog, FaCalculator, FaRobot, FaArrowRight } from 'react-icons/fa';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useLanguage();

  // Calculator state
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrevValue, setCalcPrevValue] = useState<number | null>(null);
  const [calcOperation, setCalcOperation] = useState<string | null>(null);
  const [calcNewNumber, setCalcNewNumber] = useState(true);

  const handleCalcNumber = (num: string) => {
    if (calcNewNumber) {
      setCalcDisplay(num);
      setCalcNewNumber(false);
    } else {
      setCalcDisplay(calcDisplay === '0' ? num : calcDisplay + num);
    }
  };

  const handleCalcOperation = (op: string) => {
    const current = parseFloat(calcDisplay);
    if (calcPrevValue !== null && calcOperation && !calcNewNumber) {
      const result = calculate(calcPrevValue, current, calcOperation);
      setCalcDisplay(String(result));
      setCalcPrevValue(result);
    } else {
      setCalcPrevValue(current);
    }
    setCalcOperation(op);
    setCalcNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleCalcEquals = () => {
    if (calcPrevValue !== null && calcOperation) {
      const current = parseFloat(calcDisplay);
      const result = calculate(calcPrevValue, current, calcOperation);
      setCalcDisplay(String(result));
      setCalcPrevValue(null);
      setCalcOperation(null);
      setCalcNewNumber(true);
    }
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcPrevValue(null);
    setCalcOperation(null);
    setCalcNewNumber(true);
  };

  const handleCalcDecimal = () => {
    if (!calcDisplay.includes('.')) {
      setCalcDisplay(calcDisplay + '.');
      setCalcNewNumber(false);
    }
  };

  const quickLinks = [
    { href: '/dashboard/clientes', icon: FaUsers, label: t.nav.clients, color: 'bg-blue-500 hover:bg-blue-600', description: t.clients.subtitle },
    { href: '/dashboard/proyectos', icon: FaProjectDiagram, label: t.nav.projects, color: 'bg-purple-500 hover:bg-purple-600', description: t.projects.subtitle },
    { href: '/dashboard/ingresos', icon: FaMoneyBillWave, label: t.nav.income, color: 'bg-green-500 hover:bg-green-600', description: t.income.subtitle },
    { href: '/dashboard/gastos', icon: FaFileInvoice, label: t.nav.expenses, color: 'bg-red-500 hover:bg-red-600', description: t.expenses.subtitle },
    { href: '/dashboard/estadisticas', icon: FaChartLine, label: t.nav.statistics, color: 'bg-amber-500 hover:bg-amber-600', description: t.stats.subtitle },
    { href: '/dashboard/ajustes', icon: FaCog, label: t.nav.settings, color: 'bg-gray-500 hover:bg-gray-600', description: t.settings.description },
  ];

  return (
    <div className="p-8">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.dashboard.welcome}, {profile?.full_name || profile?.email || '-'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.dashboard.connectedAs}{' '}
          <span className="font-semibold text-syntalys-blue dark:text-blue-400">
            {profile?.role === 'super_admin' && t.dashboard.superAdmin}
            {profile?.role === 'admin' && t.dashboard.admin}
            {profile?.role === 'gestor' && t.dashboard.manager}
            {profile?.role === 'empleado' && t.dashboard.employee}
          </span>
        </p>
      </div>

      {/* Quick access section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t.dashboard.quickAccess}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className={`${link.color} p-3 rounded-lg text-white transition-colors`}>
                  <link.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-syntalys-blue dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                    {link.label}
                    <FaArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{link.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tools section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-500 p-2 rounded-lg text-white">
              <FaCalculator className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.dashboard.calculator}</h2>
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <div className="text-right text-3xl font-mono text-gray-900 dark:text-white overflow-x-auto">
              {calcDisplay}
            </div>
            {calcOperation && (
              <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                {calcPrevValue} {calcOperation}
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button onClick={handleCalcClear} className="col-span-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
              C
            </button>
            <button onClick={() => handleCalcOperation('/')} className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-3 rounded-lg font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
              /
            </button>
            <button onClick={() => handleCalcOperation('*')} className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-3 rounded-lg font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
              *
            </button>

            {['7', '8', '9'].map(num => (
              <button key={num} onClick={() => handleCalcNumber(num)} className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                {num}
              </button>
            ))}
            <button onClick={() => handleCalcOperation('-')} className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-3 rounded-lg font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
              -
            </button>

            {['4', '5', '6'].map(num => (
              <button key={num} onClick={() => handleCalcNumber(num)} className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                {num}
              </button>
            ))}
            <button onClick={() => handleCalcOperation('+')} className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-3 rounded-lg font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
              +
            </button>

            {['1', '2', '3'].map(num => (
              <button key={num} onClick={() => handleCalcNumber(num)} className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                {num}
              </button>
            ))}
            <button onClick={handleCalcEquals} className="row-span-2 bg-syntalys-blue text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              =
            </button>

            <button onClick={() => handleCalcNumber('0')} className="col-span-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              0
            </button>
            <button onClick={handleCalcDecimal} className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              .
            </button>
          </div>
        </div>

        {/* AI Assistant card */}
        <div className="bg-gradient-to-br from-syntalys-blue to-blue-700 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <FaRobot className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold">{t.dashboard.aiAssistant}</h2>
          </div>

          <p className="text-blue-100 mb-6">
            {t.dashboard.aiAssistantDescription}
          </p>

          <div className="space-y-3 mb-6">
            <div className="bg-white/10 rounded-lg p-3 text-sm">
              "{t.chatAI.suggestion1}"
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-sm">
              "{t.chatAI.suggestion2}"
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-sm">
              "{t.chatAI.suggestion3}"
            </div>
          </div>

          <Link
            href="/dashboard/chat"
            className="inline-flex items-center gap-2 bg-white text-syntalys-blue px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            {t.dashboard.openChat}
            <FaArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Info section */}
      <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t.dashboard.tip}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {t.dashboard.tipDescription}
        </p>
      </div>
    </div>
  );
}
