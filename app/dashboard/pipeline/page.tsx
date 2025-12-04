'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Lead, LeadStatus, LeadTemperature, LeadPriority } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { FaPhone, FaWhatsapp, FaEnvelope, FaFire, FaSnowflake, FaSun, FaCalendarAlt, FaBuilding, FaGripVertical } from 'react-icons/fa';

// Status columns configuration
const STATUS_COLUMNS: { status: LeadStatus; colorClass: string; bgClass: string }[] = [
  { status: 'new', colorClass: 'border-blue-500', bgClass: 'bg-blue-500' },
  { status: 'contacted', colorClass: 'border-yellow-500', bgClass: 'bg-yellow-500' },
  { status: 'qualified', colorClass: 'border-indigo-500', bgClass: 'bg-indigo-500' },
  { status: 'proposal', colorClass: 'border-purple-500', bgClass: 'bg-purple-500' },
  { status: 'negotiation', colorClass: 'border-orange-500', bgClass: 'bg-orange-500' },
  { status: 'won', colorClass: 'border-green-500', bgClass: 'bg-green-500' },
  { status: 'lost', colorClass: 'border-red-500', bgClass: 'bg-red-500' },
  { status: 'no_answer', colorClass: 'border-gray-500', bgClass: 'bg-gray-500' },
  { status: 'callback', colorClass: 'border-cyan-500', bgClass: 'bg-cyan-500' },
];

export default function PipelinePage() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  async function handleStatusChange(lead: Lead, newStatus: LeadStatus) {
    if (lead.status === newStatus) return;

    const oldStatus = lead.status;

    // Optimistic update
    setLeads(prev => prev.map(l =>
      l.id === lead.id ? { ...l, status: newStatus, updated_at: new Date().toISOString() } : l
    ));

    const { error } = await supabase
      .from('leads')
      .update({
        status: newStatus,
        last_contact_date: new Date().toISOString().split('T')[0],
        contact_count: lead.contact_count + 1,
      })
      .eq('id', lead.id);

    if (error) {
      console.error('Error updating lead status:', error);
      // Revert on error
      setLeads(prev => prev.map(l =>
        l.id === lead.id ? { ...l, status: oldStatus } : l
      ));
      return;
    }

    // Add activity
    await supabase.from('lead_activities').insert([{
      lead_id: lead.id,
      user_id: profile?.id,
      activity_type: 'status_change',
      description: `Estado cambiado de "${getStatusLabel(oldStatus)}" a "${getStatusLabel(newStatus)}"`,
    }]);
  }

  function getStatusLabel(status: LeadStatus): string {
    const labels: Record<LeadStatus, string> = {
      new: t.leads.statusNew,
      contacted: t.leads.statusContacted,
      qualified: t.leads.statusQualified,
      proposal: t.leads.statusProposal,
      negotiation: t.leads.statusNegotiation,
      won: t.leads.statusWon,
      lost: t.leads.statusLost,
      no_answer: t.leads.statusNoAnswer,
      callback: t.leads.statusCallback,
    };
    return labels[status];
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

  function getPriorityLabel(priority: LeadPriority): string {
    const labels: Record<LeadPriority, string> = {
      low: t.leads.priorityLow,
      medium: t.leads.priorityMedium,
      high: t.leads.priorityHigh,
      urgent: t.leads.priorityUrgent,
    };
    return labels[priority];
  }

  function getTemperatureIcon(temp: LeadTemperature) {
    switch (temp) {
      case 'cold': return <FaSnowflake className="text-blue-500" title={t.leads.tempCold} />;
      case 'warm': return <FaSun className="text-yellow-500" title={t.leads.tempWarm} />;
      case 'hot': return <FaFire className="text-red-500" title={t.leads.tempHot} />;
    }
  }

  // Drag handlers
  function handleDragStart(e: React.DragEvent, lead: Lead) {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead.id);
    // Add dragging class after a small delay for visual feedback
    setTimeout(() => {
      const element = document.getElementById(`lead-card-${lead.id}`);
      if (element) element.classList.add('opacity-50');
    }, 0);
  }

  function handleDragEnd() {
    if (draggedLead) {
      const element = document.getElementById(`lead-card-${draggedLead.id}`);
      if (element) element.classList.remove('opacity-50');
    }
    setDraggedLead(null);
    setDragOverColumn(null);
  }

  function handleDragOver(e: React.DragEvent, status: LeadStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  }

  function handleDragLeave() {
    setDragOverColumn(null);
  }

  function handleDrop(e: React.DragEvent, newStatus: LeadStatus) {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedLead && draggedLead.status !== newStatus) {
      handleStatusChange(draggedLead, newStatus);
    }
    setDraggedLead(null);
  }

  // Get leads for a specific status
  function getLeadsByStatus(status: LeadStatus): Lead[] {
    return leads.filter(lead => lead.status === status);
  }

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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.leads.pipelineTitle}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.leads.pipelineSubtitle}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="hidden sm:inline">{t.leads.dragToMove}</span>
            <FaGripVertical className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6"
      >
        <div className="flex gap-4 h-full min-w-max">
          {STATUS_COLUMNS.map(({ status, colorClass, bgClass }) => {
            const columnLeads = getLeadsByStatus(status);
            const isDropTarget = dragOverColumn === status && draggedLead?.status !== status;

            return (
              <div
                key={status}
                className={`flex flex-col w-72 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg transition-all duration-200 ${
                  isDropTarget ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
              >
                {/* Column Header */}
                <div className={`flex-shrink-0 px-4 py-3 border-b-2 ${colorClass}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${bgClass}`}></div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {getStatusLabel(status)}
                      </h3>
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {columnLeads.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {columnLeads.length === 0 ? (
                    <div className={`flex items-center justify-center h-24 border-2 border-dashed rounded-lg transition-colors ${
                      isDropTarget
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      <p className="text-sm text-gray-400 dark:text-gray-500">{t.leads.emptyColumn}</p>
                    </div>
                  ) : (
                    columnLeads.map((lead) => (
                      <div
                        key={lead.id}
                        id={`lead-card-${lead.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead)}
                        onDragEnd={handleDragEnd}
                        className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
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

                        {/* Priority & Next Followup */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(lead.priority)}`}>
                            {getPriorityLabel(lead.priority)}
                          </span>
                          {lead.next_followup_date && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <FaCalendarAlt className="w-3 h-3" />
                              {new Date(lead.next_followup_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-1 pt-2 border-t border-gray-100 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                              title={t.leads.call}
                            >
                              <FaPhone className="w-3.5 h-3.5" />
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
                              <FaWhatsapp className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded transition-colors"
                              title={t.leads.sendEmail}
                            >
                              <FaEnvelope className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {/* Drag handle indicator */}
                          <div className="ml-auto">
                            <FaGripVertical className="w-3 h-3 text-gray-300 dark:text-gray-500" />
                          </div>
                        </div>

                        {/* Estimated Value */}
                        {lead.estimated_value && (
                          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-600">
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                              {lead.currency} {lead.estimated_value.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Column Footer - Stats */}
                {columnLeads.length > 0 && (
                  <div className="flex-shrink-0 px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 rounded-b-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {columnLeads.length} {t.leads.leadsInColumn}
                      {columnLeads.some(l => l.estimated_value) && (
                        <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                          CHF {columnLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0).toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
