'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  FaRobot, FaCode, FaShieldAlt, FaChartBar, FaBullhorn, FaPlug,
  FaComments, FaGlobe, FaMobileAlt, FaCogs, FaShoppingCart, FaPaintBrush,
  FaHeadset, FaSearch, FaEllipsisV, FaEdit, FaTrash, FaPlus, FaStar,
  FaBuilding, FaUserTie, FaTimes, FaCheck
} from 'react-icons/fa';

interface SyntalysService {
  id: string;
  name: string;
  name_fr: string | null;
  description: string | null;
  description_fr: string | null;
  icon: string | null;
  category: 'enterprise' | 'pme';
  price_min: number | null;
  price_max: number | null;
  currency: string;
  price_type: string | null;
  price_note: string | null;
  price_note_fr: string | null;
  commission_percentage: number | null;
  commission_notes: string | null;
  status: 'available' | 'coming_soon' | 'discontinued';
  delivery_time: string | null;
  delivery_time_fr: string | null;
  display_order: number;
  is_featured: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  robot: <FaRobot className="w-6 h-6" />,
  code: <FaCode className="w-6 h-6" />,
  shield: <FaShieldAlt className="w-6 h-6" />,
  chart: <FaChartBar className="w-6 h-6" />,
  bullhorn: <FaBullhorn className="w-6 h-6" />,
  plug: <FaPlug className="w-6 h-6" />,
  comments: <FaComments className="w-6 h-6" />,
  globe: <FaGlobe className="w-6 h-6" />,
  mobile: <FaMobileAlt className="w-6 h-6" />,
  cogs: <FaCogs className="w-6 h-6" />,
  'shopping-cart': <FaShoppingCart className="w-6 h-6" />,
  paintbrush: <FaPaintBrush className="w-6 h-6" />,
  headset: <FaHeadset className="w-6 h-6" />,
  search: <FaSearch className="w-6 h-6" />,
};

const ICON_OPTIONS = [
  { value: 'robot', label: 'Robot/AI' },
  { value: 'code', label: 'Code' },
  { value: 'shield', label: 'Shield' },
  { value: 'chart', label: 'Chart' },
  { value: 'bullhorn', label: 'Marketing' },
  { value: 'plug', label: 'Integration' },
  { value: 'comments', label: 'Chat' },
  { value: 'globe', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'cogs', label: 'Automation' },
  { value: 'shopping-cart', label: 'E-commerce' },
  { value: 'paintbrush', label: 'Design' },
  { value: 'headset', label: 'Call Center' },
  { value: 'search', label: 'SEO' },
];

