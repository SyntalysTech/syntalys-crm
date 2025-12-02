'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Client, Project } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaEllipsisV, FaEdit, FaTrash, FaEye, FaUpload, FaFilePdf, FaDownload, FaTimes, FaFolder, FaFileInvoiceDollar, FaSearch } from 'react-icons/fa';

// Lista de países con traducciones ES/FR
const COUNTRIES_DATA = {
  // Europa
  CH: { es: 'Suiza', fr: 'Suisse', flag: '🇨🇭' },
  ES: { es: 'España', fr: 'Espagne', flag: '🇪🇸' },
  FR: { es: 'Francia', fr: 'France', flag: '🇫🇷' },
  DE: { es: 'Alemania', fr: 'Allemagne', flag: '🇩🇪' },
  IT: { es: 'Italia', fr: 'Italie', flag: '🇮🇹' },
  PT: { es: 'Portugal', fr: 'Portugal', flag: '🇵🇹' },
  GB: { es: 'Reino Unido', fr: 'Royaume-Uni', flag: '🇬🇧' },
  NL: { es: 'Países Bajos', fr: 'Pays-Bas', flag: '🇳🇱' },
  BE: { es: 'Bélgica', fr: 'Belgique', flag: '🇧🇪' },
  AT: { es: 'Austria', fr: 'Autriche', flag: '🇦🇹' },
  PL: { es: 'Polonia', fr: 'Pologne', flag: '🇵🇱' },
  SE: { es: 'Suecia', fr: 'Suède', flag: '🇸🇪' },
  NO: { es: 'Noruega', fr: 'Norvège', flag: '🇳🇴' },
  DK: { es: 'Dinamarca', fr: 'Danemark', flag: '🇩🇰' },
  FI: { es: 'Finlandia', fr: 'Finlande', flag: '🇫🇮' },
  IE: { es: 'Irlanda', fr: 'Irlande', flag: '🇮🇪' },
  GR: { es: 'Grecia', fr: 'Grèce', flag: '🇬🇷' },
  CZ: { es: 'República Checa', fr: 'République tchèque', flag: '🇨🇿' },
  HU: { es: 'Hungría', fr: 'Hongrie', flag: '🇭🇺' },
  RO: { es: 'Rumanía', fr: 'Roumanie', flag: '🇷🇴' },
  BG: { es: 'Bulgaria', fr: 'Bulgarie', flag: '🇧🇬' },
  HR: { es: 'Croacia', fr: 'Croatie', flag: '🇭🇷' },
  SK: { es: 'Eslovaquia', fr: 'Slovaquie', flag: '🇸🇰' },
  SI: { es: 'Eslovenia', fr: 'Slovénie', flag: '🇸🇮' },
  LU: { es: 'Luxemburgo', fr: 'Luxembourg', flag: '🇱🇺' },
  LI: { es: 'Liechtenstein', fr: 'Liechtenstein', flag: '🇱🇮' },
  MC: { es: 'Mónaco', fr: 'Monaco', flag: '🇲🇨' },
  AD: { es: 'Andorra', fr: 'Andorre', flag: '🇦🇩' },
  RU: { es: 'Rusia', fr: 'Russie', flag: '🇷🇺' },
  UA: { es: 'Ucrania', fr: 'Ukraine', flag: '🇺🇦' },
  // América
  US: { es: 'Estados Unidos', fr: 'États-Unis', flag: '🇺🇸' },
  CA: { es: 'Canadá', fr: 'Canada', flag: '🇨🇦' },
  MX: { es: 'México', fr: 'Mexique', flag: '🇲🇽' },
  AR: { es: 'Argentina', fr: 'Argentine', flag: '🇦🇷' },
  BR: { es: 'Brasil', fr: 'Brésil', flag: '🇧🇷' },
  CL: { es: 'Chile', fr: 'Chili', flag: '🇨🇱' },
  CO: { es: 'Colombia', fr: 'Colombie', flag: '🇨🇴' },
  PE: { es: 'Perú', fr: 'Pérou', flag: '🇵🇪' },
  VE: { es: 'Venezuela', fr: 'Venezuela', flag: '🇻🇪' },
  EC: { es: 'Ecuador', fr: 'Équateur', flag: '🇪🇨' },
  UY: { es: 'Uruguay', fr: 'Uruguay', flag: '🇺🇾' },
  PY: { es: 'Paraguay', fr: 'Paraguay', flag: '🇵🇾' },
  BO: { es: 'Bolivia', fr: 'Bolivie', flag: '🇧🇴' },
  CR: { es: 'Costa Rica', fr: 'Costa Rica', flag: '🇨🇷' },
  PA: { es: 'Panamá', fr: 'Panama', flag: '🇵🇦' },
  DO: { es: 'República Dominicana', fr: 'République dominicaine', flag: '🇩🇴' },
  PR: { es: 'Puerto Rico', fr: 'Porto Rico', flag: '🇵🇷' },
  CU: { es: 'Cuba', fr: 'Cuba', flag: '🇨🇺' },
  // Asia
  JP: { es: 'Japón', fr: 'Japon', flag: '🇯🇵' },
  CN: { es: 'China', fr: 'Chine', flag: '🇨🇳' },
  IN: { es: 'India', fr: 'Inde', flag: '🇮🇳' },
  KR: { es: 'Corea del Sur', fr: 'Corée du Sud', flag: '🇰🇷' },
  SG: { es: 'Singapur', fr: 'Singapour', flag: '🇸🇬' },
  TH: { es: 'Tailandia', fr: 'Thaïlande', flag: '🇹🇭' },
  VN: { es: 'Vietnam', fr: 'Vietnam', flag: '🇻🇳' },
  MY: { es: 'Malasia', fr: 'Malaisie', flag: '🇲🇾' },
  ID: { es: 'Indonesia', fr: 'Indonésie', flag: '🇮🇩' },
  PH: { es: 'Filipinas', fr: 'Philippines', flag: '🇵🇭' },
  AE: { es: 'Emiratos Árabes Unidos', fr: 'Émirats arabes unis', flag: '🇦🇪' },
  SA: { es: 'Arabia Saudita', fr: 'Arabie saoudite', flag: '🇸🇦' },
  IL: { es: 'Israel', fr: 'Israël', flag: '🇮🇱' },
  TR: { es: 'Turquía', fr: 'Turquie', flag: '🇹🇷' },
  // Oceanía
  AU: { es: 'Australia', fr: 'Australie', flag: '🇦🇺' },
  NZ: { es: 'Nueva Zelanda', fr: 'Nouvelle-Zélande', flag: '🇳🇿' },
  // África
  ZA: { es: 'Sudáfrica', fr: 'Afrique du Sud', flag: '🇿🇦' },
  MA: { es: 'Marruecos', fr: 'Maroc', flag: '🇲🇦' },
  EG: { es: 'Egipto', fr: 'Égypte', flag: '🇪🇬' },
  NG: { es: 'Nigeria', fr: 'Nigeria', flag: '🇳🇬' },
  KE: { es: 'Kenia', fr: 'Kenya', flag: '🇰🇪' },
  TN: { es: 'Túnez', fr: 'Tunisie', flag: '🇹🇳' },
  DZ: { es: 'Argelia', fr: 'Algérie', flag: '🇩🇿' },
  SN: { es: 'Senegal', fr: 'Sénégal', flag: '🇸🇳' },
  CI: { es: 'Costa de Marfil', fr: 'Côte d\'Ivoire', flag: '🇨🇮' },
};

