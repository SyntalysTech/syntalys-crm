'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  FaEnvelope, FaHandshake, FaUserPlus, FaHeadset, FaFileInvoice,
  FaBell, FaNewspaper, FaFolder, FaEllipsisV, FaEdit, FaTrash,
  FaPlus, FaTimes, FaCopy, FaCheck, FaEye, FaSearch
} from 'react-icons/fa';

interface EmailTemplate {
  id: string;
  name: string;
  name_fr: string | null;
  subject: string;
  subject_fr: string | null;
  body: string;
  body_fr: string | null;
  category: 'sales' | 'follow_up' | 'onboarding' | 'support' | 'invoice' | 'reminder' | 'newsletter' | 'other';
  variables: string[] | null;
  is_active: boolean;
  usage_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  sales: <FaHandshake className="w-5 h-5" />,
  follow_up: <FaEnvelope className="w-5 h-5" />,
  onboarding: <FaUserPlus className="w-5 h-5" />,
  support: <FaHeadset className="w-5 h-5" />,
  invoice: <FaFileInvoice className="w-5 h-5" />,
  reminder: <FaBell className="w-5 h-5" />,
  newsletter: <FaNewspaper className="w-5 h-5" />,
  other: <FaFolder className="w-5 h-5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  sales: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  follow_up: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  onboarding: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  support: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  invoice: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  reminder: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  newsletter: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  other: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
};