export default function ServiciosPage() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<SyntalysService[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'enterprise' | 'pme'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<SyntalysService | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';

  const [formData, setFormData] = useState({
    name: '',
    name_fr: '',
    description: '',
    description_fr: '',
    icon: 'code',
    category: 'pme' as 'enterprise' | 'pme',
    price_min: '',
    price_max: '',
    currency: 'CHF',
    price_type: 'fixed',
    price_note: '',
    price_note_fr: '',
    commission_percentage: '',
    commission_notes: '',
    status: 'available' as 'available' | 'coming_soon' | 'discontinued',
    delivery_time: '',
    delivery_time_fr: '',
    display_order: 0,
    is_featured: false,
    is_visible: true,
  });

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadServices() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('syntalys_services')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error loading services:', error);
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error('Error in loadServices:', error);
    } finally {
      setLoading(false);
    }
  }

  function getLocalizedName(service: SyntalysService): string {
    if (language === 'fr' && service.name_fr) {
      return service.name_fr;
    }
    return service.name;
  }

  function getLocalizedDescription(service: SyntalysService): string {
    if (language === 'fr' && service.description_fr) {
      return service.description_fr;
    }
    return service.description || '';
  }

  function getLocalizedDeliveryTime(service: SyntalysService): string {
    if (language === 'fr' && service.delivery_time_fr) {
      return service.delivery_time_fr;
    }
    return service.delivery_time || '';
  }

  function formatPrice(service: SyntalysService): string {
    if (!service.price_min) return '-';

    const formatter = new Intl.NumberFormat(language === 'fr' ? 'fr-CH' : 'es-ES', {
      style: 'currency',
      currency: service.currency || 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (service.price_type === 'custom') {
      return t.syntalys.custom;
    }

    if (service.price_max && service.price_max !== service.price_min) {
      return `${formatter.format(service.price_min)} - ${formatter.format(service.price_max)}`;
    }

    const suffix = service.price_type === 'monthly' ? '/mes' : '';
    return `${t.syntalys.priceFrom} ${formatter.format(service.price_min)}${suffix}`;
  }

  function getPriceTypeLabel(type: string | null): string {
    switch (type) {
      case 'fixed': return t.syntalys.fixed;
      case 'hourly': return t.syntalys.hourly;
      case 'monthly': return t.syntalys.monthly;
      case 'custom': return t.syntalys.custom;
      default: return '-';
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <FaCheck className="w-3 h-3 mr-1" />
            {t.syntalys.available}
          </span>
        );
      case 'coming_soon':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            {t.syntalys.comingSoon}
          </span>
        );
      case 'discontinued':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400">
            {t.syntalys.discontinued}
          </span>
        );
      default:
        return null;
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      name_fr: '',
      description: '',
      description_fr: '',
      icon: 'code',
      category: 'pme',
      price_min: '',
      price_max: '',
      currency: 'CHF',
      price_type: 'fixed',
      price_note: '',
      price_note_fr: '',
      commission_percentage: '',
      commission_notes: '',
      status: 'available',
      delivery_time: '',
      delivery_time_fr: '',
      display_order: 0,
      is_featured: false,
      is_visible: true,
    });
    setEditingService(null);
  }

  function openAddModal() {
    resetForm();
    setShowModal(true);
  }

  function openEditModal(service: SyntalysService) {
    setOpenDropdown(null);
    setEditingService(service);
    setFormData({
      name: service.name,
      name_fr: service.name_fr || '',
      description: service.description || '',
      description_fr: service.description_fr || '',
      icon: service.icon || 'code',
      category: service.category,
      price_min: service.price_min?.toString() || '',
      price_max: service.price_max?.toString() || '',
      currency: service.currency || 'CHF',
      price_type: service.price_type || 'fixed',
      price_note: service.price_note || '',
      price_note_fr: service.price_note_fr || '',
      commission_percentage: service.commission_percentage?.toString() || '',
      commission_notes: service.commission_notes || '',
      status: service.status,
      delivery_time: service.delivery_time || '',
      delivery_time_fr: service.delivery_time_fr || '',
      display_order: service.display_order,
      is_featured: service.is_featured,
      is_visible: service.is_visible,
    });
    setShowModal(true);
  }

  async function handleSaveService() {
    if (!formData.name.trim()) {
      alert(t.messages.fillRequired);
      return;
    }

    try {
      const serviceData = {
        name: formData.name,
        name_fr: formData.name_fr || null,
        description: formData.description || null,
        description_fr: formData.description_fr || null,
        icon: formData.icon,
        category: formData.category,
        price_min: formData.price_min ? parseFloat(formData.price_min) : null,
        price_max: formData.price_max ? parseFloat(formData.price_max) : null,
        currency: formData.currency,
        price_type: formData.price_type,
        price_note: formData.price_note || null,
        price_note_fr: formData.price_note_fr || null,
        commission_percentage: formData.commission_percentage ? parseFloat(formData.commission_percentage) : null,
        commission_notes: formData.commission_notes || null,
        status: formData.status,
        delivery_time: formData.delivery_time || null,
        delivery_time_fr: formData.delivery_time_fr || null,
        display_order: formData.display_order,
        is_featured: formData.is_featured,
        is_visible: formData.is_visible,
      };

      if (editingService) {
        const { error } = await supabase
          .from('syntalys_services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) {
          console.error('Error updating service:', error);
          alert(t.messages.saveError);
          return;
        }
      } else {
        const { error } = await supabase
          .from('syntalys_services')
          .insert([serviceData]);

        if (error) {
          console.error('Error creating service:', error);
          alert(t.messages.saveError);
          return;
        }
      }

      setShowModal(false);
      resetForm();
      loadServices();
    } catch (error) {
      console.error('Error saving service:', error);
      alert(t.messages.saveError);
    }
  }

  async function handleDeleteService(service: SyntalysService) {
    setOpenDropdown(null);
    if (!confirm(`${t.messages.deleteConfirm} "${getLocalizedName(service)}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('syntalys_services')
        .delete()
        .eq('id', service.id);

      if (error) {
        console.error('Error deleting service:', error);
        alert(t.messages.deleteError);
        return;
      }

      loadServices();
    } catch (error) {
      console.error('Error in handleDeleteService:', error);
      alert(t.messages.deleteError);
    }
  }

  const enterpriseServices = services.filter(s => s.category === 'enterprise');
  const pmeServices = services.filter(s => s.category === 'pme');

  const filteredServices = categoryFilter === 'all'
    ? services
    : services.filter(s => s.category === categoryFilter);

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
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.syntalys.ourServices}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t.syntalys.servicesSubtitle}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="bg-syntalys-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            {t.syntalys.addService}
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-8 flex gap-3">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            categoryFilter === 'all'
              ? 'bg-syntalys-blue text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {t.syntalys.allServices}
        </button>
        <button
          onClick={() => setCategoryFilter('enterprise')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            categoryFilter === 'enterprise'
              ? 'bg-syntalys-blue text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <FaBuilding className="w-4 h-4" />
          {t.syntalys.enterpriseServices}
        </button>
        <button
          onClick={() => setCategoryFilter('pme')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            categoryFilter === 'pme'
              ? 'bg-syntalys-blue text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <FaUserTie className="w-4 h-4" />
          {t.syntalys.pmeServices}
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t.syntalys.noServices}</p>
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="bg-syntalys-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.syntalys.createFirst}
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Enterprise Services Section */}
          {(categoryFilter === 'all' || categoryFilter === 'enterprise') && enterpriseServices.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-syntalys-blue/10 dark:bg-syntalys-blue/20 rounded-xl flex items-center justify-center">
                  <FaBuilding className="w-6 h-6 text-syntalys-blue" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.syntalys.enterpriseServices}</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t.syntalys.enterpriseSubtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enterpriseServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    language={language}
                    t={t}
                    isAdmin={isAdmin}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                    dropdownRef={dropdownRef}
                    onEdit={openEditModal}
                    onDelete={handleDeleteService}
                    getLocalizedName={getLocalizedName}
                    getLocalizedDescription={getLocalizedDescription}
                    getLocalizedDeliveryTime={getLocalizedDeliveryTime}
                    formatPrice={formatPrice}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            </div>
          )}

          {/* PME Services Section */}
          {(categoryFilter === 'all' || categoryFilter === 'pme') && pmeServices.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-syntalys-blue/10 dark:bg-syntalys-blue/20 rounded-xl flex items-center justify-center">
                  <FaUserTie className="w-6 h-6 text-syntalys-blue" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.syntalys.pmeServices}</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t.syntalys.pmeSubtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pmeServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    language={language}
                    t={t}
                    isAdmin={isAdmin}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                    dropdownRef={dropdownRef}
                    onEdit={openEditModal}
                    onDelete={handleDeleteService}
                    getLocalizedName={getLocalizedName}
                    getLocalizedDescription={getLocalizedDescription}
                    getLocalizedDeliveryTime={getLocalizedDeliveryTime}
                    formatPrice={formatPrice}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingService ? t.syntalys.editService : t.syntalys.addService}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.syntalys.serviceName} (ES) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.syntalys.serviceName} (FR)
                  </label>
                  <input
                    type="text"
                    value={formData.name_fr}
                    onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.syntalys.serviceDescription} (ES)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.syntalys.serviceDescription} (FR)
                  </label>
                  <textarea
                    value={formData.description_fr}
                    onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Icon and Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.syntalys.icon}
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {ICON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.syntalys.category}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'enterprise' | 'pme' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="enterprise">{t.syntalys.enterpriseServices}</option>
                    <option value="pme">{t.syntalys.pmeServices}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.common.status}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'coming_soon' | 'discontinued' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="available">{t.syntalys.available}</option>
                    <option value="coming_soon">{t.syntalys.comingSoon}</option>
                    <option value="discontinued">{t.syntalys.discontinued}</option>
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.syntalys.priceMin}
                  </label>
                  <input
                    type="number"
                    value={formData.price_min}
                    onChange={(e) => setFormData({ ...formData, price_min: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.syntalys.priceMax}
                  </label>
                  <input
                    type="number"
                    value={formData.price_max}
                    onChange={(e) => setFormData({ ...formData, price_max: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.common.currency}
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="CHF">CHF</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.syntalys.priceType}
                  </label>
                  <select
                    value={formData.price_type}
                    onChange={(e) => setFormData({ ...formData, price_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="fixed">{t.syntalys.fixed}</option>
                    <option value="hourly">{t.syntalys.hourly}</option>
                    <option value="monthly">{t.syntalys.monthly}</option>
                    <option value="custom">{t.syntalys.custom}</option>
                  </select>
                </div>
              </div>

              {/* Commission */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.syntalys.commissionPercentage} (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.commission_percentage}
                    onChange={(e) => setFormData({ ...formData, commission_percentage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.syntalys.commissionNotes}
                  </label>
                  <input
                    type="text"
                    value={formData.commission_notes}
                    onChange={(e) => setFormData({ ...formData, commission_notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Delivery Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.syntalys.deliveryTime} (ES)
                  </label>
                  <input
                    type="text"
                    value={formData.delivery_time}
                    onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                    placeholder="2-4 semanas"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.syntalys.deliveryTime} (FR)
                  </label>
                  <input
                    type="text"
                    value={formData.delivery_time_fr}
                    onChange={(e) => setFormData({ ...formData, delivery_time_fr: e.target.value })}
                    placeholder="2-4 semaines"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.syntalys.displayOrder}
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center pt-8">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-5 h-5 text-syntalys-blue border-gray-300 rounded focus:ring-syntalys-blue"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.syntalys.isFeatured}</span>
                  </label>
                </div>
                <div className="flex items-center pt-8">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_visible}
                      onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                      className="w-5 h-5 text-syntalys-blue border-gray-300 rounded focus:ring-syntalys-blue"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.syntalys.isVisible}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSaveService}
                disabled={!formData.name.trim()}
                className="px-4 py-2 bg-syntalys-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {editingService ? t.common.saveChanges : t.syntalys.addService}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Service Card Component
interface ServiceCardProps {
  service: SyntalysService;
  language: string;
  t: any;
  isAdmin: boolean;
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  onEdit: (service: SyntalysService) => void;
  onDelete: (service: SyntalysService) => void;
  getLocalizedName: (service: SyntalysService) => string;
  getLocalizedDescription: (service: SyntalysService) => string;
  getLocalizedDeliveryTime: (service: SyntalysService) => string;
  formatPrice: (service: SyntalysService) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}

function ServiceCard({
  service,
  language,
  t,
  isAdmin,
  openDropdown,
  setOpenDropdown,
  dropdownRef,
  onEdit,
  onDelete,
  getLocalizedName,
  getLocalizedDescription,
  getLocalizedDeliveryTime,
  formatPrice,
  getStatusBadge,
}: ServiceCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow relative">
      {/* Top right corner: Featured star and/or Admin dropdown */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {/* Featured badge */}
        {service.is_featured && (
          <FaStar className="w-5 h-5 text-amber-500" title={t.syntalys.featured} />
        )}

        {/* Admin dropdown */}
        {isAdmin && (
          <div ref={openDropdown === service.id ? dropdownRef : null}>
            <button
              onClick={() => setOpenDropdown(openDropdown === service.id ? null : service.id)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <FaEllipsisV className="w-4 h-4" />
            </button>
            {openDropdown === service.id && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={() => onEdit(service)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-t-lg"
                >
                  <FaEdit className="w-4 h-4 text-blue-500" />
                  {t.common.edit}
                </button>
                <button
                  onClick={() => onDelete(service)}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 rounded-b-lg"
                >
                  <FaTrash className="w-4 h-4" />
                  {t.common.delete}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Icon */}
      <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
        {ICON_MAP[service.icon || 'code'] || <FaCode className="w-6 h-6" />}
      </div>

      {/* Name */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {getLocalizedName(service)}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {getLocalizedDescription(service)}
      </p>

      {/* Status */}
      <div className="mb-4">
        {getStatusBadge(service.status)}
      </div>

      {/* Price */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t.syntalys.price}</span>
          <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(service)}</span>
        </div>

        {service.commission_percentage && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t.syntalys.commission}</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">{service.commission_percentage}%</span>
          </div>
        )}

        {getLocalizedDeliveryTime(service) && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t.syntalys.deliveryTime}</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">{getLocalizedDeliveryTime(service)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
