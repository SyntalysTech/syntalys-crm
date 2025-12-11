'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { CompanyExpense, ClientExpense, ClientIncome, Project, Client, Lead, ProjectMilestone } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

type Currency = 'EUR' | 'CHF';
type TimeRange = 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'last_year' | 'all_time';

// Exchange rates (updated: Dec 2024)
// 1 CHF = 1.07 EUR approximately
// 1 EUR = 0.93 CHF approximately
const EXCHANGE_RATES = {
  CHF_TO_EUR: 1.07,  // 90 CHF = 96.30 EUR
  EUR_TO_CHF: 0.93,  // 100 EUR = 93 CHF
};

export default function EstadisticasPage() {
  const { } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [timeRange, setTimeRange] = useState<TimeRange>('this_year');

  // Data states
  const [companyExpenses, setCompanyExpenses] = useState<CompanyExpense[]>([]);
  const [clientExpenses, setClientExpenses] = useState<ClientExpense[]>([]);
  const [clientIncome, setClientIncome] = useState<ClientIncome[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      const [
        expensesRes,
        clientExpensesRes,
        incomeRes,
        projectsRes,
        clientsRes,
        leadsRes,
        milestonesRes,
      ] = await Promise.all([
        supabase.from('company_expenses').select('*'),
        supabase.from('client_expenses').select('*'),
        supabase.from('client_income').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('leads').select('*'),
        supabase.from('project_milestones').select('*'),
      ]);

      setCompanyExpenses(expensesRes.data || []);
      setClientExpenses(clientExpensesRes.data || []);
      setClientIncome(incomeRes.data || []);
      setProjects(projectsRes.data || []);
      setClients(clientsRes.data || []);
      setLeads(leadsRes.data || []);
      setMilestones(milestonesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Convert amount to selected currency
  // fromCurrency = moneda original del dato
  // currency = moneda seleccionada para mostrar
  const convertToCurrency = useCallback((amount: number, fromCurrency: string): number => {
    if (!amount) return 0;
    if (fromCurrency === currency) return amount;

    // Convertir CHF a EUR: 90 CHF * 1.07 = 96.30 EUR
    if (fromCurrency === 'CHF' && currency === 'EUR') {
      return amount * EXCHANGE_RATES.CHF_TO_EUR;
    }
    // Convertir EUR a CHF: 100 EUR * 0.93 = 93 CHF
    if (fromCurrency === 'EUR' && currency === 'CHF') {
      return amount * EXCHANGE_RATES.EUR_TO_CHF;
    }
    // USD conversion (approximate)
    if (fromCurrency === 'USD') {
      return currency === 'EUR' ? amount * 0.92 : amount * 0.86;
    }
    return amount;
  }, [currency]);

  // Format currency
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }, [currency]);

  // Get date range based on timeRange
  const dateRange = useMemo(() => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (timeRange) {
      case 'this_month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last_month':
        start.setMonth(start.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'this_quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(quarter * 3 + 3, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'this_year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last_year':
        start.setFullYear(start.getFullYear() - 1, 0, 1);
        start.setHours(0, 0, 0, 0);
        end.setFullYear(end.getFullYear() - 1, 11, 31);
        end.setHours(23, 59, 59, 999);
        break;
      case 'all_time':
        start.setFullYear(2000, 0, 1);
        start.setHours(0, 0, 0, 0);
        end.setFullYear(2100, 11, 31);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start, end };
  }, [timeRange]);

  // Filter data by date range
  const isInDateRange = useCallback((dateStr: string | null): boolean => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date >= dateRange.start && date <= dateRange.end;
  }, [dateRange]);

  // Calculate totals
  // Los ingresos REALES vienen de client_income (pagos registrados)
  // Los gastos vienen de company_expenses
  const totals = useMemo(() => {
    // Company expenses (Syntalys costs) - solo los que tienen status 'paid'
    const totalCompanyExpenses = companyExpenses
      .filter(e => e.status === 'paid' && (isInDateRange(e.payment_date) || isInDateRange(e.created_at)))
      .reduce((sum, e) => sum + convertToCurrency(e.amount, e.currency), 0);

    // Client expenses (costs for clients) - solo los que tienen status 'paid'
    const totalClientExpenses = clientExpenses
      .filter(e => e.status === 'paid' && (isInDateRange(e.payment_date) || isInDateRange(e.created_at)))
      .reduce((sum, e) => sum + convertToCurrency(e.amount, e.currency), 0);

    // Client income - SOLO de la tabla client_income con status 'paid'
    // Estos son los ingresos REALES registrados
    const totalClientIncome = clientIncome
      .filter(i => i.status === 'paid' && (isInDateRange(i.payment_date) || isInDateRange(i.created_at)))
      .reduce((sum, i) => sum + convertToCurrency(i.amount, i.currency), 0);

    // Milestones pagados de proyectos (adicionales, no duplicar con client_income)
    // Solo contar si hay milestones que NO estén ya en client_income
    const totalMilestonesPaid = milestones
      .filter(m => m.status === 'paid' && isInDateRange(m.paid_date))
      .reduce((sum, m) => sum + convertToCurrency(m.paid_amount || m.amount, m.currency), 0);

    // Total income = solo client_income (los milestones ya generan registros en client_income)
    const totalIncome = totalClientIncome;
    const totalExpenses = totalCompanyExpenses + totalClientExpenses;
    const profit = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      totalCompanyExpenses,
      totalClientExpenses,
      totalClientIncome,
      totalMilestonesPaid,
      profit,
      profitMargin: totalIncome > 0 ? (profit / totalIncome) * 100 : 0,
    };
  }, [companyExpenses, clientExpenses, clientIncome, milestones, convertToCurrency, isInDateRange]);

  // Monthly data for charts
  const monthlyData = useMemo(() => {
    const months: { [key: string]: { income: number; expenses: number; profit: number } } = {};

    // Initialize months based on dateRange
    const current = new Date(dateRange.start);
    while (current <= dateRange.end) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { income: 0, expenses: 0, profit: 0 };
      current.setMonth(current.getMonth() + 1);
    }

    // Add income - SOLO de client_income con status 'paid'
    clientIncome
      .filter(i => i.status === 'paid')
      .forEach(i => {
        const date = new Date(i.payment_date || i.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (months[key]) {
          months[key].income += convertToCurrency(i.amount, i.currency);
        }
      });

    // Add expenses - solo de company_expenses con status 'paid'
    companyExpenses
      .filter(e => e.status === 'paid')
      .forEach(e => {
        const date = new Date(e.payment_date || e.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (months[key]) {
          months[key].expenses += convertToCurrency(e.amount, e.currency);
        }
      });

    // Add client expenses con status 'paid'
    clientExpenses
      .filter(e => e.status === 'paid')
      .forEach(e => {
        const date = new Date(e.payment_date || e.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (months[key]) {
          months[key].expenses += convertToCurrency(e.amount, e.currency);
        }
      });

    // Calculate profit
    Object.keys(months).forEach(key => {
      months[key].profit = months[key].income - months[key].expenses;
    });

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, data]) => ({
        month: new Date(key + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        ...data,
      }));
  }, [clientIncome, companyExpenses, clientExpenses, convertToCurrency, dateRange]);

  // Lead statistics
  const leadStats = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const qualified = leads.filter(l => l.status === 'qualified').length;
    const won = leads.filter(l => l.pipeline_stage === 'won').length;
    const lost = leads.filter(l => l.pipeline_stage === 'lost').length;
    const inPipeline = leads.filter(l => !['none', 'won', 'lost'].includes(l.pipeline_stage)).length;
    const conversionRate = total > 0 ? (won / total) * 100 : 0;
    const estimatedValue = leads
      .filter(l => !['lost', 'won'].includes(l.pipeline_stage))
      .reduce((sum, l) => sum + convertToCurrency(l.estimated_value || 0, l.currency), 0);

    return { total, newLeads, qualified, won, lost, inPipeline, conversionRate, estimatedValue };
  }, [leads, convertToCurrency]);

  // Project statistics
  const projectStats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const totalValue = projects.reduce((sum, p) => sum + convertToCurrency(p.total_amount || 0, p.currency), 0);

    // By type
    const byType: { [key: string]: number } = {};
    projects.forEach(p => {
      const type = p.project_type || 'other';
      byType[type] = (byType[type] || 0) + 1;
    });

    return { total, active, completed, totalValue, byType };
  }, [projects, convertToCurrency]);

  // Client statistics
  const clientStats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter(c => c.status === 'active').length;
    const potential = clients.filter(c => c.is_potential).length;

    // By country
    const byCountry: { [key: string]: number } = {};
    clients.forEach(c => {
      const country = c.country || 'Unknown';
      byCountry[country] = (byCountry[country] || 0) + 1;
    });

    return { total, active, potential, byCountry };
  }, [clients]);

  // Income by category - solo pagados
  const incomeByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    clientIncome
      .filter(i => i.status === 'paid')
      .forEach(i => {
        const cat = i.category || 'other';
        categories[cat] = (categories[cat] || 0) + convertToCurrency(i.amount, i.currency);
      });
    return Object.entries(categories).map(([category, amount]) => ({ category, amount }));
  }, [clientIncome, convertToCurrency]);

  // Expense by category - solo pagados
  const expenseByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    companyExpenses
      .filter(e => e.status === 'paid')
      .forEach(e => {
        const cat = e.category || 'other';
        categories[cat] = (categories[cat] || 0) + convertToCurrency(e.amount, e.currency);
      });
    return Object.entries(categories).map(([category, amount]) => ({ category, amount }));
  }, [companyExpenses, convertToCurrency]);

  const timeRangeLabels: Record<TimeRange, string> = {
    this_month: 'Este mes',
    last_month: 'Mes anterior',
    this_quarter: 'Este trimestre',
    this_year: 'Este año',
    last_year: 'Año anterior',
    all_time: 'Todo el tiempo',
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-syntalys-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t.common.loading}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.stats.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t.stats.subtitle}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 bg-syntalys-blue dark:bg-gray-800 p-3">
          {/* Currency Selector */}
          <div className="flex items-center bg-white/10 dark:bg-gray-700 p-1">
            <button
              onClick={() => setCurrency('EUR')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currency === 'EUR'
                  ? 'bg-white text-syntalys-blue dark:bg-gray-600 dark:text-white'
                  : 'text-white/80 dark:text-gray-400 hover:text-white dark:hover:bg-gray-700'
              }`}
            >
              EUR €
            </button>
            <button
              onClick={() => setCurrency('CHF')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currency === 'CHF'
                  ? 'bg-white text-syntalys-blue dark:bg-gray-600 dark:text-white'
                  : 'text-white/80 dark:text-gray-400 hover:text-white dark:hover:bg-gray-700'
              }`}
            >
              CHF ₣
            </button>
          </div>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2 bg-white/10 dark:bg-gray-700 border border-white/20 dark:border-gray-600 text-sm font-medium text-white dark:text-gray-300 focus:ring-2 focus:ring-white/40 focus:border-transparent"
          >
            {Object.entries(timeRangeLabels).map(([key, label]) => (
              <option key={key} value={key} className="text-gray-900">{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Income */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
              +{totals.profitMargin.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos Totales</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totals.totalIncome)}</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gastos Totales</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totals.totalExpenses)}</p>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${totals.profit >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-orange-100 dark:bg-orange-900/30'} flex items-center justify-center`}>
              <svg className={`w-6 h-6 ${totals.profit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Beneficio Neto</p>
          <p className={`text-2xl font-bold mt-1 ${totals.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(totals.profit)}
          </p>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pipeline (Potencial)</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(leadStats.estimatedValue)}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Income vs Expenses Chart */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Ingresos vs Gastos</h3>
          <IncomeExpenseChart data={monthlyData} currency={currency} />
        </div>

        {/* Profit Chart */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Evolución del Beneficio</h3>
          <ProfitChart data={monthlyData} currency={currency} />
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Leads Stats */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leads</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total</span>
              <span className="font-semibold text-gray-900 dark:text-white">{leadStats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Nuevos</span>
              <span className="font-semibold text-blue-600">{leadStats.newLeads}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">En Pipeline</span>
              <span className="font-semibold text-purple-600">{leadStats.inPipeline}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Ganados</span>
              <span className="font-semibold text-green-600">{leadStats.won}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Perdidos</span>
              <span className="font-semibold text-red-600">{leadStats.lost}</span>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Tasa de conversión</span>
                <span className="font-bold text-syntalys-blue dark:text-blue-400">{leadStats.conversionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Stats */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Proyectos</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total</span>
              <span className="font-semibold text-gray-900 dark:text-white">{projectStats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Activos</span>
              <span className="font-semibold text-green-600">{projectStats.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Completados</span>
              <span className="font-semibold text-blue-600">{projectStats.completed}</span>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Valor total</span>
                <span className="font-bold text-syntalys-blue dark:text-blue-400">{formatCurrency(projectStats.totalValue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clients Stats */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Clientes</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total</span>
              <span className="font-semibold text-gray-900 dark:text-white">{clientStats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Activos</span>
              <span className="font-semibold text-green-600">{clientStats.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Potenciales</span>
              <span className="font-semibold text-purple-600">{clientStats.potential}</span>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Por país:</p>
              <div className="space-y-1">
                {Object.entries(clientStats.byCountry).slice(0, 3).map(([country, count]) => (
                  <div key={country} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{country}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Category */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Ingresos por Categoría</h3>
          <CategoryChart data={incomeByCategory} color="green" formatCurrency={formatCurrency} />
        </div>

        {/* Expenses by Category */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Gastos por Categoría</h3>
          <CategoryChart data={expenseByCategory} color="red" formatCurrency={formatCurrency} />
        </div>
      </div>
    </div>
  );
}

// Income vs Expense Bar Chart
function IncomeExpenseChart({ data, currency }: { data: { month: string; income: number; expenses: number }[]; currency: string }) {
  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expenses]), 1);

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400">No hay datos disponibles</div>;
  }

  return (
    <div className="h-64 flex items-end justify-between gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex gap-1 items-end h-48">
            {/* Income bar */}
            <div
              className="flex-1 bg-green-500 rounded-t transition-all hover:bg-green-600"
              style={{ height: `${(item.income / maxValue) * 100}%`, minHeight: item.income > 0 ? '4px' : '0' }}
              title={`Ingresos: ${item.income.toFixed(2)} ${currency}`}
            />
            {/* Expense bar */}
            <div
              className="flex-1 bg-red-500 rounded-t transition-all hover:bg-red-600"
              style={{ height: `${(item.expenses / maxValue) * 100}%`, minHeight: item.expenses > 0 ? '4px' : '0' }}
              title={`Gastos: ${item.expenses.toFixed(2)} ${currency}`}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 transform -rotate-45 origin-center">{item.month}</span>
        </div>
      ))}
    </div>
  );
}

// Profit Line Chart
function ProfitChart({ data, currency }: { data: { month: string; profit: number }[]; currency: string }) {
  const maxValue = Math.max(...data.map(d => Math.abs(d.profit)), 1);
  const hasNegative = data.some(d => d.profit < 0);

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400">No hay datos disponibles</div>;
  }

  return (
    <div className="h-64">
      <svg viewBox="0 0 800 256" className="w-full h-full">
        {/* Zero line */}
        <line
          x1="40"
          y1={hasNegative ? "128" : "240"}
          x2="780"
          y2={hasNegative ? "128" : "240"}
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="4"
        />

        {/* Area fill */}
        <defs>
          <linearGradient id="profitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Profit line and points */}
        {data.map((item, index) => {
          const x = 40 + (index / (data.length - 1 || 1)) * 740;
          const baseY = hasNegative ? 128 : 240;
          const y = baseY - (item.profit / maxValue) * (hasNegative ? 100 : 200);
          const nextItem = data[index + 1];
          const nextX = nextItem ? 40 + ((index + 1) / (data.length - 1 || 1)) * 740 : x;
          const nextY = nextItem ? baseY - (nextItem.profit / maxValue) * (hasNegative ? 100 : 200) : y;

          return (
            <g key={index}>
              {/* Line to next point */}
              {nextItem && (
                <line
                  x1={x}
                  y1={y}
                  x2={nextX}
                  y2={nextY}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}
              {/* Point */}
              <circle
                cx={x}
                cy={y}
                r="5"
                fill={item.profit >= 0 ? "#22c55e" : "#ef4444"}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer"
              />
              {/* Month label */}
              <text
                x={x}
                y="252"
                textAnchor="middle"
                fontSize="10"
                fill="#9ca3af"
              >
                {item.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Category Horizontal Bar Chart
function CategoryChart({
  data,
  color,
  formatCurrency
}: {
  data: { category: string; amount: number }[];
  color: 'green' | 'red';
  formatCurrency: (amount: number) => string;
}) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const sortedData = [...data].sort((a, b) => b.amount - a.amount).slice(0, 6);

  const categoryLabels: Record<string, string> = {
    web_development: 'Desarrollo Web',
    maintenance: 'Mantenimiento',
    hosting: 'Hosting',
    domain: 'Dominio',
    crm: 'CRM',
    subscription: 'Suscripción',
    software: 'Software',
    api: 'API',
    ssl: 'SSL',
    development: 'Desarrollo',
    ia: 'IA',
    cloud: 'Cloud',
    security: 'Seguridad',
    marketing: 'Marketing',
    other: 'Otro',
  };

  const bgColor = color === 'green' ? 'bg-green-500' : 'bg-red-500';

  if (sortedData.length === 0) {
    return <div className="h-48 flex items-center justify-center text-gray-400">No hay datos disponibles</div>;
  }

  return (
    <div className="space-y-3">
      {sortedData.map((item, index) => {
        const percentage = total > 0 ? (item.amount / total) * 100 : 0;
        return (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">{categoryLabels[item.category] || item.category}</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.amount)}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`${bgColor} h-2 rounded-full transition-all`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