export default function PlantillasPage() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';

  const [formData, setFormData] = useState({
    name: '',
    name_fr: '',
    subject: '',
    subject_fr: '',
    body: '',
    body_fr: '',
    category: 'other' as EmailTemplate['category'],
    variables: '',
    is_active: true,
  });

  useEffect(() => {
    loadTemplates();
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

  async function loadTemplates() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading templates:', error);
        return;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error('Error in loadTemplates:', error);
    } finally {
      setLoading(false);
    }
  }

  function getLocalizedName(template: EmailTemplate): string {
    if (language === 'fr' && template.name_fr) {
      return template.name_fr;
    }
    return template.name;
  }

  function getLocalizedSubject(template: EmailTemplate): string {
    if (language === 'fr' && template.subject_fr) {
      return template.subject_fr;
    }
    return template.subject;
  }

  function getLocalizedBody(template: EmailTemplate): string {
    if (language === 'fr' && template.body_fr) {
      return template.body_fr;
    }
    return template.body;
  }

  function getCategoryLabel(category: string): string {
    switch (category) {
      case 'sales': return t.templates.sales;
      case 'follow_up': return t.templates.followUp;
      case 'onboarding': return t.templates.onboarding;
      case 'support': return t.templates.support;
      case 'invoice': return t.templates.invoice;
      case 'reminder': return t.templates.reminder;
      case 'newsletter': return t.templates.newsletter;
      case 'other': return t.templates.other;
      default: return category;
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      name_fr: '',
      subject: '',
      subject_fr: '',
      body: '',
      body_fr: '',
      category: 'other',
      variables: '',
      is_active: true,
    });
    setEditingTemplate(null);
  }

  function openAddModal() {
    resetForm();
    setShowModal(true);
  }

  function openEditModal(template: EmailTemplate) {
    setOpenDropdown(null);
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      name_fr: template.name_fr || '',
      subject: template.subject,
      subject_fr: template.subject_fr || '',
      body: template.body,
      body_fr: template.body_fr || '',
      category: template.category,
      variables: template.variables?.join(', ') || '',
      is_active: template.is_active,
    });
    setShowModal(true);
  }

  function openPreview(template: EmailTemplate) {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  }

  async function copyToClipboard(template: EmailTemplate) {
    const text = `${t.templates.subject}: ${getLocalizedSubject(template)}\n\n${getLocalizedBody(template)}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleSaveTemplate() {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
      alert(t.messages.fillRequired);
      return;
    }

    try {
      const variablesArray = formData.variables
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);

      const templateData = {
        name: formData.name,
        name_fr: formData.name_fr || null,
        subject: formData.subject,
        subject_fr: formData.subject_fr || null,
        body: formData.body,
        body_fr: formData.body_fr || null,
        category: formData.category,
        variables: variablesArray.length > 0 ? variablesArray : null,
        is_active: formData.is_active,
        created_by: editingTemplate ? undefined : profile?.id,
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) {
          console.error('Error updating template:', error);
          alert(t.messages.saveError);
          return;
        }
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert([templateData]);

        if (error) {
          console.error('Error creating template:', error);
          alert(t.messages.saveError);
          return;
        }
      }

      setShowModal(false);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert(t.messages.saveError);
    }
  }

  async function handleDeleteTemplate(template: EmailTemplate) {
    setOpenDropdown(null);
    if (!confirm(`${t.messages.deleteConfirm} "${getLocalizedName(template)}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', template.id);

      if (error) {
        console.error('Error deleting template:', error);
        alert(t.messages.deleteError);
        return;
      }

      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert(t.messages.deleteError);
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesSearch = searchQuery === '' ||
      getLocalizedName(template).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getLocalizedSubject(template).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories: EmailTemplate['category'][] = ['sales', 'follow_up', 'onboarding', 'support', 'invoice', 'reminder', 'newsletter', 'other'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-syntalys-blue"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.templates.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t.templates.subtitle}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-syntalys-blue text-white rounded-lg hover:bg-syntalys-blue/90 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            {t.templates.addTemplate}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t.templates.searchTemplates}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === 'all'
                ? 'bg-syntalys-blue text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t.templates.allCategories}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-syntalys-blue text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FaEnvelope className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t.templates.noTemplates}</p>
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="mt-4 text-syntalys-blue hover:underline"
            >
              {t.templates.createFirst}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${CATEGORY_COLORS[template.category]}`}>
                  {CATEGORY_ICONS[template.category]}
                </div>
                <div className="flex items-center gap-2">
                  {!template.is_active && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      {t.templates.inactive}
                    </span>
                  )}
                  <div className="relative" ref={openDropdown === template.id ? dropdownRef : null}>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === template.id ? null : template.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    >
                      <FaEllipsisV className="w-4 h-4" />
                    </button>
                    {openDropdown === template.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-20">
                        <button
                          onClick={() => { setOpenDropdown(null); openPreview(template); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <FaEye className="w-4 h-4" />
                          {t.templates.preview}
                        </button>
                        <button
                          onClick={() => { setOpenDropdown(null); copyToClipboard(template); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <FaCopy className="w-4 h-4" />
                          {t.templates.copyTemplate}
                        </button>
                        {isAdmin && (
                          <>
                            <hr className="my-1 border-gray-100 dark:border-gray-700" />
                            <button
                              onClick={() => openEditModal(template)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <FaEdit className="w-4 h-4" />
                              {t.templates.editTemplate}
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <FaTrash className="w-4 h-4" />
                              {t.templates.deleteTemplate}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {getLocalizedName(template)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {getLocalizedSubject(template)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                {getLocalizedBody(template).substring(0, 100)}...
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${CATEGORY_COLORS[template.category]}`}>
                  {getCategoryLabel(template.category)}
                </span>
                <div className="flex items-center gap-2">
                  {copiedId === template.id ? (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <FaCheck className="w-3 h-3" />
                      {t.templates.copied}
                    </span>
                  ) : (
                    <button
                      onClick={() => copyToClipboard(template)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      title={t.templates.copyTemplate}
                    >
                      <FaCopy className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => openPreview(template)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    title={t.templates.preview}
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingTemplate ? t.templates.editTemplate : t.templates.addTemplate}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.templates.templateName} (ES)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue"
                    placeholder="Nombre de la plantilla"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.templates.templateName} (FR)
                  </label>
                  <input
                    type="text"
                    value={formData.name_fr}
                    onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue"
                    placeholder="Nom du modele"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.templates.subject} (ES)
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue"
                    placeholder="Asunto del correo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.templates.subject} (FR)
                  </label>
                  <input
                    type="text"
                    value={formData.subject_fr}
                    onChange={(e) => setFormData({ ...formData, subject_fr: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue"
                    placeholder="Objet de l'email"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.templates.category}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as EmailTemplate['category'] })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Body ES */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.templates.body} (ES)
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue font-mono text-sm"
                  placeholder="Cuerpo del correo..."
                />
              </div>

              {/* Body FR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.templates.body} (FR)
                </label>
                <textarea
                  value={formData.body_fr}
                  onChange={(e) => setFormData({ ...formData, body_fr: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue font-mono text-sm"
                  placeholder="Corps de l'email..."
                />
              </div>

              {/* Variables */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.templates.variables}
                </label>
                <input
                  type="text"
                  value={formData.variables}
                  onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue"
                  placeholder="client_name, company_name, sender_name"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t.templates.variablesHint}
                </p>
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-syntalys-blue focus:ring-syntalys-blue"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
                  {t.templates.active}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-syntalys-blue text-white rounded-lg hover:bg-syntalys-blue/90 transition-colors"
              >
                {t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.templates.preview}: {getLocalizedName(previewTemplate)}
              </h2>
              <button
                onClick={() => { setShowPreviewModal(false); setPreviewTemplate(null); }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              {/* Subject */}
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.templates.subject}:
                </span>
                <p className="text-gray-900 dark:text-white font-medium mt-1">
                  {getLocalizedSubject(previewTemplate)}
                </p>
              </div>

              {/* Variables */}
              {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t.templates.variables}:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {previewTemplate.variables.map((v, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                      >
                        {`{${v}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-sans">
                  {getLocalizedBody(previewTemplate)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => { setShowPreviewModal(false); setPreviewTemplate(null); }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t.common.close}
              </button>
              <button
                onClick={() => copyToClipboard(previewTemplate)}
                className="px-4 py-2 bg-syntalys-blue text-white rounded-lg hover:bg-syntalys-blue/90 transition-colors flex items-center gap-2"
              >
                <FaCopy className="w-4 h-4" />
                {t.templates.copyTemplate}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
