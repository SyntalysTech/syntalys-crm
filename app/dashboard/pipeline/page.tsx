'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Lead, PipelineStage, LeadTemperature, LeadPriority, ServiceInterested, LeadStatus } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { FaPhone, FaWhatsapp, FaEnvelope, FaFire, FaSnowflake, FaSun, FaCalendarAlt, FaBuilding, FaChevronDown, FaChevronUp, FaFilter } from 'react-icons/fa';

// Pipeline stage columns configuration
const PIPELINE_COLUMNS: { stage: PipelineStage; color: string }[] = [
  { stage: 'none', color: 'gray' },
  { stage: 'proposal', color: 'purple' },
  { stage: 'demo', color: 'cyan' },
  { stage: 'negotiation', color: 'orange' },
  { stage: 'closing', color: 'indigo' },
  { stage: 'won', color: 'green' },
  { stage: 'lost', color: 'red' },
];

const COLOR_CLASSES: Record<string, { border: string; bg: string; light: string }> = {
  blue: { border: 'border-blue-500', bg: 'bg-blue-500', light: 'bg-blue-50 dark:bg-blue-900/20' },
  yellow: { border: 'border-yellow-500', bg: 'bg-yellow-500', light: 'bg-yellow-50 dark:bg-yellow-900/20' },
  indigo: { border: 'border-indigo-500', bg: 'bg-indigo-500', light: 'bg-indigo-50 dark:bg-indigo-900/20' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-500', light: 'bg-purple-50 dark:bg-purple-900/20' },
  orange: { border: 'border-orange-500', bg: 'bg-orange-500', light: 'bg-orange-50 dark:bg-orange-900/20' },
  green: { border: 'border-green-500', bg: 'bg-green-500', light: 'bg-green-50 dark:bg-green-900/20' },
  red: { border: 'border-red-500', bg: 'bg-red-500', light: 'bg-red-50 dark:bg-red-900/20' },
  gray: { border: 'border-gray-500', bg: 'bg-gray-500', light: 'bg-gray-50 dark:bg-gray-900/20' },
  cyan: { border: 'border-cyan-500', bg: 'bg-cyan-500', light: 'bg-cyan-50 dark:bg-cyan-900/20' },
};

export default function PipelinePage() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<PipelineStage, boolean>>({} as Record<PipelineStage, boolean>);
  const [serviceFilter, setServiceFilter] = useState<ServiceInterested | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading leads:', error);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  }

  async function handleStageChange(lead: Lead, newStage: PipelineStage) {
    if (lead.pipeline_stage === newStage) return;

    const oldStage = lead.pipeline_stage;

    // Optimistic update
    setLeads(prev => prev.map(l =>
      l.id === lead.id ? { ...l, pipeline_stage: newStage, updated_at: new Date().toISOString() } : l
    ));

    const { error } = await supabase
      .from('leads')
      .update({
        pipeline_stage: newStage,
        last_contact_date: new Date().toISOString().split('T')[0],
        contact_count: lead.contact_count + 1,
      })
      .eq('id', lead.id);

    if (error) {
      console.error('Error updating lead pipeline stage:', error);
      setLeads(prev => prev.map(l =>
        l.id === lead.id ? { ...l, pipeline_stage: oldStage } : l
      ));
      return;
    }

    await supabase.from('lead_activities').insert([{
      lead_id: lead.id,
      user_id: profile?.id,
      activity_type: 'status_change',
      description: `Pipeline cambiado de "${getStageLabel(oldStage || 'none')}" a "${getStageLabel(newStage)}"`,
    }]);

    // Create automatic activities based on pipeline automations
    await createAutomaticActivities(lead, newStage);
  }

  async function createAutomaticActivities(lead: Lead, newStage: PipelineStage) {
    // Fetch automation rules for this stage
    const { data: automations } = await supabase
      .from('pipeline_automations')
      .select('*')
      .eq('trigger_stage', newStage)
      .eq('is_active', true);

    if (!automations || automations.length === 0) return;

    // Create activities for each automation rule
    const activitiesToCreate = automations.map(automation => {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + (automation.days_delay || 0));
      scheduledDate.setHours(scheduledDate.getHours() + (automation.hours_delay || 0));

      return {
        user_id: profile?.id,
        lead_id: lead.id,
        company_name: lead.company_name,
        title: automation.activity_title,
        description: automation.activity_description,
        activity_type: automation.activity_type,
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        scheduled_time: automation.hours_delay ? scheduledDate.toTimeString().slice(0, 5) : '09:00',
        priority: automation.default_priority || 'medium',
        status: 'pending',
        auto_created: true,
        trigger_stage: newStage,
      };
    });

    const { error } = await supabase.from('activities').insert(activitiesToCreate);
    if (error) {
      console.error('Error creating automatic activities:', error);
    }
  }

  function getStageLabel(stage: PipelineStage): string {
    const labels: Record<PipelineStage, string> = {
      none: t.leads.stageNone,
      proposal: t.leads.stageProposal,
      demo: t.leads.stageDemo,
      negotiation: t.leads.stageNegotiation,
      closing: t.leads.stageClosing,
      won: t.leads.stageWon,
      lost: t.leads.stageLost,
    };
    return labels[stage];
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
      new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      contacted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
      interested: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
      qualified: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
      not_qualified: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
      dormant: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[status];
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

  function getPriorityColor(priority: LeadPriority): string {
    const colors: Record<LeadPriority, string> = {
      low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    return colors[priority];
  }

  function getTemperatureIcon(temp: LeadTemperature) {
    switch (temp) {
      case 'cold': return <FaSnowflake className="text-blue-500" title={t.leads.tempCold} />;
      case 'warm': return <FaSun className="text-yellow-500" title={t.leads.tempWarm} />;
      case 'hot': return <FaFire className="text-red-500" title={t.leads.tempHot} />;
    }
  }

  function handleDragStart(e: React.DragEvent, lead: Lead) {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead.id);
  }

  function handleDragEnd() {
    setDraggedLead(null);
    setDragOverStage(null);
  }

  function handleDragOver(e: React.DragEvent, stage: PipelineStage) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  }

  function handleDragLeave() {
    setDragOverStage(null);
  }

  function handleDrop(e: React.DragEvent, newStage: PipelineStage) {
    e.preventDefault();
    setDragOverStage(null);

    if (draggedLead && draggedLead.pipeline_stage !== newStage) {
      handleStageChange(draggedLead, newStage);
    }
    setDraggedLead(null);
  }

  function getLeadsByStage(stage: PipelineStage): Lead[] {
    return filteredLeads.filter(lead => (lead.pipeline_stage || 'none') === stage);
  }

  function toggleSection(stage: PipelineStage) {
    setCollapsedSections(prev => ({ ...prev, [stage]: !prev[stage] }));
  }

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesService = serviceFilter === 'all' || lead.service_interested === serviceFilter;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesService && matchesStatus;
  });

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.leads.pipelineTitle}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t.leads.pipelineSubtitle}</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3 items-center bg-syntalys-blue dark:bg-gray-800 p-4">
        <FaFilter className="text-white dark:text-gray-400" />
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value as ServiceInterested | 'all')}
          className="px-3 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white text-sm"
        >
          <option value="all" className="text-gray-900">{t.leads.allServices}</option>
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
          className="px-3 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white text-sm"
        >
          <option value="all" className="text-gray-900">{t.leads.allStatuses}</option>
          <option value="new" className="text-gray-900">{t.leads.statusNew}</option>
          <option value="contacted" className="text-gray-900">{t.leads.statusContacted}</option>
          <option value="interested" className="text-gray-900">{t.leads.statusInterested}</option>
          <option value="qualified" className="text-gray-900">{t.leads.statusQualified}</option>
          <option value="not_qualified" className="text-gray-900">{t.leads.statusNotQualified}</option>
          <option value="dormant" className="text-gray-900">{t.leads.statusDormant}</option>
        </select>
        {(serviceFilter !== 'all' || statusFilter !== 'all') && (
          <button
            onClick={() => { setServiceFilter('all'); setStatusFilter('all'); }}
            className="text-sm text-white/80 hover:text-white dark:text-blue-400"
          >
            {t.common.clearFilters}
          </button>
        )}
      </div>

      {/* Pipeline Grid - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {PIPELINE_COLUMNS.map(({ stage, color }) => {
          const columnLeads = getLeadsByStage(stage);
          const isDropTarget = dragOverStage === stage && draggedLead?.pipeline_stage !== stage;
          const isCollapsed = collapsedSections[stage];
          const colors = COLOR_CLASSES[color];
          const columnValue = columnLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);

          return (
            <div
              key={stage}
              className={`bg-white dark:bg-gray-800 border-2 transition-all duration-200 ${
                isDropTarget
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(stage)}
                className={`w-full px-4 py-3 flex items-center justify-between border-b-2 ${colors.border} rounded-t-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${colors.bg}`}></div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {getStageLabel(stage)}
                  </h3>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {columnLeads.length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {columnValue > 0 && (
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      CHF {columnValue.toLocaleString()}
                    </span>
                  )}
                  {isCollapsed ? (
                    <FaChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <FaChevronUp className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Section Content */}
              {!isCollapsed && (
                <div className={`p-3 space-y-2 max-h-96 overflow-y-auto ${isDropTarget ? colors.light : ''}`}>
                  {columnLeads.length === 0 ? (
                    <div className={`flex items-center justify-center h-20 border-2 border-dashed transition-colors ${
                      isDropTarget
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}>
                      <p className="text-sm text-gray-400 dark:text-gray-500">{t.leads.emptyColumn}</p>
                    </div>
                  ) : (
                    columnLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead)}
                        onDragEnd={handleDragEnd}
                        className={`bg-gray-50 dark:bg-gray-700/50 p-3 cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-300 dark:hover:border-gray-600 ${
                          draggedLead?.id === lead.id ? 'opacity-50 scale-95' : ''
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {lead.name}
                            </p>
                            {lead.company_name && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                                <FaBuilding className="w-3 h-3 flex-shrink-0" />
                                {lead.company_name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {getTemperatureIcon(lead.temperature)}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(lead.status)}`}>
                            {getStatusLabel(lead.status)}
                          </span>
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(lead.priority)}`}>
                            {lead.priority}
                          </span>
                          {lead.service_interested && (
                            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                              {getServiceLabel(lead.service_interested)}
                            </span>
                          )}
                          {lead.estimated_value && (
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400 ml-auto">
                              {lead.currency} {lead.estimated_value.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Next followup */}
                        {lead.next_followup_date && (
                          <div className="mt-2 flex items-center gap-1">
                            <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(lead.next_followup_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                              title={t.leads.call}
                            >
                              <FaPhone className="w-3 h-3" />
                            </a>
                          )}
                          {lead.whatsapp && (
                            <a
                              href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                              title={t.leads.sendWhatsapp}
                            >
                              <FaWhatsapp className="w-3 h-3" />
                            </a>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded transition-colors"
                              title={t.leads.sendEmail}
                            >
                              <FaEnvelope className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
