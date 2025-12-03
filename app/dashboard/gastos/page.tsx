'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { CompanyExpense, ClientExpense, Client, ClientWithExpenses, ExpenseCategory, ClientExpenseCategory, Frequency } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';

type ModalType = 'company' | 'client-expense' | 'edit-company' | 'edit-client-expense' | null;

export default function GastosPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'empresa' | 'clientes'>('empresa');
  const [showModal, setShowModal] = useState<ModalType>(null);
  const [editingCompanyExpense, setEditingCompanyExpense] = useState<CompanyExpense | null>(null);
  const [editingClientExpense, setEditingClientExpense] = useState<ClientExpense | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; openUp: boolean } | null>(null);
  const [dropdownType, setDropdownType] = useState<'company' | 'client' | null>(null);
  const [expandedText, setExpandedText] = useState<{ text: string; title: string } | null>(null);

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

  // Form data para gastos de empresa
  const [companyFormData, setCompanyFormData] = useState({
    service_name: '',
    description: '',
    amount: '',
    currency: 'CHF' as 'CHF' | 'EUR' | 'USD',
    frequency: 'one_time' as Frequency,
    category: '' as ExpenseCategory | '',
    status: 'pending' as 'paid' | 'pending' | 'upcoming',
    renewal_date: '',
  });

  // Form data para gastos de clientes
  const [clientExpenseFormData, setClientExpenseFormData] = useState({
    client_id: '',
    service_name: '',
    description: '',
    amount: '',
    currency: 'CHF' as 'CHF' | 'EUR' | 'USD',
    frequency: 'one_time' as Frequency,
    category: '' as ClientExpenseCategory | '',
    status: 'pending' as 'paid' | 'pending' | 'upcoming',
    renewal_date: '',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      await Promise.all([
        loadCompanyExpenses(),
        loadClients(),
        loadAllClients(),
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
    setMonthlyExpenses((data || []).filter(e => e.frequency === 'monthly'));
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

    const clientsWithExpenses: ClientWithExpenses[] = (clientsData || []).map(client => {
      const clientExpenses = (expensesData || []).filter(e => e.client_id === client.id);

      const totalExpensesMonthly = clientExpenses
        .filter(e => e.frequency === 'monthly')
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const totalExpensesAnnual = clientExpenses
        .filter(e => e.frequency === 'annual')
        .reduce((sum, e) => sum + Number(e.amount), 0);

      return {
        ...client,
        expenses: clientExpenses,
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
      renewal_date: expense.renewal_date || '',
    });
    setShowModal('edit-company');
  }

  function handleEditClientExpense(expense: ClientExpense) {
    setEditingClientExpense(expense);
    setClientExpenseFormData({
      client_id: expense.client_id,
      service_name: expense.service_name,
      description: expense.description || '',
      amount: expense.amount.toString(),
      currency: expense.currency,
      frequency: expense.frequency,
      category: expense.category || '',
      status: expense.status,
      renewal_date: expense.renewal_date || '',
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
          renewal_date: companyFormData.renewal_date || null,
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
          service_name: clientExpenseFormData.service_name,
          description: clientExpenseFormData.description || null,
          amount: parseFloat(clientExpenseFormData.amount),
          currency: clientExpenseFormData.currency,
          frequency: clientExpenseFormData.frequency,
          category: clientExpenseFormData.category || null,
          status: clientExpenseFormData.status,
          renewal_date: clientExpenseFormData.renewal_date || null,
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
      renewal_date: '',
    });
  }

  function resetClientExpenseForm() {
    setClientExpenseFormData({
      client_id: '',
      service_name: '',
      description: '',
      amount: '',
      currency: 'CHF',
      frequency: 'one_time',
      category: '',
      status: 'pending',
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
          renewal_date: companyFormData.renewal_date || null,
        }]);

      if (error) {
        console.error('Error adding company expense:', error);
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
          service_name: clientExpenseFormData.service_name,
          description: clientExpenseFormData.description || null,
          amount: parseFloat(clientExpenseFormData.amount),
          currency: clientExpenseFormData.currency,
          frequency: clientExpenseFormData.frequency,
          category: clientExpenseFormData.category || null,
          status: clientExpenseFormData.status,
          renewal_date: clientExpenseFormData.renewal_date || null,
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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t.expenses.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
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

      {/* Contenido según tab */}
      {activeTab === 'empresa' ? (
        <div>
          {/* Gastos Mensuales */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 mb-6 overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/30 border-b border-gray-300 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.expenses.monthlyExpenses}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.expenses.service}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.expenses.category}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.common.amount}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.common.status}</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 w-16"></th>
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
            <div className="px-4 py-3 bg-green-50 dark:bg-green-900/30 border-b border-gray-300 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.expenses.oneTimeExpenses}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.expenses.service}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.expenses.category}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.common.amount}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.common.status}</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 w-16"></th>
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
            <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/30 border-b border-gray-300 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.expenses.annualExpenses}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.expenses.service}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.expenses.category}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.common.amount}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.expenses.renewal}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.common.status}</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 w-16"></th>
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
          {/* Gastos de Clientes - Tabla tipo Excel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 overflow-hidden">
            <div className="px-4 py-3 bg-orange-50 dark:bg-orange-900/30 border-b border-gray-300 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.expenses.expensesByClient}</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t.expenses.expensesByClientSubtitle}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.expenses.client}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.expenses.service}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.expenses.category}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.expenses.frequency}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.common.amount}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">{t.expenses.renewal}</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const allClientExpenses = clients.flatMap(client =>
                      (client.expenses || []).map(expense => ({
                        ...expense,
                        clientName: client.name
                      }))
                    );

                    if (allClientExpenses.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="px-4 py-6 text-center text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600">
                            {t.expenses.noClientExpenses}
                          </td>
                        </tr>
                      );
                    }

                    return allClientExpenses.map((expense, index) => (
                      <tr key={expense.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} hover:bg-orange-50 dark:hover:bg-orange-900/20`}>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{expense.clientName}</span>
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{expense.service_name}</div>
                          {expense.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {expense.description.length > 30 ? (
                                <span>
                                  {expense.description.substring(0, 30)}...
                                  <button
                                    onClick={() => setExpandedText({ text: expense.description!, title: expense.service_name })}
                                    className="ml-1 text-orange-600 dark:text-orange-400 hover:underline"
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
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${
                            expense.frequency === 'monthly' ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700' :
                            expense.frequency === 'annual' ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700' :
                            'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                          }`}>
                            {expense.frequency === 'monthly' ? t.expenses.monthly : expense.frequency === 'annual' ? t.expenses.annual : t.expenses.oneTime}
                          </span>
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                            {expense.currency} {Number(expense.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {expense.renewal_date ? new Date(expense.renewal_date).toLocaleDateString('es-ES') : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-center">
                          <button
                            onClick={(e) => handleDropdownClick(e, `client-${expense.id}`, 'client')}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            <FaEllipsisV className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
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
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, client_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">{t.expenses.selectClient}</option>
                    {allClients.map((client) => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
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
                {(clientExpenseFormData.frequency === 'monthly' || clientExpenseFormData.frequency === 'annual') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.expenses.renewalDate}</label>
                    <input
                      type="date"
                      value={clientExpenseFormData.renewal_date}
                      onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, renewal_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
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
                    onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, client_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">{t.expenses.selectClient}</option>
                    {allClients.map((client) => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
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
                {(clientExpenseFormData.frequency === 'monthly' || clientExpenseFormData.frequency === 'annual') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.expenses.renewalDate}</label>
                    <input
                      type="date"
                      value={clientExpenseFormData.renewal_date}
                      onChange={(e) => setClientExpenseFormData({ ...clientExpenseFormData, renewal_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
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