interface Invoice {
  id: string;
  client_id: string;
  user_id: string;
  project_id: string | null;
  invoice_number: string;
  amount: number;
  currency: string;
  issue_date: string;
  due_date: string | null;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  file_url: string | null;
  file_name: string | null;
  notes: string | null;
  created_at: string;
}

export default function ClientesPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showClientDetailModal, setShowClientDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});

  // Client detail states
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'projects' | 'invoices'>('info');
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [invoiceFormData, setInvoiceFormData] = useState({
    invoice_number: '',
    amount: '',
    currency: 'CHF',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'pending' as 'pending' | 'paid' | 'overdue' | 'cancelled',
    notes: '',
    project_id: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    notes: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    is_potential: false,
  });

  // Get countries list with proper language
  const getCountriesList = () => {
    return Object.entries(COUNTRIES_DATA)
      .map(([code, data]) => ({
        code,
        name: language === 'fr' ? data.fr : data.es,
        flag: data.flag,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const getCountryName = (code: string | null): string => {
    if (!code || !COUNTRIES_DATA[code as keyof typeof COUNTRIES_DATA]) return '';
    const data = COUNTRIES_DATA[code as keyof typeof COUNTRIES_DATA];
    return language === 'fr' ? data.fr : data.es;
  };

  const getCountryFlag = (code: string | null): string => {
    if (!code || !COUNTRIES_DATA[code as keyof typeof COUNTRIES_DATA]) return '';
    return COUNTRIES_DATA[code as keyof typeof COUNTRIES_DATA].flag;
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadClients() {
    setLoading(true);
    try {
      const [clientsResult, projectsResult] = await Promise.all([
        supabase.from('clients').select('*').order('name', { ascending: true }),
        supabase.from('projects').select('client_id'),
      ]);

      if (clientsResult.error) {
        console.error('Error loading clients:', clientsResult.error);
        return;
      }

      setClients(clientsResult.data || []);

      // Count projects per client
      const counts: Record<string, number> = {};
      (projectsResult.data || []).forEach(p => {
        counts[p.client_id] = (counts[p.client_id] || 0) + 1;
      });
      setProjectCounts(counts);
    } catch (error) {
      console.error('Error in loadClients:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter clients based on search and filters
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query)
      );
    }

    // Country filter
    if (countryFilter !== 'all') {
      filtered = filtered.filter(c => c.country === countryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    return filtered;
  }, [clients, searchQuery, countryFilter, statusFilter]);

  // Get unique countries from clients for filter dropdown
  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    clients.forEach(c => {
      if (c.country) countries.add(c.country);
    });
    return Array.from(countries).sort((a, b) => {
      const nameA = getCountryName(a);
      const nameB = getCountryName(b);
      return nameA.localeCompare(nameB);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, language]);

  async function loadClientDetails(clientId: string) {
    // Load projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (!projectsError && projects) {
      setClientProjects(projects);
    }

    // Load invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .order('issue_date', { ascending: false });

    if (!invoicesError && invoices) {
      setClientInvoices(invoices);
    } else {
      setClientInvoices([]);
    }
  }

  async function handleAddClient() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user:', userError);
        alert(t.messages.saveError + ': Usuario no autenticado');
        return;
      }

      const { error } = await supabase
        .from('clients')
        .insert([{
          user_id: user.id,
          name: formData.name,
          company_name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          country: formData.country || null,
          notes: formData.notes || null,
          status: formData.status,
          is_potential: formData.is_potential,
        }]);

      if (error) {
        console.error('Error adding client:', error);
        alert(t.messages.saveError + ': ' + error.message);
        return;
      }

      resetForm();
      setShowAddModal(false);
      loadClients();
    } catch (error) {
      console.error('Error in handleAddClient:', error);
      alert(t.messages.saveError);
    }
  }

  async function handleEditClient() {
    if (!selectedClient) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          country: formData.country || null,
          notes: formData.notes || null,
          status: formData.status,
          is_potential: formData.is_potential,
        })
        .eq('id', selectedClient.id);

      if (error) {
        console.error('Error updating client:', error);
        alert(t.messages.saveError);
        return;
      }

      resetForm();
      setShowEditModal(false);
      setSelectedClient(null);
      loadClients();
    } catch (error) {
      console.error('Error in handleEditClient:', error);
      alert(t.messages.saveError);
    }
  }

  async function handleDeleteClient(clientId: string, clientName: string) {
    setOpenDropdownId(null);
    if (!confirm(`${t.messages.deleteConfirm} "${clientName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Error deleting client:', error);
        alert(t.messages.deleteError);
        return;
      }

      loadClients();
    } catch (error) {
      console.error('Error in handleDeleteClient:', error);
      alert(t.messages.deleteError);
    }
  }

  async function handleAddInvoice() {
    if (!selectedClient || !invoiceFormData.invoice_number || !invoiceFormData.amount) {
      alert(t.messages.fillRequired);
      return;
    }

    setUploadingInvoice(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert(t.messages.saveError);
        return;
      }

      let fileUrl = null;
      let fileName = null;

      // Upload file if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${user.id}/${selectedClient.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(filePath, selectedFile);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          alert('Error al subir el archivo');
          setUploadingInvoice(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('invoices')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        fileName = selectedFile.name;
      }

      const { error } = await supabase
        .from('invoices')
        .insert([{
          client_id: selectedClient.id,
          user_id: user.id,
          project_id: invoiceFormData.project_id || null,
          invoice_number: invoiceFormData.invoice_number,
          amount: parseFloat(invoiceFormData.amount),
          currency: invoiceFormData.currency,
          issue_date: invoiceFormData.issue_date,
          due_date: invoiceFormData.due_date || null,
          status: invoiceFormData.status,
          file_url: fileUrl,
          file_name: fileName,
          notes: invoiceFormData.notes || null,
        }]);

      if (error) {
        console.error('Error adding invoice:', error);
        alert(t.messages.saveError);
        return;
      }

      // Reset form
      setInvoiceFormData({
        invoice_number: '',
        amount: '',
        currency: 'CHF',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: 'pending',
        notes: '',
        project_id: '',
      });
      setSelectedFile(null);
      setShowAddInvoiceModal(false);
      loadClientDetails(selectedClient.id);
    } catch (error) {
      console.error('Error in handleAddInvoice:', error);
      alert(t.messages.saveError);
    } finally {
      setUploadingInvoice(false);
    }
  }

  async function handleDeleteInvoice(invoice: Invoice) {
    if (!confirm(`${t.messages.deleteConfirm} "${invoice.invoice_number}"?`)) {
      return;
    }

    try {
      // Delete file from storage if exists
      if (invoice.file_url) {
        const filePath = invoice.file_url.split('/invoices/')[1];
        if (filePath) {
          await supabase.storage.from('invoices').remove([filePath]);
        }
      }

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoice.id);

      if (error) {
        console.error('Error deleting invoice:', error);
        alert(t.messages.deleteError);
        return;
      }

      if (selectedClient) {
        loadClientDetails(selectedClient.id);
      }
    } catch (error) {
      console.error('Error in handleDeleteInvoice:', error);
      alert(t.messages.deleteError);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      email: '',
      phone: '',
      country: '',
      notes: '',
      status: 'active',
      is_potential: false,
    });
  }

  function openAddModal() {
    resetForm();
    setShowAddModal(true);
  }

  function openEditModal(client: Client) {
    setOpenDropdownId(null);
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      country: client.country || '',
      notes: client.notes || '',
      status: client.status,
      is_potential: client.is_potential || false,
    });
    setShowEditModal(true);
  }

  function openClientDetail(client: Client) {
    setOpenDropdownId(null);
    setSelectedClient(client);
    setActiveTab('info');
    loadClientDetails(client.id);
    setShowClientDetailModal(true);
  }

  function getInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  function getAvatarColor(name: string): string {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  function formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-CH' : 'es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  function getInvoiceStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  function getInvoiceStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      paid: t.clients.invoicePaid,
      pending: t.clients.invoicePending,
      overdue: t.clients.invoiceOverdue,
      cancelled: t.clients.invoiceCancelled,
    };
    return labels[status] || status;
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.clients.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t.clients.subtitle}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-syntalys-blue text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          + {t.clients.addClient}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.common.search + '...'}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue focus:border-transparent"
          />
        </div>

        {/* Country Filter */}
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue"
        >
          <option value="all">{t.forms.country}: {language === 'fr' ? 'Tous' : 'Todos'}</option>
          {availableCountries.map(code => (
            <option key={code} value={code}>
              {getCountryFlag(code)} {getCountryName(code)}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue"
        >
          <option value="all">{t.common.status}: {language === 'fr' ? 'Tous' : 'Todos'}</option>
          <option value="active">{t.clients.active}</option>
          <option value="inactive">{t.clients.inactive}</option>
          <option value="suspended">{t.clients.suspended}</option>
        </select>

        {/* Results count */}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filteredClients.length} {language === 'fr' ? 'clients' : 'clientes'}
        </span>
      </div>

      {/* Lista de clientes */}
      {clients.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t.clients.noClients}</p>
          <button
            onClick={openAddModal}
            className="bg-syntalys-blue text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t.clients.createFirst}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t.forms.name}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t.forms.email}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t.forms.phone}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t.common.type}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t.common.status}
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t.forms.country}
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t.nav.projects}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t.common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClients.map((client, index) => (
                  <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(client.name)}`}>
                          {getInitials(client.name)}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{client.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-300">{client.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-300">{client.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.is_potential ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          {t.clients.potential}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {t.common.client}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        client.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        client.status === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {client.status === 'active' ? t.clients.active : client.status === 'inactive' ? t.clients.inactive : t.clients.suspended}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {client.country ? (
                        <span className="text-2xl" title={getCountryName(client.country)}>
                          {getCountryFlag(client.country)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-1 text-xs font-semibold rounded-full ${
                        projectCounts[client.id] > 0
                          ? 'bg-syntalys-blue text-white'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {projectCounts[client.id] || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block" ref={openDropdownId === client.id ? dropdownRef : null}>
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === client.id ? null : client.id)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                          <FaEllipsisV className="w-4 h-4" />
                        </button>
                        {openDropdownId === client.id && (
                          <div className={`absolute right-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 ${index < 2 ? 'top-full mt-2' : 'bottom-full mb-2'}`}>
                            <button
                              onClick={() => openClientDetail(client)}
                              className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 rounded-t-lg"
                            >
                              <FaEye className="w-4 h-4 text-green-600" />
                              {language === 'fr' ? 'Voir la fiche' : 'Ver ficha'}
                            </button>
                            <button
                              onClick={() => openEditModal(client)}
                              className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                            >
                              <FaEdit className="w-4 h-4 text-syntalys-blue" />
                              {t.common.edit}
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client.id, client.name)}
                              className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 rounded-b-lg"
                            >
                              <FaTrash className="w-4 h-4" />
                              {t.common.delete}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Agregar Cliente */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.clients.addClient}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.forms.name} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t.forms.clientNamePlaceholder}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.forms.email}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.forms.phone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="+41 xx xxx xx xx"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.forms.country}
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t.forms.selectCountry}</option>
                  {getCountriesList().map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.common.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder={t.forms.clientNotesPlaceholder}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.common.status}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="active">{t.clients.active}</option>
                    <option value="inactive">{t.clients.inactive}</option>
                    <option value="suspended">{t.clients.suspended}</option>
                  </select>
                </div>
                <div className="flex items-center pt-7">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_potential}
                      onChange={(e) => setFormData({ ...formData, is_potential: e.target.checked })}
                      className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.clients.isPotential}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleAddClient}
                disabled={!formData.name.trim()}
                className="px-4 py-2 bg-syntalys-blue text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t.clients.addClient}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.clients.editClient}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.forms.name} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t.forms.clientNamePlaceholder}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.forms.email}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.forms.phone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="+41 xx xxx xx xx"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.forms.country}
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t.forms.selectCountry}</option>
                  {getCountriesList().map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.common.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder={t.forms.clientNotesPlaceholder}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.common.status}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="active">{t.clients.active}</option>
                    <option value="inactive">{t.clients.inactive}</option>
                    <option value="suspended">{t.clients.suspended}</option>
                  </select>
                </div>
                <div className="flex items-center pt-7">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_potential}
                      onChange={(e) => setFormData({ ...formData, is_potential: e.target.checked })}
                      className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.clients.isPotential}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedClient(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleEditClient}
                disabled={!formData.name.trim()}
                className="px-4 py-2 bg-syntalys-blue text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t.common.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ficha de Cliente */}
      {showClientDetailModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${getAvatarColor(selectedClient.name)}`}>
                  {getInitials(selectedClient.name)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {selectedClient.name}
                    {selectedClient.country && (
                      <span className="text-2xl" title={getCountryName(selectedClient.country)}>
                        {getCountryFlag(selectedClient.country)}
                      </span>
                    )}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">{selectedClient.email || '-'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowClientDetailModal(false);
                  setSelectedClient(null);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex px-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'info'
                      ? 'border-syntalys-blue text-syntalys-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {language === 'fr' ? 'Informations' : 'Información'}
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === 'projects'
                      ? 'border-syntalys-blue text-syntalys-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <FaFolder className="w-4 h-4" />
                  {t.nav.projects} ({clientProjects.length})
                </button>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === 'invoices'
                      ? 'border-syntalys-blue text-syntalys-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <FaFileInvoiceDollar className="w-4 h-4" />
                  {t.clients.invoices} ({clientInvoices.length})
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Info Tab */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.forms.email}</p>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedClient.email || '-'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.forms.phone}</p>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedClient.phone || '-'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.forms.country}</p>
                      <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                        {selectedClient.country ? (
                          <>
                            <span className="text-xl">{getCountryFlag(selectedClient.country)}</span>
                            {getCountryName(selectedClient.country)}
                          </>
                        ) : '-'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.common.status}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedClient.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        selectedClient.status === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {selectedClient.status === 'active' ? t.clients.active : selectedClient.status === 'inactive' ? t.clients.inactive : t.clients.suspended}
                      </span>
                    </div>
                  </div>
                  {selectedClient.notes && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.common.notes}</p>
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedClient.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <div>
                  {clientProjects.length === 0 ? (
                    <div className="text-center py-12">
                      <FaFolder className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">{t.projects.noProjects}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {clientProjects.map((project) => (
                        <div key={project.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{project.project_name}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                              project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                              project.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {project.status === 'active' ? t.projects.statusActive :
                               project.status === 'completed' ? t.projects.statusCompleted :
                               project.status === 'paused' ? t.projects.statusPaused :
                               t.projects.statusCancelled}
                            </span>
                          </div>
                          {project.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{project.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            {project.total_amount && (
                              <span>{formatCurrency(project.total_amount, project.currency)}</span>
                            )}
                            {project.start_date && (
                              <span>{new Date(project.start_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Invoices Tab */}
              {activeTab === 'invoices' && (
                <div>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setShowAddInvoiceModal(true)}
                      className="bg-syntalys-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <FaUpload className="w-4 h-4" />
                      {language === 'fr' ? 'Ajouter une facture' : 'Añadir factura'}
                    </button>
                  </div>

                  {clientInvoices.length === 0 ? (
                    <div className="text-center py-12">
                      <FaFileInvoiceDollar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {language === 'fr' ? 'Aucune facture enregistrée' : 'No hay facturas registradas'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {clientInvoices.map((invoice) => (
                        <div key={invoice.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <FaFilePdf className="w-8 h-8 text-red-500" />
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {invoice.invoice_number}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(invoice.issue_date).toLocaleDateString()} - {formatCurrency(invoice.amount, invoice.currency)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInvoiceStatusColor(invoice.status)}`}>
                                {getInvoiceStatusLabel(invoice.status)}
                              </span>
                              {invoice.file_url && (
                                <a
                                  href={invoice.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-syntalys-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                  title={language === 'fr' ? 'Télécharger' : 'Descargar'}
                                >
                                  <FaDownload className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteInvoice(invoice)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {invoice.notes && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{invoice.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Añadir Factura */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Ajouter une facture' : 'Añadir factura'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Project selector */}
              {clientProjects.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.nav.projects}
                  </label>
                  <select
                    value={invoiceFormData.project_id}
                    onChange={(e) => {
                      const projectId = e.target.value;
                      const selectedProject = clientProjects.find(p => p.id === projectId);
                      setInvoiceFormData({
                        ...invoiceFormData,
                        project_id: projectId,
                        currency: selectedProject?.currency || invoiceFormData.currency,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{language === 'fr' ? '-- Sélectionner un projet --' : '-- Seleccionar proyecto --'}</option>
                    {clientProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.project_name} {project.total_amount ? `(${project.total_amount} ${project.currency})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'fr' ? 'Numéro de facture' : 'Número de factura'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={invoiceFormData.invoice_number}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoice_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t.forms.invoiceNumberPlaceholder}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.common.amount} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoiceFormData.amount}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.common.currency}
                  </label>
                  <select
                    value={invoiceFormData.currency}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="CHF">CHF</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.clients.issueDate}
                  </label>
                  <input
                    type="date"
                    value={invoiceFormData.issue_date}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, issue_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.clients.dueDate}
                  </label>
                  <input
                    type="date"
                    value={invoiceFormData.due_date}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.common.status}
                </label>
                <select
                  value={invoiceFormData.status}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="pending">{getInvoiceStatusLabel('pending')}</option>
                  <option value="paid">{getInvoiceStatusLabel('paid')}</option>
                  <option value="overdue">{getInvoiceStatusLabel('overdue')}</option>
                  <option value="cancelled">{getInvoiceStatusLabel('cancelled')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'fr' ? 'Fichier PDF' : 'Archivo PDF'}
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-syntalys-blue transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaFilePdf className="w-6 h-6 text-red-500" />
                      <span className="text-gray-900 dark:text-white">{selectedFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <FaUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {language === 'fr' ? 'Cliquez pour sélectionner un PDF' : 'Haz clic para seleccionar un PDF'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.common.notes}
                </label>
                <textarea
                  value={invoiceFormData.notes}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddInvoiceModal(false);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleAddInvoice}
                disabled={uploadingInvoice || !invoiceFormData.invoice_number || !invoiceFormData.amount}
                className="px-4 py-2 bg-syntalys-blue text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadingInvoice ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    {language === 'fr' ? 'Envoi en cours...' : 'Subiendo...'}
                  </>
                ) : (
                  language === 'fr' ? 'Ajouter' : 'Añadir'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
