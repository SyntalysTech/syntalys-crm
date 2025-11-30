'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { CompanyExpense } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    monthlyTotal: 0,
    annualTotal: 0,
    yearlyProjected: 0,
    totalExpenses: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const { data, error } = await supabase
        .from('company_expenses')
        .select('*');

      if (error) {
        console.error('Error loading stats:', error);
        return;
      }

      const expenses = data || [];
      const monthly = expenses.filter(e => e.frequency === 'monthly');
      const annual = expenses.filter(e => e.frequency === 'annual');

      const monthlyTotal = monthly.reduce((sum, e) => sum + Number(e.amount), 0);
      const annualTotal = annual.reduce((sum, e) => sum + Number(e.amount), 0);
      const yearlyProjected = (monthlyTotal * 12) + annualTotal;

      setStats({
        monthlyTotal,
        annualTotal,
        yearlyProjected,
        totalExpenses: expenses.length,
      });
    } catch (error) {
      console.error('Error in loadStats:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t.dashboard.welcome}, {profile?.full_name || profile?.email || 'Usuario'}
        </h1>
        <p className="text-gray-600 mt-2">
          {t.dashboard.connectedAs}{' '}
          <span className="font-semibold text-syntalys-blue">
            {profile?.role === 'super_admin' && t.dashboard.superAdmin}
            {profile?.role === 'admin' && t.dashboard.admin}
            {profile?.role === 'gestor' && t.dashboard.manager}
            {profile?.role === 'empleado' && t.dashboard.employee}
          </span>
        </p>
      </div>

      {/* Cards de estadísticas de gastos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title={t.dashboard.monthlyExpenses}
          value={loading ? '...' : `${stats.monthlyTotal.toFixed(2)} CHF`}
          color="bg-syntalys-blue"
        />
        <StatsCard
          title={t.dashboard.annualExpenses}
          value={loading ? '...' : `${stats.annualTotal.toFixed(2)} CHF`}
          color="bg-blue-600"
        />
        <StatsCard
          title={t.dashboard.yearlyProjected}
          value={loading ? '...' : `${stats.yearlyProjected.toFixed(2)} CHF`}
          color="bg-red-600"
        />
        <StatsCard
          title={t.dashboard.totalExpenses}
          value={loading ? '...' : `${stats.totalExpenses}`}
          color="bg-gray-600"
        />
      </div>

      {/* Resumen de gastos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t.dashboard.expensesSummary}</h2>
        <p className="text-gray-600 mb-4">
          {t.dashboard.expensesSummarySubtitle}
        </p>

        {loading ? (
          <div className="mt-6 text-center py-12">
            <p className="text-gray-500">{t.common.loading}...</p>
          </div>
        ) : stats.totalExpenses > 0 ? (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-l-4 border-syntalys-blue pl-4">
                <h3 className="font-semibold text-gray-700 mb-2">{t.dashboard.recurringExpenses}</h3>
                <p className="text-2xl font-bold text-syntalys-blue">{stats.monthlyTotal.toFixed(2)} CHF</p>
                <p className="text-sm text-gray-500">{t.dashboard.monthly}</p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-700 mb-2">{t.dashboard.annualProjection}</h3>
                <p className="text-2xl font-bold text-red-600">{stats.yearlyProjected.toFixed(2)} CHF</p>
                <p className="text-sm text-gray-500">{t.dashboard.estimatedYearTotal}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <a
                href="/dashboard/gastos"
                className="inline-block bg-syntalys-blue text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                {t.dashboard.viewAllExpenses}
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500">{t.dashboard.noExpenses}</p>
            <p className="text-sm text-gray-400 mt-2">{t.dashboard.noExpensesSubtitle}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`${color} w-12 h-12 rounded-full`}></div>
      </div>
    </div>
  );
}
