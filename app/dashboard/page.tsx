'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { CompanyExpense, Client, Project, ClientIncome } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    // Gastos de empresa
    monthlyExpenses: 0,
    annualExpenses: 0,
    yearlyExpensesProjected: 0,
    totalExpenses: 0,
    // Clientes
    totalClients: 0,
    activeClients: 0,
    // Proyectos
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    // Ingresos
    monthlyIncome: 0,
    annualIncome: 0,
    yearlyIncomeProjected: 0,
    totalIncome: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      // Cargar todos los datos en paralelo
      const [expensesRes, clientsRes, projectsRes, incomeRes] = await Promise.all([
        supabase.from('company_expenses').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('client_income').select('*'),
      ]);

      // Procesar gastos de empresa
      const expenses = expensesRes.data || [];
      const monthlyExpenses = expenses.filter(e => e.frequency === 'monthly');
      const annualExpenses = expenses.filter(e => e.frequency === 'annual');
      const monthlyExpensesTotal = monthlyExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const annualExpensesTotal = annualExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

      // Procesar clientes
      const clients = clientsRes.data || [];
      const activeClients = clients.filter(c => c.status === 'active');

      // Procesar proyectos
      const projects = projectsRes.data || [];
      const activeProjects = projects.filter(p => p.status === 'active');
      const completedProjects = projects.filter(p => p.status === 'completed');

      // Procesar ingresos de client_income
      const income = incomeRes.data || [];
      const monthlyIncome = income.filter(i => i.frequency === 'monthly');
      const annualIncome = income.filter(i => i.frequency === 'annual');
      const oneTimeIncome = income.filter(i => i.frequency === 'one_time');

      const monthlyIncomeTotal = monthlyIncome.reduce((sum, i) => sum + Number(i.amount), 0);
      const annualIncomeTotal = annualIncome.reduce((sum, i) => sum + Number(i.amount), 0);
      const oneTimeIncomeTotal = oneTimeIncome.reduce((sum, i) => sum + Number(i.amount), 0);

      // Procesar ingresos de proyectos (todos los proyectos con monto, independiente del estado)
      const projectMonthly = projects.filter(p => p.payment_type === 'monthly' && p.total_amount);
      const projectAnnual = projects.filter(p => p.payment_type === 'annual' && p.total_amount);
      const projectOneTime = projects.filter(p => p.payment_type === 'one_time' && p.total_amount);

      const projectMonthlyTotal = projectMonthly.reduce((sum, p) => sum + Number(p.total_amount), 0);
      const projectAnnualTotal = projectAnnual.reduce((sum, p) => sum + Number(p.total_amount), 0);
      const projectOneTimeTotal = projectOneTime.reduce((sum, p) => sum + Number(p.total_amount), 0);

      // Sumar ingresos de client_income y proyectos
      const totalMonthly = monthlyIncomeTotal + projectMonthlyTotal;
      const totalAnnual = annualIncomeTotal + projectAnnualTotal;
      const totalOneTime = oneTimeIncomeTotal + projectOneTimeTotal;

      setStats({
        monthlyExpenses: monthlyExpensesTotal,
        annualExpenses: annualExpensesTotal,
        yearlyExpensesProjected: (monthlyExpensesTotal * 12) + annualExpensesTotal,
        totalExpenses: expenses.length,
        totalClients: clients.length,
        activeClients: activeClients.length,
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        monthlyIncome: totalMonthly,
        annualIncome: totalAnnual,
        yearlyIncomeProjected: (totalMonthly * 12) + totalAnnual + totalOneTime,
        totalIncome: income.length + projects.filter(p => p.total_amount).length,
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

      {/* Cards de estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title={t.dashboard.totalClients}
          value={loading ? '...' : `${stats.totalClients}`}
          subtitle={`${stats.activeClients} ${t.clients.active.toLowerCase()}`}
          color="bg-blue-600"
        />
        <StatsCard
          title={t.dashboard.activeProjects}
          value={loading ? '...' : `${stats.activeProjects}`}
          subtitle={`${stats.completedProjects} ${t.projects.completed.toLowerCase()}`}
          color="bg-green-600"
        />
        <StatsCard
          title={t.dashboard.monthlyIncome}
          value={loading ? '...' : `${stats.monthlyIncome.toFixed(2)} CHF`}
          subtitle={`${stats.yearlyIncomeProjected.toFixed(2)} CHF ${t.dashboard.annual.toLowerCase()}`}
          color="bg-emerald-600"
        />
        <StatsCard
          title={t.dashboard.monthlyExpenses}
          value={loading ? '...' : `${stats.monthlyExpenses.toFixed(2)} CHF`}
          subtitle={`${stats.yearlyExpensesProjected.toFixed(2)} CHF ${t.dashboard.annual.toLowerCase()}`}
          color="bg-red-600"
        />
      </div>

      {/* Resumen financiero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Ingresos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-700">{t.income.title}</h2>
          <p className="text-gray-600 mb-4">{t.income.subtitle}</p>
          {loading ? (
            <div className="mt-6 text-center py-12">
              <p className="text-gray-500">{t.common.loading}...</p>
            </div>
          ) : stats.totalIncome > 0 ? (
            <div className="mt-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{t.dashboard.monthly}</h3>
                  <p className="text-2xl font-bold text-green-600">{stats.monthlyIncome.toFixed(2)} CHF</p>
                </div>
                <div className="border-l-4 border-emerald-500 pl-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{t.dashboard.annualProjection}</h3>
                  <p className="text-2xl font-bold text-emerald-600">{stats.yearlyIncomeProjected.toFixed(2)} CHF</p>
                </div>
              </div>
              <a
                href="/dashboard/ingresos"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
              >
                {t.dashboard.viewAllIncome}
              </a>
            </div>
          ) : (
            <div className="mt-6 text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500">{t.dashboard.noIncome}</p>
            </div>
          )}
        </div>

        {/* Gastos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-700">{t.dashboard.expensesSummary}</h2>
          <p className="text-gray-600 mb-4">{t.dashboard.expensesSummarySubtitle}</p>
          {loading ? (
            <div className="mt-6 text-center py-12">
              <p className="text-gray-500">{t.common.loading}...</p>
            </div>
          ) : stats.totalExpenses > 0 ? (
            <div className="mt-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{t.dashboard.monthly}</h3>
                  <p className="text-2xl font-bold text-red-600">{stats.monthlyExpenses.toFixed(2)} CHF</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{t.dashboard.annualProjection}</h3>
                  <p className="text-2xl font-bold text-orange-600">{stats.yearlyExpensesProjected.toFixed(2)} CHF</p>
                </div>
              </div>
              <a
                href="/dashboard/gastos"
                className="inline-block bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
              >
                {t.dashboard.viewAllExpenses}
              </a>
            </div>
          ) : (
            <div className="mt-6 text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500">{t.dashboard.noExpenses}</p>
              <p className="text-sm text-gray-400 mt-2">{t.dashboard.noExpensesSubtitle}</p>
            </div>
          )}
        </div>
      </div>

      {/* Beneficio / Margen */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t.dashboard.projectedAnnualProfit}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">{t.dashboard.annualIncome}</p>
            <p className="text-3xl font-bold text-green-600">
              {loading ? '...' : `${stats.yearlyIncomeProjected.toFixed(2)} CHF`}
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">{t.dashboard.annualExpense}</p>
            <p className="text-3xl font-bold text-red-600">
              {loading ? '...' : `${stats.yearlyExpensesProjected.toFixed(2)} CHF`}
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">{t.dashboard.netProfit}</p>
            <p className={`text-3xl font-bold ${(stats.yearlyIncomeProjected - stats.yearlyExpensesProjected) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {loading ? '...' : `${(stats.yearlyIncomeProjected - stats.yearlyExpensesProjected).toFixed(2)} CHF`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${color} w-12 h-12 rounded-full flex-shrink-0`}></div>
      </div>
    </div>
  );
}
