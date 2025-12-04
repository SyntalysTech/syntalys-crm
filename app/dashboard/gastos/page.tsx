'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { CompanyExpense, ClientExpense, Client, ClientWithExpenses, ExpenseCategory, ClientExpenseCategory, Frequency, Project } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaEllipsisV, FaTimes, FaChevronDown, FaChevronRight, FaPlus } from 'react-icons/fa';

type ModalType = 'company' | 'client-expense' | 'edit-company' | 'edit-client-expense' | null;

export default function GastosPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'empresa' | 'clientes'>('empresa');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState<ModalType>(null);
  const [editingCompanyExpense, setEditingCompanyExpense] = useState<CompanyExpense | null>(null);
  const [editingClientExpense, setEditingClientExpense] = useState<ClientExpense | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; openUp: boolean } | null>(null);
  const [dropdownType, setDropdownType] = useState<'company' | 'client' | null>(null);
  const [expandedText, setExpandedText] = useState<{ text: string; title: string } | null>(null);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const handleDropdownClick = (e: React.MouseEvent<HTMLButtonElement>, id: string, type: 'company' | 'client') => {
    if (openDropdown === id) {
      setOpenDropdown(null);
      setDropdownPosition(null);
      setDropdownType(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < 120;
      setDropdownPosition({
        top: openUp ? rect.top - 8 : rect.bottom + 8,
        left: rect.right - 144,
        openUp
      });
      setOpenDropdown(id);
      setDropdownType(type);
    }
  };

  // Datos de la empresa
  const [companyExpenses, setCompanyExpenses] = useState<CompanyExpense[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<CompanyExpense[]>([]);
  const [annualExpenses, setAnnualExpenses] = useState<CompanyExpense[]>([]);
  const [oneTimeExpenses, setOneTimeExpenses] = useState<CompanyExpense[]>([]);

  // Datos de clientes
  const [clients, setClients] = useState<ClientWithExpenses[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  // Form data para gastos de empresa
  const [companyFormData, setCompanyFormData] = useState({
    service_name: '',
    description: '',
    amount: '',
    currency: 'CHF' as 'CHF' | 'EUR' | 'USD',
    frequency: 'one_time' as Frequency,
    category: '' as ExpenseCategory | '',
    status: 'pending' as 'paid' | 'pending' | 'upcoming',
    start_date: '',
    end_date: '',
    renewal_date: '',
  });

  // Form data para gastos de clientes
  const [clientExpenseFormData, setClientExpenseFormData] = useState({
    client_id: '',
    project_id: '' as string | null,
    service_name: '',
    description: '',
    amount: '',
    currency: 'CHF' as 'CHF' | 'EUR' | 'USD',
    frequency: 'one_time' as Frequency,
    category: '' as ClientExpenseCategory | '',
    status: 'pending' as 'paid' | 'pending' | 'upcoming',
    start_date: '',
    end_date: '',
    renewal_date: '',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  // Función para determinar si un gasto aplica en el mes/año seleccionado
  function expenseAppliesToMonth(expense: CompanyExpense | ClientExpense, dateToCheck: Date): boolean {
    const month = dateToCheck.getMonth();
    const year = dateToCheck.getFullYear();
    
    // Si el gasto no es mensual o anual, no aplica por mes
    if (expense.frequency === 'one_time') {
      return false;
    }

    // Si tiene fecha de inicio, verificar que haya comenzado
    if (expense.start_date) {
      const startDate = new Date(expense.start_date);
      if (dateToCheck < startDate) {
        return false;
      }
    }

    // Si tiene fecha de fin, verificar que no haya terminado
    if (expense.end_date) {
      const endDate = new Date(expense.end_date);
      if (dateToCheck > endDate) {
        return false;
      }
    }

    // Si es anual, verificar que sea el mes correcto o cualquier mes
    if (expense.frequency === 'annual') {
      return true; // Mostrar los anuales en todos los meses
    }

    return true;
  }

  async function loadAllData() {
    setLoading(true);
    try {
      await Promise.all([
        loadCompanyExpenses(),
        loadClients(),
        loadAllClients(),
        loadAllProjects(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAllClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading all clients:', error);
      return;
    }

    setAllClients(data || []);
  }

  async function loadAllProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('project_name', { ascending: true });

    if (error) {
      console.error('Error loading all projects:', error);
      return;
    }

    setAllProjects(data || []);
  }

  async function loadCompanyExpenses() {
    const { data, error } = await supabase
      .from('company_expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading company expenses:', error);
      return;
    }

    setCompanyExpenses(data || []);
    setMonthlyExpenses((data || []).filter(e => e.frequency === 'monthly' && expenseAppliesToMonth(e, selectedDate)));
    setAnnualExpenses((data || []).filter(e => e.frequency === 'annual'));
    setOneTimeExpenses((data || []).filter(e => e.frequency === 'one_time'));
  }

  async function loadClients() {
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (clientsError) {
      console.error('Error loading clients:', clientsError);
      return;
    }

    const { data: expensesData, error: expensesError } = await supabase
      .from('client_expenses')
      .select('*');

    if (expensesError) {
      console.error('Error loading client data:', expensesError);
      return;
    }

    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*');

    if (projectsError) {
      console.error('Error loading projects:', projectsError);
      return;
    }

    const clientsWithExpenses: ClientWithExpenses[] = (clientsData || []).map(client => {
      const allClientExpenses = (expensesData || []).filter(e => e.client_id === client.id);
      const clientExpenses = allClientExpenses.filter(e => !e.project_id);
      const clientProjects = (projectsData || []).filter(p => p.client_id === client.id);

      const totalExpensesMonthly = allClientExpenses
        .reduce((sum, e) => {
          const amount = Number(e.amount);
          return sum + (e.frequency === 'monthly' ? amount : e.frequency === 'annual' ? amount / 12 : 0);
        }, 0);

      const totalExpensesAnnual = allClientExpenses
        .reduce((sum, e) => {
          const amount = Number(e.amount);
          return sum + (e.frequency === 'monthly' ? amount * 12 : e.frequency === 'annual' ? amount : 0);
        }, 0);

      return {
        ...client,
        expenses: allClientExpenses,
        projects: clientProjects,
        total_expenses_monthly: totalExpensesMonthly,
        total_expenses_annual: totalExpensesAnnual,
      };
    });

    setClients(clientsWithExpenses);
  }

  async function updateExpenseStatus(expenseId: string, newStatus: 'paid' | 'pending' | 'upcoming') {
    const { error } = await supabase
      .from('company_expenses')
      .update({ status: newStatus })
      .eq('id', expenseId);

    if (error) {
      console.error('Error updating expense status:', error);
      return;
    }

    loadAllData();
  }

  function handleEditCompanyExpense(expense: CompanyExpense) {
    setEditingCompanyExpense(expense);
    setCompanyFormData({
      service_name: expense.service_name,
      description: expense.description || '',
      amount: expense.amount.toString(),
      currency: expense.currency,
      frequency: expense.frequency,
      category: expense.category || '',
      status: expense.status,
      start_date: expense.start_date || '',
      end_date: expense.end_date || '',
      renewal_date: expense.renewal_date || '',
    });
    setShowModal('edit-company');
  }

  function handleEditClientExpense(expense: ClientExpense) {
    setEditingClientExpense(expense);
    setClientExpenseFormData({
      client_id: expense.client_id,
      project_id: expense.project_id || null,
      service_name: expense.service_name,
      description: expense.description || '',
      amount: expense.amount.toString(),
      currency: expense.currency,
      frequency: expense.frequency,
      category: expense.category || '',
      status: expense.status,
      renewal_date: expense.renewal_date || '',
      start_date: expense.start_date || '',
      end_date: expense.end_date || '',
    });
    setShowModal('edit-client-expense');
  }

  async function handleUpdateCompanyExpense() {
    if (!editingCompanyExpense || !companyFormData.service_name || !companyFormData.amount) {
      alert(t.messages.fillRequired);
      return;
    }

    try {
      const { error } = await supabase
        .from('company_expenses')
        .update({
          service_name: companyFormData.service_name,
          description: companyFormData.description || null,
          amount: parseFloat(companyFormData.amount),
          currency: companyFormData.currency,
          frequency: companyFormData.frequency,
          category: companyFormData.category || null,
          status: companyFormData.status,
          renewal_date: companyFormData.renewal_date ? companyFormData.renewal_date : null,
          start_date: companyFormData.start_date ? companyFormData.start_date : null,
          end_date: companyFormData.end_date ? companyFormData.end_date : null,
        })
        .eq('id', editingCompanyExpense.id);

      if (error) {
        console.error('Error updating company expense:', error);
        alert(t.messages.saveError);
        return;
      }

      resetCompanyForm();
      setEditingCompanyExpense(null);
      setShowModal(null);
      loadAllData();
    } catch (error) {
      console.error('Error in handleUpdateCompanyExpense:', error);
      alert(t.messages.saveError);
    }
  }

  async function handleUpdateClientExpense() {
    if (!editingClientExpense || !clientExpenseFormData.client_id || !clientExpenseFormData.service_name || !clientExpenseFormData.amount) {
      alert(t.messages.fillRequired);
      return;
    }

    try {
      const { error } = await supabase
        .from('client_expenses')
        .update({
          client_id: clientExpenseFormData.client_id,
          project_id: clientExpenseFormData.project_id || null,
          service_name: clientExpenseFormData.service_name,
          description: clientExpenseFormData.description || null,
          amount: parseFloat(clientExpenseFormData.amount),
          currency: clientExpenseFormData.currency,
          frequency: clientExpenseFormData.frequency,
          category: clientExpenseFormData.category || null,
          status: clientExpenseFormData.status,
          renewal_date: clientExpenseFormData.renewal_date ? clientExpenseFormData.renewal_date : null,
          start_date: clientExpenseFormData.start_date ? clientExpenseFormData.start_date : null,
          end_date: clientExpenseFormData.end_date ? clientExpenseFormData.end_date : null,
        })
        .eq('id', editingClientExpense.id);

      if (error) {
        console.error('Error updating client expense:', error);
        alert(t.messages.saveError);
        return;
      }

      resetClientExpenseForm();
      setEditingClientExpense(null);
      setShowModal(null);
      loadAllData();
    } catch (error) {
      console.error('Error in handleUpdateClientExpense:', error);
      alert(t.messages.saveError);
    }
  }

  async function handleDeleteCompanyExpense(expenseId: string) {
    if (!confirm(t.expenses.deleteExpenseConfirm)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('company_expenses')
        .delete()
        .eq('id', expenseId);

      if (error) {
        console.error('Error deleting company expense:', error);
        alert(t.messages.deleteError);
        return;
      }

      loadAllData();
    } catch (error) {
      console.error('Error in handleDeleteCompanyExpense:', error);
      alert(t.messages.deleteError);
    }
  }

  async function handleDeleteClientExpense(expenseId: string) {
    if (!confirm(t.expenses.deleteExpenseConfirm)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('client_expenses')
        .delete()
        .eq('id', expenseId);

      if (error) {
        console.error('Error deleting client expense:', error);
        alert(t.messages.deleteError);
        return;
      }

      loadAllData();
    } catch (error) {
      console.error('Error in handleDeleteClientExpense:', error);
      alert(t.messages.deleteError);
    }
  }

  function resetCompanyForm() {
    setCompanyFormData({
      service_name: '',
      description: '',
      amount: '',
      currency: 'CHF',
      frequency: 'one_time',
      category: '',
      status: 'pending',
      start_date: '',
      end_date: '',
      renewal_date: '',
    });
  }

  function resetClientExpenseForm() {
    setClientExpenseFormData({
      client_id: '',
      project_id: null,
      service_name: '',
      description: '',
      amount: '',
      currency: 'CHF',
      frequency: 'one_time',
      category: '',
      status: 'pending',
      start_date: '',
      end_date: '',
      renewal_date: '',
    });
  }

  async function handleAddCompanyExpense() {
    if (!companyFormData.service_name || !companyFormData.amount) {
      alert(t.messages.fillRequired);
      return;
    }

    try {
      const { error } = await supabase
        .from('company_expenses')
        .insert([{
          service_name: companyFormData.service_name,
          description: companyFormData.description || null,
          amount: parseFloat(companyFormData.amount),
          currency: companyFormData.currency,
          frequency: companyFormData.frequency,
          category: companyFormData.category || null,
          status: companyFormData.status,
          renewal_date: companyFormData.renewal_date ? companyFormData.renewal_date : null,
          start_date: companyFormData.start_date ? companyFormData.start_date : null,
          end_date: companyFormData.end_date ? companyFormData.end_date : null,
        }]);

      if (error) {
        console.error('Error adding company expense:', error.message, error.details, error.hint);
        alert(t.messages.saveError);
        return;
      }

      resetCompanyForm();
      setShowModal(null);
      loadAllData();
    } catch (error) {
      console.error('Error in handleAddCompanyExpense:', error);
      alert(t.messages.saveError);
    }
  }

  async function handleAddClientExpense() {
    if (!clientExpenseFormData.client_id || !clientExpenseFormData.service_name || !clientExpenseFormData.amount) {
      alert(t.messages.fillRequired);
      return;
    }

    try {
      const { error } = await supabase
        .from('client_expenses')
        .insert([{
          client_id: clientExpenseFormData.client_id,
          project_id: clientExpenseFormData.project_id || null,
          service_name: clientExpenseFormData.service_name,
          description: clientExpenseFormData.description || null,
          amount: parseFloat(clientExpenseFormData.amount),
          currency: clientExpenseFormData.currency,
          frequency: clientExpenseFormData.frequency,
          category: clientExpenseFormData.category || null,
          status: clientExpenseFormData.status,
          renewal_date: clientExpenseFormData.renewal_date ? clientExpenseFormData.renewal_date : null,
          start_date: clientExpenseFormData.start_date ? clientExpenseFormData.start_date : null,
          end_date: clientExpenseFormData.end_date ? clientExpenseFormData.end_date : null,
        }]);

      if (error) {
        console.error('Error adding client expense:', error);
        alert(t.messages.saveError);
        return;
      }

      resetClientExpenseForm();
      setShowModal(null);
      loadAllData();
    } catch (error) {
      console.error('Error in handleAddClientExpense:', error);
      alert(t.messages.saveError);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">{t.common.loading}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.expenses.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t.expenses.subtitle}
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'empresa' ? (
            <button
              onClick={() => setShowModal('company')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              + {t.expenses.addCompanyExpense}
            </button>
          ) : (
            <button
              onClick={() => setShowModal('client-expense')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm"
            >
              + {t.expenses.addClientExpense}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('empresa')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'empresa'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            {t.expenses.companyExpensesTab}
          </button>
          <button
            onClick={() => setActiveTab('clientes')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'clientes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            {t.expenses.clientExpensesTab}
          </button>
        </div>
      </div>

      {/* Selector de Mes/Año para Empresa */}
      {activeTab === 'empresa' && (
        <div className="mb-6 flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Año</label>
              <select
                value={selectedDate.getFullYear()}
                onChange={(e) => {
                  const newDate = new Date(selectedDate);
                  newDate.setFullYear(parseInt(e.target.value));
                  setSelectedDate(newDate);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
              >
                {[2023, 2024, 2025, 2026, 2027].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Mes</label>
              <select
                value={selectedDate.getMonth()}
                onChange={(e) => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(parseInt(e.target.value));
                  setSelectedDate(newDate);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
              >
                <option value="0">Enero</option>
                <option value="1">Febrero</option>
                <option value="2">Marzo</option>
                <option value="3">Abril</option>
                <option value="4">Mayo</option>
                <option value="5">Junio</option>
                <option value="6">Julio</option>
                <option value="7">Agosto</option>
                <option value="8">Septiembre</option>
                <option value="9">Octubre</option>
                <option value="10">Noviembre</option>
                <option value="11">Diciembre</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Hoy
          </button>
        </div>
      )}

      {/* Contenido según tab */}
      {activeTab === 'empresa' ? (
        <div>
          {/* Gastos Mensuales */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 mb-6 overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/30 border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.expenses.monthlyExpenses}</h2>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-syntalys-blue dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.expenses.service}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.expenses.category}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.common.amount}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.common.status}</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600">
                        {t.expenses.noMonthlyExpenses}
                      </td>
                    </tr>
                  ) : (
                    monthlyExpenses.map((expense, index) => (
                      <tr key={expense.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} hover:bg-blue-50 dark:hover:bg-blue-900/20`}>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{expense.service_name}</div>
                          {expense.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {expense.description.length > 40 ? (
                                <span>
                                  {expense.description.substring(0, 40)}...
                                  <button
                                    onClick={() => setExpandedText({ text: expense.description!, title: expense.service_name })}
                                    className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    {t.common.seeMore}
                                  </button>
                                </span>
                              ) : expense.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{expense.category || '-'}</span>
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {expense.currency} {Number(expense.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <select
                            value={expense.status}
                            onChange={(e) => updateExpenseStatus(expense.id, e.target.value as 'paid' | 'pending' | 'upcoming')}
                            className={`px-2 py-1 text-xs font-medium rounded border cursor-pointer ${
                              expense.status === 'paid' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700' :
                              expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700' :
                              'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <option value="paid">{t.expenses.paid}</option>
                            <option value="pending">{t.expenses.pending}</option>
                            <option value="upcoming">{t.expenses.upcoming}</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-center">
                          <button
                            onClick={(e) => handleDropdownClick(e, `monthly-${expense.id}`, 'company')}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            <FaEllipsisV className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gastos Únicos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 mb-6 overflow-hidden">
            <div className="px-4 py-3 bg-green-50 dark:bg-green-900/30 border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.expenses.oneTimeExpenses}</h2>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-syntalys-blue dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.expenses.service}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.expenses.category}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.common.amount}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.common.status}</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {oneTimeExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600">
                        {t.expenses.noOneTimeExpenses}
                      </td>
                    </tr>
                  ) : (
                    oneTimeExpenses.map((expense, index) => (
                      <tr key={expense.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} hover:bg-green-50 dark:hover:bg-green-900/20`}>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{expense.service_name}</div>
                          {expense.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {expense.description.length > 40 ? (
                                <span>
                                  {expense.description.substring(0, 40)}...
                                  <button
                                    onClick={() => setExpandedText({ text: expense.description!, title: expense.service_name })}
                                    className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    {t.common.seeMore}
                                  </button>
                                </span>
                              ) : expense.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{expense.category || '-'}</span>
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {expense.currency} {Number(expense.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <select
                            value={expense.status}
                            onChange={(e) => updateExpenseStatus(expense.id, e.target.value as 'paid' | 'pending' | 'upcoming')}
                            className={`px-2 py-1 text-xs font-medium rounded border cursor-pointer ${
                              expense.status === 'paid' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700' :
                              expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700' :
                              'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <option value="paid">{t.expenses.paid}</option>
                            <option value="pending">{t.expenses.pending}</option>
                            <option value="upcoming">{t.expenses.upcoming}</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-center">
                          <button
                            onClick={(e) => handleDropdownClick(e, `onetime-${expense.id}`, 'company')}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            <FaEllipsisV className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gastos Anuales */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 overflow-hidden">
            <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/30 border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.expenses.annualExpenses}</h2>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-syntalys-blue dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.expenses.service}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.expenses.category}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.common.amount}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.expenses.renewal}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.common.status}</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {annualExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600">
                        {t.expenses.noAnnualExpenses}
                      </td>
                    </tr>
                  ) : (
                    annualExpenses.map((expense, index) => (
                      <tr key={expense.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} hover:bg-purple-50 dark:hover:bg-purple-900/20`}>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{expense.service_name}</div>
                          {expense.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {expense.description.length > 40 ? (
                                <span>
                                  {expense.description.substring(0, 40)}...
                                  <button
                                    onClick={() => setExpandedText({ text: expense.description!, title: expense.service_name })}
                                    className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    {t.common.seeMore}
                                  </button>
                                </span>
                              ) : expense.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{expense.category || '-'}</span>
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {expense.currency} {Number(expense.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {expense.renewal_date ? new Date(expense.renewal_date).toLocaleDateString('es-ES') : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <select
                            value={expense.status}
                            onChange={(e) => updateExpenseStatus(expense.id, e.target.value as 'paid' | 'pending' | 'upcoming')}
                            className={`px-2 py-1 text-xs font-medium rounded border cursor-pointer ${
                              expense.status === 'paid' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700' :
                              expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700' :
                              'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <option value="paid">{t.expenses.paid}</option>
                            <option value="pending">{t.expenses.pending}</option>
                            <option value="upcoming">{t.expenses.upcoming}</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-center">
                          <button
                            onClick={(e) => handleDropdownClick(e, `annual-${expense.id}`, 'company')}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            <FaEllipsisV className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Gastos de Clientes - Vista por Cliente */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 overflow-hidden">
            <div className="px-4 py-3 bg-orange-50 dark:bg-orange-900/30 border-b border-gray-300 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.expenses.expensesByClient}</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t.expenses.expensesByClientSubtitle}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-syntalys-blue dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600 w-8"></th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.expenses.client}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.expenses.totalServices}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.expenses.monthlyTotal}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-200 border border-syntalys-blue dark:border-gray-600">{t.expenses.annualTotal}</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600">
                        {t.expenses.noClientsRegistered}
                      </td>
                    </tr>
                  ) : (
                    clients.map((client, index) => {
                      const clientExpenses = client.expenses || [];
                      const clientProjects = client.projects || [];
                      const monthlyTotal = client.total_expenses_monthly || 0;
                      const annualTotal = client.total_expenses_annual || 0;
                      const isExpanded = expandedClientId === client.id;

                      return (
                        <>
                          {/* Fila del cliente */}
                          <tr
                            key={client.id}
                            className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer`}
                            onClick={() => setExpandedClientId(isExpanded ? null : client.id)}
                          >
                            <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-center">
                              {isExpanded ? (
                                <FaChevronDown className="w-3 h-3 text-orange-500" />
                              ) : (
                                <FaChevronRight className="w-3 h-3 text-gray-400" />
                              )}
                            </td>
                            <td className="px-4 py-3 border border-gray-300 dark:border-gray-600">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">{client.name}</div>
                              {client.email && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">{client.email}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 border border-gray-300 dark:border-gray-600">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{(clientExpenses.filter(e => !e.project_id).length + clientProjects.length)} items</span>
                            </td>
                            <td className="px-4 py-3 border border-gray-300 dark:border-gray-600">
                              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                CHF {monthlyTotal.toFixed(2)}/mes
                              </span>
                            </td>
                            <td className="px-4 py-3 border border-gray-300 dark:border-gray-600">
                              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                CHF {annualTotal.toFixed(2)}/año
                              </span>
                            </td>
                          </tr>

                          {/* Detalle expandido del cliente */}
                          {isExpanded && (
                            <tr key={`${client.id}-detail`}>
                              <td colSpan={5} className="p-0 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                                <div className="p-4">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* GASTOS GENERALES - Izquierda */}
                                    <div className="border-r border-gray-300 dark:border-gray-600 pr-6">
                                      <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Gastos Generales</h4>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setClientExpenseFormData({ ...clientExpenseFormData, client_id: client.id, project_id: null });
                                            setShowModal('client-expense');
                                          }}
                                          className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded transition-colors"
                                        >
                                          <FaPlus className="w-3 h-3" />
                                          Añadir
                                        </button>
                                      </div>
                                      {clientExpenses.filter(e => !e.project_id).length === 0 ? (
                                        <div className="bg-gray-200 dark:bg-gray-700 rounded p-3 text-center">
                                          <p className="text-xs text-gray-600 dark:text-gray-400">Sin gastos generales</p>
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {clientExpenses.filter(e => !e.project_id).map(expense => (
                                            <div key={expense.id} className="flex justify-between items-start bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{expense.service_name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                  {expense.frequency === 'monthly' ? '📅 Mensual' : expense.frequency === 'annual' ? '📆 Anual' : '🎯 Único'}
                                                </p>
                                              </div>
                                              <div className="flex gap-2 items-center ml-2">
                                                <div className="text-right">
                                                  <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                                    {expense.currency} {expense.frequency === 'annual' ? (Number(expense.amount) / 12).toFixed(2) : Number(expense.amount).toFixed(2)}
                                                  </p>
                                                  <p className="text-xs text-gray-500 dark:text-gray-400">por mes</p>
                                                </div>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDropdownClick(e, `client-${expense.id}`, 'client');
                                                  }}
                                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                >
                                                  <FaEllipsisV className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* PROYECTOS - Derecha */}
                                    <div className="lg:border-l border-gray-300 dark:border-gray-600 lg:pl-6">
                                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Proyectos</h4>
                                      {clientProjects.length === 0 ? (
                                        <div className="bg-gray-200 dark:bg-gray-700 rounded p-3 text-center">
                                          <p className="text-xs text-gray-600 dark:text-gray-400">Sin proyectos asociados</p>
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                        {clientProjects.map(project => {
                                          const projectExpenses = clients.find(c => c.id === client.id)?.expenses?.filter(e => e.project_id === project.id) || [];
                                          const projectMonthly = projectExpenses
                                            .reduce((sum, e) => {
                                              const amount = Number(e.amount);
                                              return sum + (e.frequency === 'monthly' ? amount : e.frequency === 'annual' ? amount / 12 : 0);
                                            }, 0);
                                          const projectAnnual = projectExpenses
                                            .reduce((sum, e) => {
                                              const amount = Number(e.amount);
                                              return sum + (e.frequency === 'monthly' ? amount * 12 : e.frequency === 'annual' ? amount : 0);
                                            }, 0);
                                          const isProjectExpanded = expandedProjectId === project.id;

                                          return (
                                            <div key={project.id}>
                                              <button
                                                onClick={() => setExpandedProjectId(isProjectExpanded ? null : project.id)}
                                                className="w-full flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 p-3 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                              >
                                                <div className="flex items-center gap-2">
                                                  {isProjectExpanded ? <FaChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <FaChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                                                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{project.project_name}</span>
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                  {projectMonthly.toFixed(2)}/mes · {projectAnnual.toFixed(2)}/año
                                                </div>
                                              </button>
                                              {isProjectExpanded && (
                                                <div className="mt-2 space-y-2 ml-2 border-l-2 border-blue-300 dark:border-blue-700 pl-3">
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setClientExpenseFormData({ ...clientExpenseFormData, client_id: client.id, project_id: project.id });
                                                      setShowModal('client-expense');
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded transition-colors"
                                                  >
                                                    <FaPlus className="w-3 h-3" />
                                                    Añadir gasto
                                                  </button>
                                                  {projectExpenses.length === 0 ? (
                                                    <div className="bg-gray-200 dark:bg-gray-700 rounded p-2 text-center">
                                                      <p className="text-xs text-gray-600 dark:text-gray-400">Sin gastos en este proyecto</p>
                                                    </div>
                                                  ) : (
                                                    <div className="space-y-1.5">
                                                      {projectExpenses.map(expense => (
                                                        <div key={expense.id} className="flex justify-between items-start bg-white dark:bg-gray-800 p-2.5 rounded border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                                                          <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{expense.service_name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                              {expense.frequency === 'monthly' ? 'Mensual' : 'Anual'}
                                                            </p>
                                                          </div>
                                                          <div className="flex gap-1 items-center ml-2">
                                                            <div className="text-right">
                                                              <p className="text-xs font-bold text-green-600 dark:text-green-400">
                                                                {expense.currency} {expense.frequency === 'annual' ? (Number(expense.amount) / 12).toFixed(2) : Number(expense.amount).toFixed(2)}
                                                              </p>
                                                              <p className="text-xs text-gray-500 dark:text-gray-400">al mes</p>
                                                            </div>
                                                            <button
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDropdownClick(e, `client-${expense.id}`, 'client');
                                                              }}
                                                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                            >
                                                              <FaEllipsisV className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                            </button>
                                                          </div>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Gasto de Empresa */}
      {showModal === 'company' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.expenses.addCompanyExpenseTitle}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{t.expenses.addCompanyExpenseSubtitle}</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddCompanyExpense(); }} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.expenses.serviceName} *
                  </label>
                  <input
                    type="text"
                    value={companyFormData.service_name}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, service_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t.forms.serviceNamePlaceholder}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.description}</label>
                  <input
                    type="text"
                    value={companyFormData.description}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t.expenses.optionalDescription}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.common.amount} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={companyFormData.amount}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.currency}</label>
                  <select
                    value={companyFormData.currency}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, currency: e.target.value as 'CHF' | 'EUR' | 'USD' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="CHF">CHF</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.expenses.frequency}</label>
                  <select
                    value={companyFormData.frequency}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, frequency: e.target.value as Frequency })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="one_time">{t.expenses.oneTime}</option>
                    <option value="monthly">{t.expenses.monthly}</option>
                    <option value="annual">{t.expenses.annual}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.expenses.category}</label>
                  <select
                    value={companyFormData.category}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, category: e.target.value as ExpenseCategory | '' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t.expenses.noCategory}</option>
                    <option value="software">{t.expenses.software}</option>
                    <option value="hosting">{t.expenses.hosting}</option>
                    <option value="domain">{t.expenses.domain}</option>
                    <option value="api">{t.expenses.api}</option>
                    <option value="development">{t.expenses.development}</option>
                    <option value="ia">{t.expenses.ia}</option>
                    <option value="cloud">{t.expenses.cloud}</option>
                    <option value="security">{t.expenses.security}</option>
                    <option value="backup">{t.expenses.backup}</option>
                    <option value="analytics">{t.expenses.analytics}</option>
                    <option value="marketing">{t.expenses.marketing}</option>
                    <option value="seo">{t.expenses.seo}</option>
                    <option value="email">{t.expenses.email}</option>
                    <option value="communications">{t.expenses.communications}</option>
                    <option value="storage">{t.expenses.storage}</option>
                    <option value="infrastructure">{t.expenses.infrastructure}</option>
                    <option value="licenses">{t.expenses.licenses}</option>
                    <option value="subscriptions">{t.expenses.subscriptions}</option>
                    <option value="tools">{t.expenses.tools}</option>
                    <option value="automation">{t.expenses.automation}</option>
                    <option value="testing">{t.expenses.testing}</option>
                    <option value="monitoring">{t.expenses.monitoring}</option>
                    <option value="cdn">{t.expenses.cdn}</option>
                    <option value="database">{t.expenses.database}</option>
                    <option value="payments">{t.expenses.payments}</option>
                    <option value="advertising">{t.expenses.advertising}</option>
                    <option value="training">{t.expenses.training}</option>
                    <option value="support">{t.expenses.support}</option>
                    <option value="other">{t.expenses.other}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.status}</label>
                  <select
                    value={companyFormData.status}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, status: e.target.value as 'paid' | 'pending' | 'upcoming' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="paid">{t.expenses.paid}</option>
                    <option value="pending">{t.expenses.pending}</option>
                    <option value="upcoming">{t.expenses.upcoming}</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de inicio</label>
                  <input
                    type="date"
                    value={companyFormData.start_date}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Desde cuándo empezó este gasto</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de fin (opcional)</label>
                  <input
                    type="date"
                    value={companyFormData.end_date}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Si dejaron de pagar (opcional)</p>
                </div>
                {companyFormData.frequency === 'annual' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.expenses.renewalDate}</label>
                    <input
                      type="date"
                      value={companyFormData.renewal_date}
                      onChange={(e) => setCompanyFormData({ ...companyFormData, renewal_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t.expenses.addExpense}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  {t.common.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar Gasto de Cliente */}
      {showModal === 'client-expense' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.expenses.addClientExpenseTitle}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t.expenses.addClientExpenseSubtitle}</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddClientExpense(); }} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.expenses.client} *
                  </label>
                  <select
                    value={clientExpenseFormData.client_id}
                    onChange={(e) => {
                      setClientExpenseFormData({ ...clientExpenseFormData, client_id: e.target.value, project_id: null });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">{t.expenses.selectClient}</option>
                    {allClients.map((client) => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                {clientExpenseFormData.client_id && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proyecto (opcional)</label>
                    <select
                      value={clientExpenseFormData.project_id || ''}
                      onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, project_id: e.target.value || null })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Gasto general</option>
                      {allProjects
                        .filter(p => p.client_id === clientExpenseFormData.client_id)
                        .map((project) => (
                          <option key={project.id} value={project.id}>{project.project_name}</option>
                        ))
                      }
                    </select>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.expenses.serviceName} *
                  </label>
                  <input
                    type="text"
                    value={clientExpenseFormData.service_name}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, service_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t.forms.serviceNamePlaceholder}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.description}</label>
                  <input
                    type="text"
                    value={clientExpenseFormData.description}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t.expenses.optionalDescription}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.common.amount} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={clientExpenseFormData.amount}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.currency}</label>
                  <select
                    value={clientExpenseFormData.currency}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, currency: e.target.value as 'CHF' | 'EUR' | 'USD' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="CHF">CHF</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.expenses.frequency}</label>
                  <select
                    value={clientExpenseFormData.frequency}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, frequency: e.target.value as Frequency })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="one_time">{t.expenses.oneTime}</option>
                    <option value="monthly">{t.expenses.monthly}</option>
                    <option value="annual">{t.expenses.annual}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.expenses.category}</label>
                  <select
                    value={clientExpenseFormData.category}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, category: e.target.value as ClientExpenseCategory | '' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t.expenses.noCategory}</option>
                    <option value="domain">{t.expenses.domain}</option>
                    <option value="hosting">{t.expenses.hosting}</option>
                    <option value="ssl">{t.expenses.ssl}</option>
                    <option value="api">{t.expenses.api}</option>
                    <option value="maintenance">{t.expenses.maintenanceService}</option>
                    <option value="other">{t.expenses.other}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.status}</label>
                  <select
                    value={clientExpenseFormData.status}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, status: e.target.value as 'paid' | 'pending' | 'upcoming' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="paid">{t.expenses.paid}</option>
                    <option value="pending">{t.expenses.pending}</option>
                    <option value="upcoming">{t.expenses.upcoming}</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de inicio</label>
                  <input
                    type="date"
                    value={clientExpenseFormData.start_date}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Desde cuándo empezó este gasto</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de fin (opcional)</label>
                  <input
                    type="date"
                    value={clientExpenseFormData.end_date}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Si dejaron de pagar (opcional)</p>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  {t.expenses.addExpense}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  {t.common.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Gasto de Empresa */}
      {showModal === 'edit-company' && editingCompanyExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.expenses.editCompanyExpenseTitle}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{t.expenses.addCompanyExpenseSubtitle}</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateCompanyExpense(); }} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.expenses.serviceName} *
                  </label>
                  <input
                    type="text"
                    value={companyFormData.service_name}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, service_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.description}</label>
                  <input
                    type="text"
                    value={companyFormData.description}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t.expenses.optionalDescription}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.common.amount} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={companyFormData.amount}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.currency}</label>
                  <select
                    value={companyFormData.currency}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, currency: e.target.value as 'CHF' | 'EUR' | 'USD' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="CHF">CHF</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.expenses.frequency}</label>
                  <select
                    value={companyFormData.frequency}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, frequency: e.target.value as Frequency })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="one_time">{t.expenses.oneTime}</option>
                    <option value="monthly">{t.expenses.monthly}</option>
                    <option value="annual">{t.expenses.annual}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.expenses.category}</label>
                  <select
                    value={companyFormData.category}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, category: e.target.value as ExpenseCategory | '' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t.expenses.noCategory}</option>
                    <option value="software">{t.expenses.software}</option>
                    <option value="hosting">{t.expenses.hosting}</option>
                    <option value="domain">{t.expenses.domain}</option>
                    <option value="api">{t.expenses.api}</option>
                    <option value="development">{t.expenses.development}</option>
                    <option value="ia">{t.expenses.ia}</option>
                    <option value="cloud">{t.expenses.cloud}</option>
                    <option value="security">{t.expenses.security}</option>
                    <option value="backup">{t.expenses.backup}</option>
                    <option value="analytics">{t.expenses.analytics}</option>
                    <option value="marketing">{t.expenses.marketing}</option>
                    <option value="seo">{t.expenses.seo}</option>
                    <option value="email">{t.expenses.email}</option>
                    <option value="communications">{t.expenses.communications}</option>
                    <option value="storage">{t.expenses.storage}</option>
                    <option value="infrastructure">{t.expenses.infrastructure}</option>
                    <option value="licenses">{t.expenses.licenses}</option>
                    <option value="subscriptions">{t.expenses.subscriptions}</option>
                    <option value="tools">{t.expenses.tools}</option>
                    <option value="automation">{t.expenses.automation}</option>
                    <option value="testing">{t.expenses.testing}</option>
                    <option value="monitoring">{t.expenses.monitoring}</option>
                    <option value="cdn">{t.expenses.cdn}</option>
                    <option value="database">{t.expenses.database}</option>
                    <option value="payments">{t.expenses.payments}</option>
                    <option value="advertising">{t.expenses.advertising}</option>
                    <option value="training">{t.expenses.training}</option>
                    <option value="support">{t.expenses.support}</option>
                    <option value="other">{t.expenses.other}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.status}</label>
                  <select
                    value={companyFormData.status}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, status: e.target.value as 'paid' | 'pending' | 'upcoming' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="paid">{t.expenses.paid}</option>
                    <option value="pending">{t.expenses.pending}</option>
                    <option value="upcoming">{t.expenses.upcoming}</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de inicio</label>
                  <input
                    type="date"
                    value={companyFormData.start_date}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Desde cuándo empezó este gasto</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de fin (opcional)</label>
                  <input
                    type="date"
                    value={companyFormData.end_date}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Si dejaron de pagar (opcional)</p>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t.common.saveChanges}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(null); setEditingCompanyExpense(null); resetCompanyForm(); }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  {t.common.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Gasto de Cliente */}
      {showModal === 'edit-client-expense' && editingClientExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.expenses.editClientExpenseTitle}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t.expenses.addClientExpenseSubtitle}</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateClientExpense(); }} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.expenses.client} *
                  </label>
                  <select
                    value={clientExpenseFormData.client_id}
                    onChange={(e) => {
                      setClientExpenseFormData({ ...clientExpenseFormData, client_id: e.target.value, project_id: null });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">{t.expenses.selectClient}</option>
                    {allClients.map((client) => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                {clientExpenseFormData.client_id && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proyecto (opcional)</label>
                    <select
                      value={clientExpenseFormData.project_id || ''}
                      onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, project_id: e.target.value || null })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Gasto general</option>
                      {allProjects
                        .filter(p => p.client_id === clientExpenseFormData.client_id)
                        .map((project) => (
                          <option key={project.id} value={project.id}>{project.project_name}</option>
                        ))
                      }
                    </select>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.expenses.serviceName} *
                  </label>
                  <input
                    type="text"
                    value={clientExpenseFormData.service_name}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, service_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.description}</label>
                  <input
                    type="text"
                    value={clientExpenseFormData.description}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t.expenses.optionalDescription}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.common.amount} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={clientExpenseFormData.amount}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.currency}</label>
                  <select
                    value={clientExpenseFormData.currency}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, currency: e.target.value as 'CHF' | 'EUR' | 'USD' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="CHF">CHF</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.expenses.frequency}</label>
                  <select
                    value={clientExpenseFormData.frequency}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, frequency: e.target.value as Frequency })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="one_time">{t.expenses.oneTime}</option>
                    <option value="monthly">{t.expenses.monthly}</option>
                    <option value="annual">{t.expenses.annual}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.expenses.category}</label>
                  <select
                    value={clientExpenseFormData.category}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, category: e.target.value as ClientExpenseCategory | '' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t.expenses.noCategory}</option>
                    <option value="domain">{t.expenses.domain}</option>
                    <option value="hosting">{t.expenses.hosting}</option>
                    <option value="ssl">{t.expenses.ssl}</option>
                    <option value="api">{t.expenses.api}</option>
                    <option value="maintenance">{t.expenses.maintenanceService}</option>
                    <option value="other">{t.expenses.other}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.status}</label>
                  <select
                    value={clientExpenseFormData.status}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, status: e.target.value as 'paid' | 'pending' | 'upcoming' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="paid">{t.expenses.paid}</option>
                    <option value="pending">{t.expenses.pending}</option>
                    <option value="upcoming">{t.expenses.upcoming}</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de inicio</label>
                  <input
                    type="date"
                    value={clientExpenseFormData.start_date}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Desde cuándo empezó este gasto</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de fin (opcional)</label>
                  <input
                    type="date"
                    value={clientExpenseFormData.end_date}
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Si dejaron de pagar (opcional)</p>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  {t.common.saveChanges}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(null); setEditingClientExpense(null); resetClientExpenseForm(); }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  {t.common.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver texto completo */}
      {expandedText && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{expandedText.title}</h3>
              <button
                onClick={() => setExpandedText(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{expandedText.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown fijo para gastos */}
      {openDropdown && dropdownPosition && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpenDropdown(null); setDropdownPosition(null); setDropdownType(null); }} />
          <div
            className="fixed w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
            style={{
              top: dropdownPosition.openUp ? 'auto' : dropdownPosition.top,
              bottom: dropdownPosition.openUp ? window.innerHeight - dropdownPosition.top : 'auto',
              left: dropdownPosition.left
            }}
          >
            <button
              onClick={() => {
                const expenseId = openDropdown.replace(/^(monthly-|annual-|onetime-|client-)/, '');
                if (dropdownType === 'company') {
                  const expense = companyExpenses.find(e => e.id === expenseId);
                  if (expense) handleEditCompanyExpense(expense);
                } else {
                  const allClientExpenses = clients.flatMap(c => c.expenses || []);
                  const expense = allClientExpenses.find(e => e.id === expenseId);
                  if (expense) handleEditClientExpense(expense);
                }
                setOpenDropdown(null);
                setDropdownPosition(null);
                setDropdownType(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
            >
              {t.common.edit}
            </button>
            <button
              onClick={() => {
                const expenseId = openDropdown.replace(/^(monthly-|annual-|onetime-|client-)/, '');
                if (dropdownType === 'company') {
                  handleDeleteCompanyExpense(expenseId);
                } else {
                  handleDeleteClientExpense(expenseId);
                }
                setOpenDropdown(null);
                setDropdownPosition(null);
                setDropdownType(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
            >
              {t.common.delete}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
