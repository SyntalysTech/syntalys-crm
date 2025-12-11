'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import type { Lead, LeadStatus, LeadSource, LeadPriority, LeadTemperature, LeadActivity, Currency, PipelineStage, ServiceInterested, PipelineType } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { FaEllipsisV, FaPhone, FaWhatsapp, FaEnvelope, FaPlus, FaTimes, FaFire, FaSnowflake, FaSun, FaCalendarAlt, FaUser, FaBuilding, FaGlobe, FaSearch, FaFilter } from 'react-icons/fa';

// Lista de países
const COUNTRIES_DATA: Record<string, { es: string; fr: string; flag: string }> = {
  CH: { es: 'Suiza', fr: 'Suisse', flag: '🇨🇭' },
  ES: { es: 'España', fr: 'Espagne', flag: '🇪🇸' },
  FR: { es: 'Francia', fr: 'France', flag: '🇫🇷' },
  DE: { es: 'Alemania', fr: 'Allemagne', flag: '🇩🇪' },
  IT: { es: 'Italia', fr: 'Italie', flag: '🇮🇹' },
  PT: { es: 'Portugal', fr: 'Portugal', flag: '🇵🇹' },
  GB: { es: 'Reino Unido', fr: 'Royaume-Uni', flag: '🇬🇧' },
  US: { es: 'Estados Unidos', fr: 'États-Unis', flag: '🇺🇸' },
  MX: { es: 'México', fr: 'Mexique', flag: '🇲🇽' },
  AR: { es: 'Argentina', fr: 'Argentine', flag: '🇦🇷' },
  CO: { es: 'Colombia', fr: 'Colombie', flag: '🇨🇴' },
  CL: { es: 'Chile', fr: 'Chili', flag: '🇨🇱' },
  PE: { es: 'Perú', fr: 'Pérou', flag: '🇵🇪' },
  BR: { es: 'Brasil', fr: 'Brésil', flag: '🇧🇷' },
};

