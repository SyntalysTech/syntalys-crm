'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Activity, ActivityWithLead, Lead, ActivityType, ActivityStatus, ActivityPriority, ServiceInterested, PipelineStage } from '@/lib/types';
import Link from 'next/link';
import {
  FaPhone, FaEnvelope, FaVideo, FaRedo, FaBell, FaDesktop, FaFileAlt, FaEllipsisH,
  FaPlus, FaCheck, FaClock, FaExclamationTriangle, FaTimes, FaCalendarAlt,
  FaFilter, FaBuilding, FaUser, FaChevronLeft, FaChevronRight, FaList, FaCalendar,
  FaFire, FaSnowflake, FaSun, FaExternalLinkAlt, FaEdit, FaTrash
} from 'react-icons/fa';

// View mode type
type ViewMode = 'list' | 'calendar';
type DateFilter = 'today' | 'tomorrow' | 'week' | 'month' | 'overdue' | 'all';

export default function ActivitiesPage() {
  const { profile } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityWithLead[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // View and filters
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ActivityPriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('pending');
  const [serviceFilter, setServiceFilter] = useState<ServiceInterested | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingActivity, setCompletingActivity] = useState<Activity | null>(null);
  const [outcomeText, setOutcomeText] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    lead_id: '',
    company_name: '',
    title: '',
    description: '',
    activity_type: 'call' as ActivityType,
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '09:00',
    duration_minutes: 30,
    priority: 'medium' as ActivityPriority,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Load activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (activitiesError) throw activitiesError;

      // Load leads for reference
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*');

      if (leadsError) throw leadsError;

      setLeads(leadsData || []);

      // Combine activities with lead data
      const activitiesWithLeads: ActivityWithLead[] = (activitiesData || []).map(activity => ({
        ...activity,
        lead: leadsData?.find(l => l.id === activity.lead_id) || null,
      }));

      // Check for overdue activities and update them
      const today = new Date().toISOString().split('T')[0];
      const overdueActivities = activitiesWithLeads.filter(
        a => a.scheduled_date < today && a.status === 'pending'
      );

      if (overdueActivities.length > 0) {
        await supabase
          .from('activities')
          .update({ status: 'overdue' })
          .in('id', overdueActivities.map(a => a.id));

        // Update local state
        overdueActivities.forEach(a => {
          a.status = 'overdue';
        });
      }

      setActivities(activitiesWithLeads);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter activities
  const filteredActivities = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const monthEnd = new Date(today);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    return activities.filter(activity => {
      const activityDate = new Date(activity.scheduled_date);
      activityDate.setHours(0, 0, 0, 0);

      // Date filter
      let matchesDate = true;
      switch (dateFilter) {
        case 'today':
          matchesDate = activityDate.getTime() === today.getTime();
          break;
        case 'tomorrow':
          matchesDate = activityDate.getTime() === tomorrow.getTime();
          break;
        case 'week':
          matchesDate = activityDate >= today && activityDate <= weekEnd;
          break;
        case 'month':
          matchesDate = activityDate >= today && activityDate <= monthEnd;
          break;
        case 'overdue':
          matchesDate = activity.status === 'overdue';
          break;
        case 'all':
          matchesDate = true;
          break;
      }

      // Other filters
      const matchesType = typeFilter === 'all' || activity.activity_type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || activity.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
      const matchesService = serviceFilter === 'all' || activity.lead?.service_interested === serviceFilter;

      return matchesDate && matchesType && matchesPriority && matchesStatus && matchesService;
    });
  }, [activities, dateFilter, typeFilter, priorityFilter, statusFilter, serviceFilter]);

  // Count overdue activities
  const overdueCount = useMemo(() => {
    return activities.filter(a => a.status === 'overdue').length;
  }, [activities]);

  // Count today's activities
  const todayCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return activities.filter(a => a.scheduled_date === today && a.status === 'pending').length;
  }, [activities]);

  // Get activity type icon
  function getActivityTypeIcon(type: ActivityType) {
    const icons: Record<ActivityType, React.ReactNode> = {
      call: <FaPhone className="w-4 h-4" />,
      email: <FaEnvelope className="w-4 h-4" />,
      meeting: <FaVideo className="w-4 h-4" />,
      follow_up: <FaRedo className="w-4 h-4" />,
      reminder: <FaBell className="w-4 h-4" />,
      demo: <FaDesktop className="w-4 h-4" />,
      proposal: <FaFileAlt className="w-4 h-4" />,
      other: <FaEllipsisH className="w-4 h-4" />,
    };
    return icons[type];
  }

  function getActivityTypeLabel(type: ActivityType): string {
    const labels: Record<ActivityType, string> = {
      call: t.activities?.typeCall || 'Llamada',
      email: t.activities?.typeEmail || 'Email',
      meeting: t.activities?.typeMeeting || 'Reunión',
      follow_up: t.activities?.typeFollowUp || 'Seguimiento',
      reminder: t.activities?.typeReminder || 'Recordatorio',
      demo: t.activities?.typeDemo || 'Demo',
      proposal: t.activities?.typeProposal || 'Propuesta',
      other: t.activities?.typeOther || 'Otro',
    };
    return labels[type];
  }

  function getActivityTypeColor(type: ActivityType): string {
    const colors: Record<ActivityType, string> = {
      call: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      email: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      meeting: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      follow_up: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      reminder: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      demo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      proposal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[type];
  }

  function getStatusLabel(status: ActivityStatus): string {
    const labels: Record<ActivityStatus, string> = {
      pending: t.activities?.statusPending || 'Pendiente',
      completed: t.activities?.statusCompleted || 'Completada',
      overdue: t.activities?.statusOverdue || 'Vencida',
      cancelled: t.activities?.statusCancelled || 'Cancelada',
      rescheduled: t.activities?.statusRescheduled || 'Reprogramada',
    };
    return labels[status];
  }

  function getStatusColor(status: ActivityStatus): string {
    const colors: Record<ActivityStatus, string> = {
      pending: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      rescheduled: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return colors[status];
  }

  function getPriorityLabel(priority: ActivityPriority): string {
    const labels: Record<ActivityPriority, string> = {
      low: t.activities?.priorityLow || 'Baja',
      medium: t.activities?.priorityMedium || 'Media',
      high: t.activities?.priorityHigh || 'Alta',
      urgent: t.activities?.priorityUrgent || 'Urgente',
    };
    return labels[priority];
  }

  function getPriorityColor(priority: ActivityPriority): string {
    const colors: Record<ActivityPriority, string> = {
      low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[priority];
  }

  function getServiceLabel(service: ServiceInterested | null): string {
    if (!service) return '-';
    const labels: Record<ServiceInterested, string> = {
      call_center: t.leads?.serviceCallCenter || 'Call Center',
      automations: t.leads?.serviceAutomations || 'Automatizaciones',
      chatbot: t.leads?.serviceChatbot || 'Chatbot',
      voicebot: t.leads?.serviceVoicebot || 'Voicebot',
      web_development: t.leads?.serviceWebDevelopment || 'Desarrollo Web',
      app_development: t.leads?.serviceAppDevelopment || 'Desarrollo App',
      ai: t.leads?.serviceAI || 'IA',
      crm: t.leads?.serviceCRM || 'CRM',
      marketing: t.leads?.serviceMarketing || 'Marketing',
      seo: t.leads?.serviceSEO || 'SEO',
      other: t.leads?.serviceOther || 'Otro',
    };
    return labels[service];
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return t.activities?.today || 'Hoy';
    }
    if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return t.activities?.tomorrow || 'Mañana';
    }
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  function formatTime(timeStr: string | null): string {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  }

  // Modal handlers
  function openCreateModal(leadId?: string, companyName?: string) {
    setEditingActivity(null);
    const lead = leadId ? leads.find(l => l.id === leadId) : null;
    setFormData({
      lead_id: leadId || '',
      company_name: companyName || lead?.company_name || '',
      title: '',
      description: '',
      activity_type: 'call',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '09:00',
      duration_minutes: 30,
      priority: 'medium',
    });
    setShowModal(true);
  }

  function openEditModal(activity: Activity) {
    setEditingActivity(activity);
    setFormData({
      lead_id: activity.lead_id || '',
      company_name: activity.company_name || '',
      title: activity.title,
      description: activity.description || '',
      activity_type: activity.activity_type,
      scheduled_date: activity.scheduled_date,
      scheduled_time: activity.scheduled_time || '09:00',
      duration_minutes: activity.duration_minutes,
      priority: activity.priority,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const lead = formData.lead_id ? leads.find(l => l.id === formData.lead_id) : null;

    const activityData = {
      user_id: profile?.id,
      lead_id: formData.lead_id || null,
      company_name: formData.company_name || lead?.company_name || null,
      title: formData.title,
      description: formData.description || null,
      activity_type: formData.activity_type,
      scheduled_date: formData.scheduled_date,
      scheduled_time: formData.scheduled_time || null,
      duration_minutes: formData.duration_minutes,
      priority: formData.priority,
      status: 'pending' as ActivityStatus,
    };

    if (editingActivity) {
      const { error } = await supabase
        .from('activities')
        .update(activityData)
        .eq('id', editingActivity.id);

      if (error) {
        console.error('Error updating activity:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('activities')
        .insert([activityData]);

      if (error) {
        console.error('Error creating activity:', error);
        return;
      }

      // Also create a lead_activity record if linked to a lead
      if (formData.lead_id) {
        await supabase.from('lead_activities').insert([{
          lead_id: formData.lead_id,
          user_id: profile?.id,
          activity_type: formData.activity_type === 'follow_up' ? 'note' : formData.activity_type,
          description: `Actividad programada: ${formData.title}`,
        }]);
      }
    }

    setShowModal(false);
    loadData();
  }

  async function handleComplete(activity: Activity) {
    setCompletingActivity(activity);
    setOutcomeText('');
    setShowCompleteModal(true);
  }

  async function submitComplete() {
    if (!completingActivity) return;

    const { error } = await supabase
      .from('activities')
      .update({
        status: 'completed',
        outcome: outcomeText || null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', completingActivity.id);

    if (error) {
      console.error('Error completing activity:', error);
      return;
    }

    // Register in lead history
    if (completingActivity.lead_id) {
      await supabase.from('lead_activities').insert([{
        lead_id: completingActivity.lead_id,
        user_id: profile?.id,
        activity_type: completingActivity.activity_type === 'follow_up' ? 'note' : completingActivity.activity_type,
        description: `${getActivityTypeLabel(completingActivity.activity_type)} completada: ${completingActivity.title}`,
        outcome: outcomeText || null,
      }]);

      // Update lead's last contact date
      await supabase
        .from('leads')
        .update({
          last_contact_date: new Date().toISOString().split('T')[0],
          contact_count: (activities.find(a => a.id === completingActivity.id)?.lead?.contact_count || 0) + 1,
        })
        .eq('id', completingActivity.lead_id);
    }

    setShowCompleteModal(false);
    setCompletingActivity(null);
    loadData();
  }

  async function handleReschedule(activity: Activity) {
    const newDate = prompt(
      t.activities?.reschedulePrompt || 'Nueva fecha (YYYY-MM-DD):',
      activity.scheduled_date
    );
    if (!newDate) return;

    const { error } = await supabase
      .from('activities')
      .update({
        scheduled_date: newDate,
        status: activity.status === 'overdue' ? 'rescheduled' : activity.status,
      })
      .eq('id', activity.id);

    if (error) {
      console.error('Error rescheduling:', error);
      return;
    }

    loadData();
  }

  async function handleDelete(activity: Activity) {
    if (!confirm(t.activities?.deleteConfirm || '¿Eliminar esta actividad?')) return;

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activity.id);

    if (error) {
      console.error('Error deleting:', error);
      return;
    }

    loadData();
  }

  async function handleCancel(activity: Activity) {
    const { error } = await supabase
      .from('activities')
      .update({ status: 'cancelled' })
      .eq('id', activity.id);

    if (error) {
      console.error('Error cancelling:', error);
      return;
    }

    loadData();
  }

  // Calendar helpers
  function getCalendarDays() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add padding for days before the first of the month
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }

  function getActivitiesForDate(date: Date): ActivityWithLead[] {
    const dateStr = date.toISOString().split('T')[0];
    return activities.filter(a => a.scheduled_date === dateStr);
  }

  function navigateMonth(direction: number) {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.activities?.title || 'Actividades'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t.activities?.subtitle || 'Gestiona tu agenda de setter'}
          </p>
        </div>
        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          {t.activities?.newActivity || 'Nueva actividad'}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setDateFilter('today')}
          className={`p-4 border-2 transition-colors ${
            dateFilter === 'today'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
          }`}
        >
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{todayCount}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.activities?.todayTasks || 'Hoy'}</p>
        </button>
        <button
          onClick={() => setDateFilter('overdue')}
          className={`p-4 border-2 transition-colors ${
            dateFilter === 'overdue'
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300'
          }`}
        >
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overdueCount}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.activities?.overdueTasks || 'Vencidas'}</p>
        </button>
        <button
          onClick={() => setDateFilter('week')}
          className={`p-4 border-2 transition-colors ${
            dateFilter === 'week'
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300'
          }`}
        >
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {activities.filter(a => {
              const d = new Date(a.scheduled_date);
              const today = new Date();
              const weekEnd = new Date(today);
              weekEnd.setDate(weekEnd.getDate() + 7);
              return d >= today && d <= weekEnd && a.status === 'pending';
            }).length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.activities?.thisWeek || 'Esta semana'}</p>
        </button>
        <button
          onClick={() => { setStatusFilter('completed'); setDateFilter('all'); }}
          className={`p-4 border-2 transition-colors ${
            statusFilter === 'completed'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300'
          }`}
        >
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {activities.filter(a => a.status === 'completed').length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.activities?.completed || 'Completadas'}</p>
        </button>
      </div>

      {/* View Toggle and Filters */}
      <div className="bg-syntalys-blue dark:bg-gray-800 border border-syntalys-blue dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-white/10 dark:bg-gray-700 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-syntalys-blue dark:text-blue-400 shadow-sm'
                  : 'text-white/80 dark:text-gray-400 hover:text-white dark:hover:text-white'
              }`}
            >
              <FaList className="w-4 h-4" />
              <span className="text-sm font-medium">{t.activities?.listView || 'Lista'}</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-600 text-syntalys-blue dark:text-blue-400 shadow-sm'
                  : 'text-white/80 dark:text-gray-400 hover:text-white dark:hover:text-white'
              }`}
            >
              <FaCalendar className="w-4 h-4" />
              <span className="text-sm font-medium">{t.activities?.calendarView || 'Calendario'}</span>
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border transition-colors ${
              showFilters
                ? 'bg-white/20 border-white/40 text-white dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400'
                : 'border-white/20 dark:border-gray-600 text-white dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700'
            }`}
          >
            <FaFilter className="w-4 h-4" />
            {t.common.filter}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-white/20 dark:border-gray-700">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="px-3 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white text-sm"
            >
              <option value="today" className="text-gray-900">{t.activities?.filterToday || 'Hoy'}</option>
              <option value="tomorrow" className="text-gray-900">{t.activities?.filterTomorrow || 'Mañana'}</option>
              <option value="week" className="text-gray-900">{t.activities?.filterWeek || 'Esta semana'}</option>
              <option value="month" className="text-gray-900">{t.activities?.filterMonth || 'Este mes'}</option>
              <option value="overdue" className="text-gray-900">{t.activities?.filterOverdue || 'Vencidas'}</option>
              <option value="all" className="text-gray-900">{t.activities?.filterAll || 'Todas'}</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ActivityType | 'all')}
              className="px-3 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white text-sm"
            >
              <option value="all" className="text-gray-900">{t.activities?.allTypes || 'Todos los tipos'}</option>
              <option value="call" className="text-gray-900">{t.activities?.typeCall || 'Llamada'}</option>
              <option value="email" className="text-gray-900">{t.activities?.typeEmail || 'Email'}</option>
              <option value="meeting" className="text-gray-900">{t.activities?.typeMeeting || 'Reunión'}</option>
              <option value="follow_up" className="text-gray-900">{t.activities?.typeFollowUp || 'Seguimiento'}</option>
              <option value="reminder" className="text-gray-900">{t.activities?.typeReminder || 'Recordatorio'}</option>
              <option value="demo" className="text-gray-900">{t.activities?.typeDemo || 'Demo'}</option>
              <option value="proposal" className="text-gray-900">{t.activities?.typeProposal || 'Propuesta'}</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as ActivityPriority | 'all')}
              className="px-3 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white text-sm"
            >
              <option value="all" className="text-gray-900">{t.activities?.allPriorities || 'Todas las prioridades'}</option>
              <option value="urgent" className="text-gray-900">{t.activities?.priorityUrgent || 'Urgente'}</option>
              <option value="high" className="text-gray-900">{t.activities?.priorityHigh || 'Alta'}</option>
              <option value="medium" className="text-gray-900">{t.activities?.priorityMedium || 'Media'}</option>
              <option value="low" className="text-gray-900">{t.activities?.priorityLow || 'Baja'}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ActivityStatus | 'all')}
              className="px-3 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white text-sm"
            >
              <option value="all" className="text-gray-900">{t.activities?.allStatuses || 'Todos los estados'}</option>
              <option value="pending" className="text-gray-900">{t.activities?.statusPending || 'Pendiente'}</option>
              <option value="completed" className="text-gray-900">{t.activities?.statusCompleted || 'Completada'}</option>
              <option value="overdue" className="text-gray-900">{t.activities?.statusOverdue || 'Vencida'}</option>
              <option value="cancelled" className="text-gray-900">{t.activities?.statusCancelled || 'Cancelada'}</option>
            </select>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value as ServiceInterested | 'all')}
              className="px-3 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white text-sm"
            >
              <option value="all" className="text-gray-900">{t.leads?.allServices || 'Todos los servicios'}</option>
              <option value="call_center" className="text-gray-900">{t.leads?.serviceCallCenter || 'Call Center'}</option>
              <option value="automations" className="text-gray-900">{t.leads?.serviceAutomations || 'Automatizaciones'}</option>
              <option value="chatbot" className="text-gray-900">{t.leads?.serviceChatbot || 'Chatbot'}</option>
              <option value="voicebot" className="text-gray-900">{t.leads?.serviceVoicebot || 'Voicebot'}</option>
              <option value="web_development" className="text-gray-900">{t.leads?.serviceWebDevelopment || 'Desarrollo Web'}</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        /* List View */
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FaCalendarAlt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {t.activities?.noActivities || 'No hay actividades programadas'}
              </p>
              <button
                onClick={() => openCreateModal()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {t.activities?.createFirst || 'Crear primera actividad'}
              </button>
            </div>
          ) : (
            filteredActivities.map(activity => (
              <div
                key={activity.id}
                className={`bg-white dark:bg-gray-800 border-l-4 border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow ${
                  activity.status === 'overdue'
                    ? 'border-l-red-500'
                    : activity.status === 'completed'
                    ? 'border-l-green-500'
                    : activity.priority === 'urgent'
                    ? 'border-l-orange-500'
                    : 'border-l-blue-500'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left side */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Icon */}
                    <div className={`p-3 flex-shrink-0 ${getActivityTypeColor(activity.activity_type)}`}>
                      {getActivityTypeIcon(activity.activity_type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{activity.title}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(activity.status)}`}>
                          {getStatusLabel(activity.status)}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(activity.priority)}`}>
                          {getPriorityLabel(activity.priority)}
                        </span>
                        {activity.auto_created && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            Auto
                          </span>
                        )}
                      </div>

                      {/* Lead/Company Info */}
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {activity.lead && (
                          <Link
                            href={`/dashboard/leads?search=${encodeURIComponent(activity.lead.name)}`}
                            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <FaUser className="w-3 h-3" />
                            {activity.lead.name}
                          </Link>
                        )}
                        {activity.company_name && (
                          <Link
                            href={`/dashboard/companies?search=${encodeURIComponent(activity.company_name)}`}
                            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <FaBuilding className="w-3 h-3" />
                            {activity.company_name}
                          </Link>
                        )}
                        {activity.lead?.service_interested && (
                          <span className="text-purple-600 dark:text-purple-400">
                            {getServiceLabel(activity.lead.service_interested)}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {activity.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {activity.description}
                        </p>
                      )}

                      {/* Date/Time */}
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <FaClock className="w-3 h-3 text-gray-400" />
                        <span className={activity.status === 'overdue' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                          {formatDate(activity.scheduled_date)}
                          {activity.scheduled_time && ` ${formatTime(activity.scheduled_time)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {activity.status === 'pending' || activity.status === 'overdue' ? (
                      <>
                        <button
                          onClick={() => handleComplete(activity)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                          title={t.activities?.markComplete || 'Completar'}
                        >
                          <FaCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReschedule(activity)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          title={t.activities?.reschedule || 'Reprogramar'}
                        >
                          <FaCalendarAlt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(activity)}
                          className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title={t.common.edit}
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancel(activity)}
                          className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                          title={t.activities?.cancel || 'Cancelar'}
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDelete(activity)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title={t.common.delete}
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    )}
                    {activity.lead && (
                      <Link
                        href={`/dashboard/leads?search=${encodeURIComponent(activity.lead.name)}`}
                        className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title={t.activities?.openLead || 'Ver lead'}
                      >
                        <FaExternalLinkAlt className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {getCalendarDays().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="min-h-[120px] bg-gray-50 dark:bg-gray-900/50 border-b border-r border-gray-200 dark:border-gray-700" />;
              }

              const dayActivities = getActivitiesForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={date.toISOString()}
                  className={`min-h-[120px] border-b border-r border-gray-200 dark:border-gray-700 p-1 ${
                    isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 p-1 rounded ${
                    isToday
                      ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayActivities.slice(0, 3).map(activity => (
                      <button
                        key={activity.id}
                        onClick={() => openEditModal(activity)}
                        className={`w-full text-left px-1.5 py-0.5 text-xs rounded truncate ${getActivityTypeColor(activity.activity_type)}`}
                      >
                        {activity.scheduled_time && `${formatTime(activity.scheduled_time)} `}
                        {activity.title}
                      </button>
                    ))}
                    {dayActivities.length > 3 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
                        +{dayActivities.length - 3} más
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div
            className="bg-white dark:bg-gray-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingActivity ? (t.activities?.editActivity || 'Editar actividad') : (t.activities?.newActivity || 'Nueva actividad')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Activity Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.activities?.activityType || 'Tipo de actividad'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['call', 'email', 'meeting', 'follow_up', 'reminder', 'demo', 'proposal', 'other'] as ActivityType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, activity_type: type }))}
                      className={`flex flex-col items-center gap-1 p-2 border-2 transition-colors ${
                        formData.activity_type === type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                      }`}
                    >
                      <span className={getActivityTypeColor(type) + ' p-2'}>
                        {getActivityTypeIcon(type)}
                      </span>
                      <span className="text-xs text-gray-700 dark:text-gray-300">{getActivityTypeLabel(type)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.activities?.activityTitle || 'Título'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder={t.activities?.titlePlaceholder || 'Ej: Llamada de seguimiento'}
                />
              </div>

              {/* Lead Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.activities?.associatedLead || 'Lead asociado'}
                </label>
                <select
                  value={formData.lead_id}
                  onChange={e => {
                    const lead = leads.find(l => l.id === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      lead_id: e.target.value,
                      company_name: lead?.company_name || prev.company_name,
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.activities?.noLead || 'Sin lead asociado'}</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} {lead.company_name ? `(${lead.company_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.activities?.date || 'Fecha'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.scheduled_date}
                    onChange={e => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.activities?.time || 'Hora'}
                  </label>
                  <input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={e => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.activities?.priority || 'Prioridad'}
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as ActivityPriority[]).map(priority => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority }))}
                      className={`flex-1 py-2 px-3 border-2 text-sm font-medium transition-colors ${
                        formData.priority === priority
                          ? 'border-blue-500 ' + getPriorityColor(priority)
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {getPriorityLabel(priority)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.activities?.description || 'Descripción'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder={t.activities?.descriptionPlaceholder || 'Notas adicionales...'}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {editingActivity ? t.common.save : (t.activities?.create || 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Activity Modal */}
      {showCompleteModal && completingActivity && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCompleteModal(false)}>
          <div
            className="bg-white dark:bg-gray-800 shadow-2xl w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t.activities?.completeActivity || 'Completar actividad'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {t.activities?.completingTask || 'Completando'}: <strong>{completingActivity.title}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.activities?.outcome || 'Resultado / Notas'}
                </label>
                <textarea
                  value={outcomeText}
                  onChange={e => setOutcomeText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder={t.activities?.outcomePlaceholder || '¿Qué resultado tuvo? ¿Próximos pasos?'}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={submitComplete}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FaCheck className="w-4 h-4" />
                  {t.activities?.markComplete || 'Completar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