export default function LeadsPage() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Record<string, LeadActivity[]>>({});
  const [showModal, setShowModal] = useState<'add' | 'edit' | 'detail' | 'activity' | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | 'all'>('all');
  const [serviceFilter, setServiceFilter] = useState('');
  const [followupFilter, setFollowupFilter] = useState<'all' | 'today' | 'week' | 'overdue' | 'none'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    country: '',
    status: 'new' as LeadStatus,
    pipeline_stage: 'none' as PipelineStage,
    source: 'website' as LeadSource,
    priority: 'medium' as LeadPriority,
    temperature: 'warm' as LeadTemperature,
    estimated_value: '',
    currency: 'CHF' as Currency,
    service_interested: '' as ServiceInterested | '',
    pipeline_type: 'general' as PipelineType,
    next_followup_date: '',
    notes: '',
  });

  // Activity form
  const [activityForm, setActivityForm] = useState({
    activity_type: 'call' as LeadActivity['activity_type'],
    description: '',
    outcome: '',
    next_action: '',
  });

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setDropdownPosition(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadLeads() {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading leads:', error);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  }

  async function loadActivities(leadId: string) {
    const { data, error } = await supabase
      .from('lead_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setActivities(prev => ({ ...prev, [leadId]: data }));
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      company_name: '',
      email: '',
      phone: '',
      whatsapp: '',
      country: '',
      status: 'new',
      pipeline_stage: 'none',
      source: 'website',
      priority: 'medium',
      temperature: 'warm',
      estimated_value: '',
      currency: 'CHF',
      service_interested: '',
      pipeline_type: 'general',
      next_followup_date: '',
      notes: '',
    });
  }

  // Auto-assign pipeline_type based on service_interested
  function getPipelineTypeFromService(service: ServiceInterested | ''): PipelineType {
    switch (service) {
      case 'call_center': return 'call_center';
      case 'automations': return 'automations';
      case 'chatbot': return 'chatbot';
      case 'voicebot': return 'voicebot';
      default: return 'general';
    }
  }

  async function handleAddLead() {
    if (!formData.name) {
      alert('El nombre es obligatorio');
      return;
    }

    const pipelineType = formData.service_interested ? getPipelineTypeFromService(formData.service_interested as ServiceInterested) : 'general';

    const { error } = await supabase.from('leads').insert([{
      user_id: profile?.id,
      name: formData.name,
      company_name: formData.company_name || null,
      email: formData.email || null,
      phone: formData.phone || null,
      whatsapp: formData.whatsapp || null,
      country: formData.country || null,
      status: formData.status,
      pipeline_stage: formData.pipeline_stage,
      source: formData.source,
      priority: formData.priority,
      temperature: formData.temperature,
      estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
      currency: formData.currency,
      service_interested: formData.service_interested || null,
      pipeline_type: pipelineType,
      first_contact_date: new Date().toISOString().split('T')[0],
      last_contact_date: new Date().toISOString().split('T')[0],
      next_followup_date: formData.next_followup_date || null,
      contact_count: 1,
      notes: formData.notes || null,
    }]);

    if (error) {
      console.error('Error adding lead:', error);
      alert('Error al añadir lead');
    } else {
      resetForm();
      setShowModal(null);
      loadLeads();
    }
  }

  async function handleEditLead() {
    if (!selectedLead || !formData.name) return;

    const pipelineType = formData.service_interested ? getPipelineTypeFromService(formData.service_interested as ServiceInterested) : 'general';

    const { error } = await supabase
      .from('leads')
      .update({
        name: formData.name,
        company_name: formData.company_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
        country: formData.country || null,
        status: formData.status,
        pipeline_stage: formData.pipeline_stage,
        source: formData.source,
        priority: formData.priority,
        temperature: formData.temperature,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        currency: formData.currency,
        service_interested: formData.service_interested || null,
        pipeline_type: pipelineType,
        next_followup_date: formData.next_followup_date || null,
        notes: formData.notes || null,
      })
      .eq('id', selectedLead.id);

    if (error) {
      console.error('Error updating lead:', error);
      alert('Error al actualizar lead');
    } else {
      resetForm();
      setSelectedLead(null);
      setShowModal(null);
      loadLeads();
    }
  }

  async function handleDeleteLead(id: string) {
    if (!confirm(t.leads.deleteConfirm)) return;

    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      console.error('Error deleting lead:', error);
    } else {
      loadLeads();
    }
  }

  async function handleStatusChange(lead: Lead, newStatus: LeadStatus) {
    const updates: Partial<Lead> = {
      status: newStatus,
      last_contact_date: new Date().toISOString().split('T')[0],
      contact_count: lead.contact_count + 1,
    };

    const { error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', lead.id);

    if (!error) {
      // Add activity
      await supabase.from('lead_activities').insert([{
        lead_id: lead.id,
        user_id: profile?.id,
        activity_type: 'status_change',
        description: `Estado cambiado a: ${getStatusLabel(newStatus)}`,
      }]);
      loadLeads();
    }
  }

  async function handleAddActivity() {
    if (!selectedLead || !activityForm.description) return;

    const { error } = await supabase.from('lead_activities').insert([{
      lead_id: selectedLead.id,
      user_id: profile?.id,
      activity_type: activityForm.activity_type,
      description: activityForm.description,
      outcome: activityForm.outcome || null,
      next_action: activityForm.next_action || null,
    }]);

    if (!error) {
      // Update lead's last contact
      await supabase
        .from('leads')
        .update({
          last_contact_date: new Date().toISOString().split('T')[0],
          contact_count: selectedLead.contact_count + 1,
        })
        .eq('id', selectedLead.id);

      setActivityForm({ activity_type: 'call', description: '', outcome: '', next_action: '' });
      loadActivities(selectedLead.id);
      loadLeads();
    }
  }

  async function handleConvertToClient(lead: Lead) {
    if (!confirm(t.leads.convertConfirm)) return;

    if (!profile?.id) {
      alert('Error: Usuario no autenticado');
      return;
    }

    // Create client
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert([{
        user_id: profile.id,
        name: lead.name,
        company_name: lead.company_name || lead.name,
        email: lead.email || null,
        phone: lead.phone || null,
        country: lead.country || null,
        status: 'active',
        is_potential: false,
        notes: lead.notes || null,
      }])
      .select()
      .single();

    if (clientError) {
      console.error('Error creating client:', clientError);
      alert(`Error al convertir a cliente: ${clientError.message}`);
      return;
    }

    // Update lead to qualified status and won pipeline stage
    const { error: updateError } = await supabase
      .from('leads')
      .update({ status: 'qualified', pipeline_stage: 'won' })
      .eq('id', lead.id);

    if (updateError) {
      console.error('Error updating lead status:', updateError);
    }

    loadLeads();
    alert(language === 'fr' ? 'Lead converti en client avec succès' : 'Lead convertido a cliente exitosamente');
  }

  function openEditModal(lead: Lead) {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      company_name: lead.company_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      whatsapp: lead.whatsapp || '',
      country: lead.country || '',
      status: lead.status,
      pipeline_stage: lead.pipeline_stage || 'none',
      source: lead.source,
      priority: lead.priority,
      temperature: lead.temperature,
      estimated_value: lead.estimated_value?.toString() || '',
      currency: lead.currency,
      service_interested: lead.service_interested || '',
      pipeline_type: lead.pipeline_type || 'general',
      next_followup_date: lead.next_followup_date || '',
      notes: lead.notes || '',
    });
    setShowModal('edit');
  }

  function openDetailModal(lead: Lead) {
    setSelectedLead(lead);
    loadActivities(lead.id);
    setShowModal('detail');
  }

  function getStatusLabel(status: LeadStatus): string {
    const labels: Record<LeadStatus, string> = {
      new: t.leads.statusNew,
      contacted: t.leads.statusContacted,
      interested: t.leads.statusInterested,
      qualified: t.leads.statusQualified,
      not_qualified: t.leads.statusNotQualified,
      dormant: t.leads.statusDormant,
    };
    return labels[status];
  }

  function getStatusColor(status: LeadStatus): string {
    const colors: Record<LeadStatus, string> = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      interested: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      qualified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      not_qualified: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      dormant: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[status];
  }

  function getPipelineStageLabel(stage: PipelineStage): string {
    const labels: Record<PipelineStage, string> = {
      none: t.leads.stageNone,
      proposal: t.leads.stageProposal,
      negotiation: t.leads.stageNegotiation,
      demo: t.leads.stageDemo,
      closing: t.leads.stageClosing,
      won: t.leads.stageWon,
      lost: t.leads.stageLost,
    };
    return labels[stage];
  }

  function getPipelineStageColor(stage: PipelineStage): string {
    const colors: Record<PipelineStage, string> = {
      none: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      proposal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      negotiation: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      demo: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      closing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      won: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[stage];
  }

  function getServiceLabel(service: ServiceInterested | null): string {
    if (!service) return '-';
    const labels: Record<ServiceInterested, string> = {
      call_center: t.leads.serviceCallCenter,
      automations: t.leads.serviceAutomations,
      chatbot: t.leads.serviceChatbot,
      voicebot: t.leads.serviceVoicebot,
      web_development: t.leads.serviceWebDevelopment,
      app_development: t.leads.serviceAppDevelopment,
      ai: t.leads.serviceAI,
      crm: t.leads.serviceCRM,
      marketing: t.leads.serviceMarketing,
      seo: t.leads.serviceSEO,
      other: t.leads.serviceOther,
    };
    return labels[service];
  }

  function getSourceLabel(source: LeadSource): string {
    const labels: Record<LeadSource, string> = {
      website: t.leads.sourceWebsite,
      referral: t.leads.sourceReferral,
      social_media: t.leads.sourceSocialMedia,
      cold_call: t.leads.sourceColdCall,
      cold_email: t.leads.sourceColdEmail,
      email_campaign: t.leads.sourceEmailCampaign,
      event: t.leads.sourceEvent,
      advertising: t.leads.sourceAdvertising,
      linkedin: t.leads.sourceLinkedin,
      instagram: t.leads.sourceInstagram,
      facebook: t.leads.sourceFacebook,
      tiktok: t.leads.sourceTiktok,
      google_ads: t.leads.sourceGoogleAds,
      reactivated: t.leads.sourceReactivated,
      other: t.leads.sourceOther,
    };
    return labels[source];
  }

  function getPriorityLabel(priority: LeadPriority): string {
    const labels: Record<LeadPriority, string> = {
      low: t.leads.priorityLow,
      medium: t.leads.priorityMedium,
      high: t.leads.priorityHigh,
      urgent: t.leads.priorityUrgent,
    };
    return labels[priority];
  }

  function getPriorityColor(priority: LeadPriority): string {
    const colors: Record<LeadPriority, string> = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[priority];
  }

  function getTemperatureIcon(temp: LeadTemperature) {
    switch (temp) {
      case 'cold': return <FaSnowflake className="text-blue-500" />;
      case 'warm': return <FaSun className="text-yellow-500" />;
      case 'hot': return <FaFire className="text-red-500" />;
    }
  }

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchQuery === '' ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.company_name && lead.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchQuery));

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    const matchesService = serviceFilter === '' ||
      (lead.service_interested && lead.service_interested.toLowerCase().includes(serviceFilter.toLowerCase()));

    // Followup date filter
    let matchesFollowup = true;
    if (followupFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      if (followupFilter === 'none') {
        matchesFollowup = !lead.next_followup_date;
      } else if (followupFilter === 'overdue') {
        matchesFollowup = lead.next_followup_date ? new Date(lead.next_followup_date) < today : false;
      } else if (followupFilter === 'today') {
        if (lead.next_followup_date) {
          const followupDate = new Date(lead.next_followup_date);
          followupDate.setHours(0, 0, 0, 0);
          matchesFollowup = followupDate.getTime() === today.getTime();
        } else {
          matchesFollowup = false;
        }
      } else if (followupFilter === 'week') {
        if (lead.next_followup_date) {
          const followupDate = new Date(lead.next_followup_date);
          matchesFollowup = followupDate >= today && followupDate <= weekFromNow;
        } else {
          matchesFollowup = false;
        }
      }
    }

    return matchesSearch && matchesStatus && matchesSource && matchesPriority && matchesService && matchesFollowup;
  });

  // Stats - updated for new structure
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    active: leads.filter(l => ['contacted', 'interested', 'qualified'].includes(l.status)).length,
    inPipeline: leads.filter(l => l.pipeline_stage && l.pipeline_stage !== 'none' && !['won', 'lost'].includes(l.pipeline_stage)).length,
    won: leads.filter(l => l.pipeline_stage === 'won').length,
    dormant: leads.filter(l => l.status === 'dormant').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t.common.loading}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.leads.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t.leads.subtitle}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal('add'); }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          {t.leads.addLead}
        </button>
      </div>


      {/* Search and Filters */}
      <div className="bg-syntalys-blue dark:bg-gray-800 border border-syntalys-blue dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 dark:text-gray-400" />
            <input
              type="text"
              placeholder={t.common.search + '...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white placeholder-white/60 dark:placeholder-gray-400"
            />
          </div>
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border transition-colors ${
              showFilters
                ? 'bg-white/20 border-white/30 text-white dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
                : 'border-white/20 dark:border-gray-600 text-white dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700'
            }`}
          >
            <FaFilter className="w-4 h-4" />
            {t.common.filter}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-white/20 dark:border-gray-700">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
              className="px-3 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white"
            >
              <option value="all" className="text-gray-900">{t.leads.allStatuses}</option>
              <option value="new" className="text-gray-900">{t.leads.statusNew}</option>
              <option value="contacted" className="text-gray-900">{t.leads.statusContacted}</option>
              <option value="interested" className="text-gray-900">{t.leads.statusInterested}</option>
              <option value="qualified" className="text-gray-900">{t.leads.statusQualified}</option>
              <option value="not_qualified" className="text-gray-900">{t.leads.statusNotQualified}</option>
              <option value="dormant" className="text-gray-900">{t.leads.statusDormant}</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as LeadSource | 'all')}
              className="px-3 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white"
            >
              <option value="all" className="text-gray-900">{t.leads.allSources}</option>
              <option value="website" className="text-gray-900">{t.leads.sourceWebsite}</option>
              <option value="referral" className="text-gray-900">{t.leads.sourceReferral}</option>
              <option value="cold_call" className="text-gray-900">{t.leads.sourceColdCall}</option>
              <option value="cold_email" className="text-gray-900">{t.leads.sourceColdEmail}</option>
              <option value="linkedin" className="text-gray-900">{t.leads.sourceLinkedin}</option>
              <option value="instagram" className="text-gray-900">{t.leads.sourceInstagram}</option>
              <option value="facebook" className="text-gray-900">{t.leads.sourceFacebook}</option>
              <option value="google_ads" className="text-gray-900">{t.leads.sourceGoogleAds}</option>
              <option value="reactivated" className="text-gray-900">{t.leads.sourceReactivated}</option>
              <option value="other" className="text-gray-900">{t.leads.sourceOther}</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as LeadPriority | 'all')}
              className="px-3 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white"
            >
              <option value="all" className="text-gray-900">{t.leads.allPriorities}</option>
              <option value="low" className="text-gray-900">{t.leads.priorityLow}</option>
              <option value="medium" className="text-gray-900">{t.leads.priorityMedium}</option>
              <option value="high" className="text-gray-900">{t.leads.priorityHigh}</option>
              <option value="urgent" className="text-gray-900">{t.leads.priorityUrgent}</option>
            </select>
            <select
              value={followupFilter}
              onChange={(e) => setFollowupFilter(e.target.value as 'all' | 'today' | 'week' | 'overdue' | 'none')}
              className="px-3 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white"
            >
              <option value="all" className="text-gray-900">{t.leads.allFollowups}</option>
              <option value="today" className="text-gray-900">{t.leads.followupToday}</option>
              <option value="week" className="text-gray-900">{t.leads.followupWeek}</option>
              <option value="overdue" className="text-gray-900">{t.leads.followupOverdue}</option>
              <option value="none" className="text-gray-900">{t.leads.followupNone}</option>
            </select>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white"
            >
              <option value="" className="text-gray-900">{t.leads.serviceInterested}</option>
              <option value="call_center" className="text-gray-900">{t.leads.serviceCallCenter}</option>
              <option value="automations" className="text-gray-900">{t.leads.serviceAutomations}</option>
              <option value="chatbot" className="text-gray-900">{t.leads.serviceChatbot}</option>
              <option value="voicebot" className="text-gray-900">{t.leads.serviceVoicebot}</option>
              <option value="web_development" className="text-gray-900">{t.leads.serviceWebDevelopment}</option>
              <option value="app_development" className="text-gray-900">{t.leads.serviceAppDevelopment}</option>
              <option value="ai" className="text-gray-900">{t.leads.serviceAI}</option>
              <option value="crm" className="text-gray-900">{t.leads.serviceCRM}</option>
              <option value="marketing" className="text-gray-900">{t.leads.serviceMarketing}</option>
              <option value="seo" className="text-gray-900">{t.leads.serviceSEO}</option>
              <option value="other" className="text-gray-900">{t.leads.serviceOther}</option>
            </select>
          </div>
        )}
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-syntalys-blue dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white dark:text-gray-300 uppercase">{t.leads.name}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white dark:text-gray-300 uppercase">{t.leads.status}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white dark:text-gray-300 uppercase">{t.leads.source}</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-white dark:text-gray-300 uppercase">{t.leads.temperature}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white dark:text-gray-300 uppercase">{t.leads.priority}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white dark:text-gray-300 uppercase">{t.leads.nextFollowup}</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-white dark:text-gray-300 uppercase">{t.leads.contactCount}</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-white dark:text-gray-300 uppercase w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    {t.leads.noLeads}
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, index) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => openDetailModal(lead)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{lead.name}</p>
                          {lead.company_name && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <FaBuilding className="w-3 h-3" />
                              {lead.company_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{getSourceLabel(lead.source)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-lg">{getTemperatureIcon(lead.temperature)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(lead.priority)}`}>
                        {getPriorityLabel(lead.priority)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {lead.next_followup_date ? (
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                          {new Date(lead.next_followup_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{lead.contact_count}</span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        {/* Quick Actions */}
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title={t.leads.call}
                          >
                            <FaPhone className="w-4 h-4" />
                          </a>
                        )}
                        {lead.whatsapp && (
                          <a
                            href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title={t.leads.sendWhatsapp}
                          >
                            <FaWhatsapp className="w-4 h-4" />
                          </a>
                        )}
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                            title={t.leads.sendEmail}
                          >
                            <FaEnvelope className="w-4 h-4" />
                          </a>
                        )}
                        {/* Dropdown */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              if (openDropdown === lead.id) {
                                setOpenDropdown(null);
                                setDropdownPosition(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setDropdownPosition({
                                  top: rect.bottom + 8,
                                  left: rect.right - 192, // 192px = w-48
                                });
                                setOpenDropdown(lead.id);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <FaEllipsisV className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dropdown Portal */}
      {openDropdown && dropdownPosition && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-48 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 z-[9999]"
          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
        >
          <button
            onClick={() => {
              const lead = leads.find(l => l.id === openDropdown);
              if (lead) openEditModal(lead);
              setOpenDropdown(null);
              setDropdownPosition(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
          >
            {t.common.edit}
          </button>
          {(() => {
            const lead = leads.find(l => l.id === openDropdown);
            return lead && lead.pipeline_stage !== 'won' && lead.pipeline_stage !== 'lost' && (
              <button
                onClick={() => {
                  handleConvertToClient(lead);
                  setOpenDropdown(null);
                  setDropdownPosition(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t.leads.convertToClient}
              </button>
            );
          })()}
          <button
            onClick={() => {
              if (openDropdown) handleDeleteLead(openDropdown);
              setOpenDropdown(null);
              setDropdownPosition(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
          >
            {t.common.delete}
          </button>
        </div>,
        document.body
      )}

      {/* Add/Edit Modal */}
      {(showModal === 'add' || showModal === 'edit') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {showModal === 'add' ? t.leads.addLead : t.leads.editLead}
              </h2>
              <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.name} *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.companyName}</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.email}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.phone}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.whatsapp}</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+41 79 123 45 67"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.country}</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">-</option>
                    {Object.entries(COUNTRIES_DATA).map(([code, data]) => (
                      <option key={code} value={code}>{data.flag} {language === 'es' ? data.es : data.fr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lead Details - Row 1: Status, Pipeline Stage, Source */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.status}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="new">{t.leads.statusNew}</option>
                    <option value="contacted">{t.leads.statusContacted}</option>
                    <option value="interested">{t.leads.statusInterested}</option>
                    <option value="qualified">{t.leads.statusQualified}</option>
                    <option value="not_qualified">{t.leads.statusNotQualified}</option>
                    <option value="dormant">{t.leads.statusDormant}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.pipelineStage}</label>
                  <select
                    value={formData.pipeline_stage}
                    onChange={(e) => setFormData({ ...formData, pipeline_stage: e.target.value as PipelineStage })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="none">{t.leads.stageNone}</option>
                    <option value="proposal">{t.leads.stageProposal}</option>
                    <option value="demo">{t.leads.stageDemo}</option>
                    <option value="negotiation">{t.leads.stageNegotiation}</option>
                    <option value="closing">{t.leads.stageClosing}</option>
                    <option value="won">{t.leads.stageWon}</option>
                    <option value="lost">{t.leads.stageLost}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.source}</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="website">{t.leads.sourceWebsite}</option>
                    <option value="referral">{t.leads.sourceReferral}</option>
                    <option value="cold_call">{t.leads.sourceColdCall}</option>
                    <option value="cold_email">{t.leads.sourceColdEmail}</option>
                    <option value="linkedin">{t.leads.sourceLinkedin}</option>
                    <option value="instagram">{t.leads.sourceInstagram}</option>
                    <option value="facebook">{t.leads.sourceFacebook}</option>
                    <option value="google_ads">{t.leads.sourceGoogleAds}</option>
                    <option value="reactivated">{t.leads.sourceReactivated}</option>
                    <option value="other">{t.leads.sourceOther}</option>
                  </select>
                </div>
              </div>

              {/* Lead Details - Row 2: Priority, Temperature, Service */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.priority}</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as LeadPriority })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">{t.leads.priorityLow}</option>
                    <option value="medium">{t.leads.priorityMedium}</option>
                    <option value="high">{t.leads.priorityHigh}</option>
                    <option value="urgent">{t.leads.priorityUrgent}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.temperature}</label>
                  <select
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value as LeadTemperature })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="cold">{t.leads.tempCold}</option>
                    <option value="warm">{t.leads.tempWarm}</option>
                    <option value="hot">{t.leads.tempHot}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.serviceInterested} *</label>
                  <select
                    value={formData.service_interested}
                    onChange={(e) => setFormData({ ...formData, service_interested: e.target.value as ServiceInterested | '' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">-</option>
                    <option value="call_center">{t.leads.serviceCallCenter}</option>
                    <option value="automations">{t.leads.serviceAutomations}</option>
                    <option value="chatbot">{t.leads.serviceChatbot}</option>
                    <option value="voicebot">{t.leads.serviceVoicebot}</option>
                    <option value="web_development">{t.leads.serviceWebDevelopment}</option>
                    <option value="app_development">{t.leads.serviceAppDevelopment}</option>
                    <option value="ai">{t.leads.serviceAI}</option>
                    <option value="crm">{t.leads.serviceCRM}</option>
                    <option value="marketing">{t.leads.serviceMarketing}</option>
                    <option value="seo">{t.leads.serviceSEO}</option>
                    <option value="other">{t.leads.serviceOther}</option>
                  </select>
                </div>
              </div>

              {/* Business Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.estimatedValue}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.estimated_value}
                      onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="CHF">CHF</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.nextFollowup}</label>
                  <input
                    type="date"
                    value={formData.next_followup_date}
                    onChange={(e) => setFormData({ ...formData, next_followup_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.notes}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowModal(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={showModal === 'add' ? handleAddLead : handleEditLead}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  {t.common.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showModal === 'detail' && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {selectedLead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedLead.name}</h2>
                  {selectedLead.company_name && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedLead.company_name}</p>
                  )}
                </div>
              </div>
              <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Quick Status Change */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.leads.status}</label>
                <div className="flex flex-wrap gap-2">
                  {(['new', 'contacted', 'interested', 'qualified', 'not_qualified', 'dormant'] as LeadStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedLead, status)}
                      className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                        selectedLead.status === status
                          ? getStatusColor(status) + ' ring-2 ring-offset-2 ring-blue-500'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:opacity-80'
                      }`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pipeline Stage & Service */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.leads.pipelineStage}</label>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getPipelineStageColor(selectedLead.pipeline_stage || 'none')}`}>
                    {getPipelineStageLabel(selectedLead.pipeline_stage || 'none')}
                  </span>
                </div>
                {selectedLead.service_interested && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.leads.serviceInterested}</label>
                    <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {getServiceLabel(selectedLead.service_interested)}
                    </span>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {selectedLead.phone && (
                  <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                    <FaPhone className="w-4 h-4" />
                    <span className="text-sm truncate">{selectedLead.phone}</span>
                  </a>
                )}
                {selectedLead.whatsapp && (
                  <a href={`https://wa.me/${selectedLead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
                    <FaWhatsapp className="w-4 h-4" />
                    <span className="text-sm truncate">{selectedLead.whatsapp}</span>
                  </a>
                )}
                {selectedLead.email && (
                  <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors">
                    <FaEnvelope className="w-4 h-4" />
                    <span className="text-sm truncate">{selectedLead.email}</span>
                  </a>
                )}
                {selectedLead.country && COUNTRIES_DATA[selectedLead.country] && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    <FaGlobe className="w-4 h-4" />
                    <span className="text-sm">{COUNTRIES_DATA[selectedLead.country].flag} {language === 'es' ? COUNTRIES_DATA[selectedLead.country].es : COUNTRIES_DATA[selectedLead.country].fr}</span>
                  </div>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.leads.source}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getSourceLabel(selectedLead.source)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.leads.priority}</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedLead.priority)}`}>
                    {getPriorityLabel(selectedLead.priority)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.leads.temperature}</p>
                  <div className="flex items-center gap-1">
                    {getTemperatureIcon(selectedLead.temperature)}
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {selectedLead.temperature === 'cold' ? t.leads.tempCold : selectedLead.temperature === 'warm' ? t.leads.tempWarm : t.leads.tempHot}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.leads.contactCount}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedLead.contact_count}</p>
                </div>
                {selectedLead.estimated_value && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.leads.estimatedValue}</p>
                    <p className="font-medium text-green-600">{selectedLead.currency} {selectedLead.estimated_value.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.leads.firstContactDate}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedLead.first_contact_date ? new Date(selectedLead.first_contact_date).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.leads.lastContactDate}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedLead.last_contact_date ? new Date(selectedLead.last_contact_date).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.leads.notes}</h3>
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 whitespace-pre-wrap">{selectedLead.notes}</p>
                </div>
              )}

              {/* Activities */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.leads.activities}</h3>
                  <button
                    onClick={() => setShowModal('activity')}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    <FaPlus className="w-3 h-3" />
                    {t.leads.addActivity}
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {(activities[selectedLead.id] || []).length === 0 ? (
                    <p className="text-center text-gray-400 py-4">No hay actividades registradas</p>
                  ) : (
                    (activities[selectedLead.id] || []).map(activity => (
                      <div key={activity.id} className="p-3 bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase">
                            {activity.activity_type === 'call' ? t.leads.activityCall :
                             activity.activity_type === 'email' ? t.leads.activityEmail :
                             activity.activity_type === 'whatsapp' ? t.leads.activityWhatsapp :
                             activity.activity_type === 'meeting' ? t.leads.activityMeeting :
                             activity.activity_type === 'note' ? t.leads.activityNote :
                             t.leads.activityStatusChange}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(activity.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{activity.description}</p>
                        {activity.outcome && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <strong>{t.leads.outcome}:</strong> {activity.outcome}
                          </p>
                        )}
                        {activity.next_action && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            <strong>{t.leads.nextAction}:</strong> {activity.next_action}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between gap-3 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <button
                    onClick={() => { openEditModal(selectedLead); }}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    {t.common.edit}
                  </button>
                  <a
                    href={`/dashboard/activities?lead=${selectedLead.id}&create=true`}
                    className="px-4 py-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-2"
                  >
                    <FaCalendarAlt className="w-4 h-4" />
                    {t.activities?.scheduleActivity || 'Programar actividad'}
                  </a>
                </div>
                <div className="flex gap-3">
                  {selectedLead.pipeline_stage !== 'won' && selectedLead.pipeline_stage !== 'lost' && (
                    <button
                      onClick={() => handleConvertToClient(selectedLead)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                    >
                      {t.leads.convertToClient}
                    </button>
                  )}
                  <button
                    onClick={() => setShowModal(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {t.common.close}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showModal === 'activity' && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t.leads.addActivity}</h2>
              <button onClick={() => { setShowModal('detail'); }} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                <select
                  value={activityForm.activity_type}
                  onChange={(e) => setActivityForm({ ...activityForm, activity_type: e.target.value as LeadActivity['activity_type'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="call">{t.leads.activityCall}</option>
                  <option value="email">{t.leads.activityEmail}</option>
                  <option value="whatsapp">{t.leads.activityWhatsapp}</option>
                  <option value="meeting">{t.leads.activityMeeting}</option>
                  <option value="note">{t.leads.activityNote}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.common.description} *</label>
                <textarea
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.outcome}</label>
                <input
                  type="text"
                  value={activityForm.outcome}
                  onChange={(e) => setActivityForm({ ...activityForm, outcome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.leads.nextAction}</label>
                <input
                  type="text"
                  value={activityForm.next_action}
                  onChange={(e) => setActivityForm({ ...activityForm, next_action: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowModal('detail')}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={handleAddActivity}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  {t.common.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
