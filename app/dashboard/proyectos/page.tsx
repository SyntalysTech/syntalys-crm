'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Project, ProjectWithClient, Client, ProjectType, ProjectStatus, PaymentType, InternalProject, InternalProjectStatus, ProjectMilestone, MilestoneStatus, Currency } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { FaGithub, FaExternalLinkAlt, FaLightbulb, FaCode, FaCheckCircle, FaPause, FaTimes, FaEllipsisV, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

export default function ProyectosPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Syntalys Lab state
  const [internalProjects, setInternalProjects] = useState<InternalProject[]>([]);
  const [showInternalModal, setShowInternalModal] = useState(false);
  const [editingInternalProject, setEditingInternalProject] = useState<InternalProject | null>(null);
  const [activeTab, setActiveTab] = useState<'clients' | 'lab'>('clients');

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; openUp: boolean } | null>(null);
  const [expandedText, setExpandedText] = useState<{ text: string; title: string } | null>(null);

  // Filter and sort state
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetic' | 'amount'>('newest');

  // Milestones state
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);
  const [selectedProjectForMilestones, setSelectedProjectForMilestones] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [milestoneFormData, setMilestoneFormData] = useState({
    name: '',
    description: '',
    amount: '',
    currency: 'CHF' as Currency,
    due_date: '',
    no_due_date: false,
    paid_date: '',
    status: 'pending' as MilestoneStatus,
    paid_amount: '',
  });

  const handleDropdownClick = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    if (openDropdown === id) {
      setOpenDropdown(null);
      setDropdownPosition(null);
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
    }
  };

  const [internalFormData, setInternalFormData] = useState({
    name: '',
    description: '',
    status: 'idea' as InternalProjectStatus,
    project_type: '' as ProjectType | '',
    start_date: '',
    target_date: '',
    repository_url: '',
    demo_url: '',
    notes: '',
  });

  const [formData, setFormData] = useState({
    client_id: '',
    is_company: false,
    company_name: '',
    project_name: '',
    description: '',
    project_type: '' as ProjectType | '',
    custom_project_type: '',
    status: 'active' as ProjectStatus,
    start_date: '',
    end_date: '',
    total_amount: '',
    currency: 'CHF' as 'CHF' | 'EUR' | 'USD',
    payment_type: '' as PaymentType | '',
    has_professional_email: false,
    professional_email: '',
    has_website: false,
    website_url: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      await Promise.all([loadProjects(), loadClients(), loadInternalProjects()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadInternalProjects() {
    const { data, error } = await supabase
      .from('internal_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading internal projects:', error);
      return;
    }

    setInternalProjects(data || []);
  }

  async function loadProjects() {
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('Error loading projects:', projectsError);
      return;
    }

    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*');

    if (clientsError) {
      console.error('Error loading clients for projects:', clientsError);
      return;
    }

    // Load milestones to calculate paid amounts
    const { data: milestonesData } = await supabase
      .from('project_milestones')
      .select('project_id, paid_amount');

    const projectsWithClients: ProjectWithClient[] = (projectsData || []).map(project => {
      const projectMilestones = milestonesData?.filter(m => m.project_id === project.id) || [];
      const totalPaid = projectMilestones.reduce((sum, m) => sum + (m.paid_amount || 0), 0);
      return {
        ...project,
        client: clientsData?.find(c => c.id === project.client_id),
        total_paid: totalPaid,
      };
    });

    setProjects(projectsWithClients);
  }

  async function loadClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading clients:', error);
      return;
    }

    setClients(data || []);
  }

  async function handleSubmit() {
    if (!formData.client_id || !formData.project_name) {
      alert(t.messages.fillRequired);
      return;
    }

    try {
      const projectData = {
        client_id: formData.client_id,
        company_name: formData.is_company ? formData.company_name : '',
        project_name: formData.project_name,
        description: formData.description || null,
        project_type: formData.project_type || null,
        custom_project_type: formData.project_type === 'other' ? formData.custom_project_type || null : null,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        total_amount: formData.total_amount ? parseFloat(formData.total_amount) : null,
        currency: formData.currency,
        payment_type: formData.payment_type || null,
        has_professional_email: formData.has_professional_email,
        professional_email: formData.has_professional_email ? formData.professional_email || null : null,
        has_website: formData.has_website,
        website_url: formData.has_website ? formData.website_url || null : null,
        notes: formData.notes || null,
      };

      if (editingProject) {
        // Verificar si el proyecto pasó de otro estado a "completed"
        const wasCompleted = editingProject.status === 'completed';
        const isNowCompleted = formData.status === 'completed';
        const hasAmount = formData.total_amount && parseFloat(formData.total_amount) > 0;
        const hasPaymentType = !!formData.payment_type;

        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) {
          console.error('Error updating project:', error);
          alert(t.messages.saveError);
          return;
        }

        // Si el proyecto se marcó como completado y tiene monto y tipo de pago, crear ingreso
        if (!wasCompleted && isNowCompleted && hasAmount && hasPaymentType) {
          await createIncomeFromProject(
            formData.client_id,
            formData.project_name,
            parseFloat(formData.total_amount),
            formData.currency,
            formData.payment_type as 'one_time' | 'monthly' | 'annual',
            formData.end_date || new Date().toISOString().split('T')[0]
          );
        }
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);

        if (error) {
          console.error('Error adding project:', error);
          alert(t.messages.saveError);
          return;
        }

        // Si se crea un proyecto ya completado con monto y tipo de pago, crear ingreso
        const isCompleted = formData.status === 'completed';
        const hasAmount = formData.total_amount && parseFloat(formData.total_amount) > 0;
        const hasPaymentType = !!formData.payment_type;

        if (isCompleted && hasAmount && hasPaymentType) {
          await createIncomeFromProject(
            formData.client_id,
            formData.project_name,
            parseFloat(formData.total_amount),
            formData.currency,
            formData.payment_type as 'one_time' | 'monthly' | 'annual',
            formData.end_date || new Date().toISOString().split('T')[0]
          );
        }
      }

      resetForm();
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert(t.messages.saveError);
    }
  }

  async function createIncomeFromProject(
    clientId: string,
    projectName: string,
    amount: number,
    currency: 'CHF' | 'EUR' | 'USD',
    paymentType: 'one_time' | 'monthly' | 'annual',
    paymentDate: string
  ) {
    try {
      const { error } = await supabase
        .from('client_income')
        .insert([{
          client_id: clientId,
          service_name: projectName,
          description: `Ingreso automático generado del proyecto: ${projectName}`,
          amount: amount,
          currency: currency,
          frequency: paymentType,
          category: 'web_development',
          status: 'paid',
          payment_date: paymentDate,
          renewal_date: paymentType === 'one_time' ? null : getNextRenewalDate(paymentDate, paymentType),
        }]);

      if (error) {
        console.error('Error creating income from project:', error);
        // No bloquear el flujo principal si falla la creación del ingreso
      }
    } catch (error) {
      console.error('Error in createIncomeFromProject:', error);
    }
  }

  function getNextRenewalDate(currentDate: string, frequency: 'monthly' | 'annual'): string {
    const date = new Date(currentDate);
    if (frequency === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else if (frequency === 'annual') {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date.toISOString().split('T')[0];
  }

  async function handleDelete(projectId: string, projectName: string) {
    if (!confirm(`${t.messages.deleteConfirm} "${projectName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting project:', error);
        alert(t.messages.deleteError);
        return;
      }

      loadData();
    } catch (error) {
      console.error('Error in handleDelete:', error);
      alert(t.messages.deleteError);
    }
  }

  function openAddModal() {
    resetForm();
    setEditingProject(null);
    setShowModal(true);
  }

  function openEditModal(project: Project) {
    setEditingProject(project);
    setFormData({
      client_id: project.client_id,
      is_company: !!project.company_name,
      company_name: project.company_name,
      project_name: project.project_name,
      description: project.description || '',
      project_type: (project.project_type as ProjectType) || '',
      custom_project_type: project.custom_project_type || '',
      status: project.status,
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      total_amount: project.total_amount ? project.total_amount.toString() : '',
      currency: project.currency,
      payment_type: (project.payment_type as PaymentType) || '',
      has_professional_email: project.has_professional_email || false,
      professional_email: project.professional_email || '',
      has_website: project.has_website || false,
      website_url: project.website_url || '',
      notes: project.notes || '',
    });
    setShowModal(true);
  }

  function resetForm() {
    setFormData({
      client_id: '',
      is_company: false,
      company_name: '',
      project_name: '',
      description: '',
      project_type: '',
      custom_project_type: '',
      status: 'active',
      start_date: '',
      end_date: '',
      total_amount: '',
      currency: 'CHF',
      payment_type: '',
      has_professional_email: false,
      professional_email: '',
      has_website: false,
      website_url: '',
      notes: '',
    });
  }

  // Filter and sort projects
  function getFilteredAndSortedProjects(): ProjectWithClient[] {
    let filtered = [...projects];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Filter by payment status
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(p => {
        const totalAmount = p.total_amount || 0;
        const totalPaid = p.total_paid || 0;
        const isCompleted = p.status === 'completed';
        const isFullyPaid = totalAmount > 0 && totalPaid >= totalAmount;

        if (paymentFilter === 'paid') {
          // Paid = completed OR fully paid via milestones
          return isCompleted || isFullyPaid;
        } else if (paymentFilter === 'unpaid') {
          // Unpaid = not completed AND no payments made
          return !isCompleted && totalPaid === 0;
        } else if (paymentFilter === 'partial') {
          // Partial = not completed AND has some payment but not full
          return !isCompleted && totalPaid > 0 && totalPaid < totalAmount;
        }
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetic':
          return a.project_name.localeCompare(b.project_name);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'amount':
          return (b.total_amount || 0) - (a.total_amount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }

  // Milestone functions
  async function openMilestonesModal(project: Project) {
    setSelectedProjectForMilestones(project);
    await loadMilestones(project.id);
    setShowMilestonesModal(true);
  }

  async function loadMilestones(projectId: string) {
    const { data, error } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error loading milestones:', error);
      return;
    }
    setMilestones(data || []);
  }

  function openAddMilestoneForm() {
    setEditingMilestone(null);
    setMilestoneFormData({
      name: '',
      description: '',
      amount: '',
      currency: selectedProjectForMilestones?.currency || 'CHF',
      due_date: '',
      no_due_date: true,
      paid_date: '',
      status: 'pending',
      paid_amount: '0',
    });
    setShowMilestoneForm(true);
  }

  function openEditMilestoneForm(milestone: ProjectMilestone) {
    setEditingMilestone(milestone);
    setMilestoneFormData({
      name: milestone.name,
      description: milestone.description || '',
      amount: milestone.amount.toString(),
      currency: milestone.currency,
      due_date: milestone.due_date || '',
      no_due_date: !milestone.due_date,
      paid_date: milestone.paid_date || '',
      status: milestone.status,
      paid_amount: milestone.paid_amount.toString(),
    });
    setShowMilestoneForm(true);
  }

  async function handleMilestoneSubmit() {
    if (!milestoneFormData.name || !milestoneFormData.amount || !selectedProjectForMilestones) {
      alert(t.messages.fillRequired);
      return;
    }

    try {
      const milestoneData = {
        project_id: selectedProjectForMilestones.id,
        name: milestoneFormData.name,
        description: milestoneFormData.description || null,
        amount: parseFloat(milestoneFormData.amount),
        currency: milestoneFormData.currency,
        due_date: milestoneFormData.no_due_date ? null : (milestoneFormData.due_date || null),
        paid_date: milestoneFormData.status === 'paid' ? (milestoneFormData.paid_date || new Date().toISOString().split('T')[0]) : null,
        status: milestoneFormData.status,
        paid_amount: milestoneFormData.status === 'paid'
          ? parseFloat(milestoneFormData.amount)
          : (milestoneFormData.paid_amount ? parseFloat(milestoneFormData.paid_amount) : 0),
      };

      if (editingMilestone) {
        const { error } = await supabase
          .from('project_milestones')
          .update(milestoneData)
          .eq('id', editingMilestone.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('project_milestones')
          .insert([milestoneData]);

        if (error) throw error;
      }

      setShowMilestoneForm(false);
      await loadMilestones(selectedProjectForMilestones.id);
    } catch (error) {
      console.error('Error saving milestone:', error);
      alert(t.messages.saveError);
    }
  }

  async function handleDeleteMilestone(milestoneId: string) {
    if (!confirm(t.messages.deleteConfirm + '?')) return;

    try {
      const { error } = await supabase
        .from('project_milestones')
        .delete()
        .eq('id', milestoneId);

      if (error) throw error;

      if (selectedProjectForMilestones) {
        await loadMilestones(selectedProjectForMilestones.id);
      }
    } catch (error) {
      console.error('Error deleting milestone:', error);
      alert(t.messages.deleteError);
    }
  }

  function getMilestoneStatusColor(status: MilestoneStatus): string {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'partial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  // Syntalys Lab CRUD functions
  async function handleInternalSubmit() {
    if (!internalFormData.name) {
      alert(t.messages.fillRequired);
      return;
    }

    try {
      const projectData = {
        name: internalFormData.name,
        description: internalFormData.description || null,
        status: internalFormData.status,
        project_type: internalFormData.project_type || null,
        start_date: internalFormData.start_date || null,
        target_date: internalFormData.target_date || null,
        repository_url: internalFormData.repository_url || null,
        demo_url: internalFormData.demo_url || null,
        notes: internalFormData.notes || null,
      };

      if (editingInternalProject) {
        const { error } = await supabase
          .from('internal_projects')
          .update(projectData)
          .eq('id', editingInternalProject.id);

        if (error) {
          console.error('Error updating internal project:', error);
          alert(t.messages.saveError);
          return;
        }
      } else {
        const { error } = await supabase
          .from('internal_projects')
          .insert([projectData]);

        if (error) {
          console.error('Error adding internal project:', error);
          alert(t.messages.saveError);
          return;
        }
      }

      resetInternalForm();
      setShowInternalModal(false);
      loadInternalProjects();
    } catch (error) {
      console.error('Error in handleInternalSubmit:', error);
      alert(t.messages.saveError);
    }
  }

  async function handleDeleteInternal(projectId: string, projectName: string) {
    if (!confirm(`${t.messages.deleteConfirm} "${projectName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('internal_projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting internal project:', error);
        alert(t.messages.deleteError);
        return;
      }

      loadInternalProjects();
    } catch (error) {
      console.error('Error in handleDeleteInternal:', error);
      alert(t.messages.deleteError);
    }
  }

  function openAddInternalModal() {
    resetInternalForm();
    setEditingInternalProject(null);
    setShowInternalModal(true);
  }

  function openEditInternalModal(project: InternalProject) {
    setEditingInternalProject(project);
    setInternalFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      project_type: (project.project_type as ProjectType) || '',
      start_date: project.start_date || '',
      target_date: project.target_date || '',
      repository_url: project.repository_url || '',
      demo_url: project.demo_url || '',
      notes: project.notes || '',
    });
    setShowInternalModal(true);
  }

  function resetInternalForm() {
    setInternalFormData({
      name: '',
      description: '',
      status: 'idea',
      project_type: '',
      start_date: '',
      target_date: '',
      repository_url: '',
      demo_url: '',
      notes: '',
    });
  }

  function getInternalStatusIcon(status: InternalProjectStatus) {
    switch (status) {
      case 'idea':
        return <FaLightbulb className="w-4 h-4" />;
      case 'in_progress':
        return <FaCode className="w-4 h-4" />;
      case 'completed':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'on_hold':
        return <FaPause className="w-4 h-4" />;
      case 'cancelled':
        return <FaTimes className="w-4 h-4" />;
      default:
        return null;
    }
  }

  function getInternalStatusLabel(status: InternalProjectStatus): string {
    const labels: Record<InternalProjectStatus, string> = {
      idea: t.projects.statusIdea,
      in_progress: t.projects.statusInProgress,
      completed: t.projects.statusCompleted,
      on_hold: t.projects.statusOnHold,
      cancelled: t.projects.statusCancelled,
    };
    return labels[status] || status;
  }

  function getInternalStatusColor(status: InternalProjectStatus): string {
    switch (status) {
      case 'idea':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.projects.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t.projects.subtitle}
          </p>
        </div>
        {activeTab === 'clients' ? (
          <button
            onClick={openAddModal}
            className="bg-syntalys-blue text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            + {t.projects.addProject}
          </button>
        ) : (
          <button
            onClick={openAddInternalModal}
            className="bg-syntalys-blue text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            + {t.projects.addInternalProject}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('clients')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'clients'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {t.projects.clientProjects}
        </button>
        <button
          onClick={() => setActiveTab('lab')}
          className={`pb-3 px-1 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'lab'
              ? 'border-b-2 border-blue-600 dark:border-blue-400'
              : ''
          }`}
        >
          <Image
            src="/logos/logo-syntalys-lab-horizontal-blue.png"
            alt="Syntalys Lab"
            width={140}
            height={35}
            className={`h-7 w-auto transition-all ${
              activeTab === 'lab'
                ? 'dark:brightness-0 dark:invert opacity-100'
                : 'opacity-60 hover:opacity-80 dark:brightness-0 dark:invert dark:opacity-50 dark:hover:opacity-70'
            }`}
          />
        </button>
      </div>

      {/* Client Projects Tab */}
      {activeTab === 'clients' && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.common.status}:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | ProjectStatus)}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue"
                >
                  <option value="all">{t.projects.allProjects}</option>
                  <option value="active">{t.projects.statusActive}</option>
                  <option value="completed">{t.projects.statusCompleted}</option>
                  <option value="paused">{t.projects.statusPaused}</option>
                  <option value="cancelled">{t.projects.statusCancelled}</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.projects.filterBy}:</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'paid' | 'unpaid' | 'partial')}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue"
                >
                  <option value="all">{t.projects.allProjects}</option>
                  <option value="paid">{t.projects.filterPaid}</option>
                  <option value="unpaid">{t.projects.filterUnpaid}</option>
                  <option value="partial">{t.projects.filterPartial}</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.projects.sortBy}:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'alphabetic' | 'amount')}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue"
                >
                  <option value="newest">{t.projects.sortNewest}</option>
                  <option value="oldest">{t.projects.sortOldest}</option>
                  <option value="alphabetic">{t.projects.sortAlphabetic}</option>
                  <option value="amount">{t.projects.sortAmount}</option>
                </select>
              </div>
            </div>
          </div>

          {projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t.projects.noProjects}</p>
          <button
            onClick={openAddModal}
            className="bg-syntalys-blue text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t.projects.createFirst}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t.projects.projectName}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t.projects.client}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t.forms.companyName}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t.projects.type}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t.common.status}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t.forms.value}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t.forms.dates}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {getFilteredAndSortedProjects().map((project, index) => (
                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{project.project_name}</div>
                        {project.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {project.description.length > 50 ? (
                              <span>
                                {project.description.substring(0, 50)}...
                                <button
                                  onClick={() => setExpandedText({ text: project.description!, title: project.project_name })}
                                  className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {t.common.seeMore}
                                </button>
                              </span>
                            ) : project.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">{project.client?.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {project.company_name || t.projects.individual}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {project.project_type ? getProjectTypeLabel(project.project_type, t, project.custom_project_type) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        project.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {getStatusLabel(project.status, t)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.total_amount ? (
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold ${
                            project.status === 'completed' || (project.total_paid || 0) >= project.total_amount
                              ? 'text-green-600 dark:text-green-400'
                              : (project.total_paid || 0) > 0
                                ? 'text-orange-500 dark:text-orange-400'
                                : 'text-gray-900 dark:text-white'
                          }`}>
                            {formatCurrency(project.total_amount, project.currency)} {project.currency}
                          </span>
                          {project.payment_type === 'milestone' && (project.total_paid || 0) > 0 && (project.total_paid || 0) < project.total_amount && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({formatCurrency(project.total_paid || 0, project.currency)} {t.projects.milestonePaid.toLowerCase()})
                            </span>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString('es-ES') : 'N/A'}
                      {project.end_date && ` - ${new Date(project.end_date).toLocaleDateString('es-ES')}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => handleDropdownClick(e, project.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <FaEllipsisV className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          )}
        </>
      )}

      {/* Syntalys Lab Tab */}
      {activeTab === 'lab' && (
        <>
          {internalProjects.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <FaLightbulb className="w-16 h-16 mx-auto mb-4 text-blue-300" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t.projects.noInternalProjects}</p>
              <button
                onClick={openAddInternalModal}
                className="bg-syntalys-blue text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {t.projects.createFirstInternal}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internalProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{project.name}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${getInternalStatusColor(project.status)}`}>
                        {getInternalStatusIcon(project.status)}
                        {getInternalStatusLabel(project.status)}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    {project.project_type && (
                      <div className="mb-4">
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                          {getProjectTypeLabel(project.project_type, t)}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.repository_url && (
                        <a
                          href={project.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <FaGithub className="w-4 h-4" />
                          <span>Repo</span>
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <FaExternalLinkAlt className="w-3 h-3" />
                          <span>Demo</span>
                        </a>
                      )}
                    </div>

                    {(project.start_date || project.target_date) && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        {project.start_date && (
                          <span>{t.projects.startDate}: {new Date(project.start_date).toLocaleDateString('es-ES')}</span>
                        )}
                        {project.start_date && project.target_date && <span className="mx-2">•</span>}
                        {project.target_date && (
                          <span>{t.projects.targetDate}: {new Date(project.target_date).toLocaleDateString('es-ES')}</span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => openEditInternalModal(project)}
                        className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                      >
                        {t.common.edit}
                      </button>
                      <button
                        onClick={() => handleDeleteInternal(project.id, project.name)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        {t.common.delete}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal Agregar/Editar Proyecto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingProject ? t.projects.editProject : t.projects.addProject}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.projects.client} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t.forms.selectClient}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.projects.clientType}
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="clientType"
                        checked={!formData.is_company}
                        onChange={() => setFormData({ ...formData, is_company: false, company_name: '' })}
                        className="w-4 h-4 text-syntalys-blue border-gray-300 focus:ring-syntalys-blue"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{t.projects.individual}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="clientType"
                        checked={formData.is_company}
                        onChange={() => setFormData({ ...formData, is_company: true })}
                        className="w-4 h-4 text-syntalys-blue border-gray-300 focus:ring-syntalys-blue"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{t.projects.company}</span>
                    </label>
                  </div>
                </div>

                {formData.is_company && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.forms.companyName}
                    </label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t.clients.companyName}
                    />
                  </div>
                )}

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.projects.projectName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t.forms.projectPlaceholder}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.description}</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder={t.forms.descriptionPlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.projects.type}</label>
                  <select
                    value={formData.project_type}
                    onChange={(e) => setFormData({ ...formData, project_type: e.target.value as ProjectType | '' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t.forms.notSpecified}</option>
                    <option value="web_development">{t.projects.webDevelopment}</option>
                    <option value="app_development">{t.projects.appDevelopment}</option>
                    <option value="game_development">{t.projects.gameDevelopment}</option>
                    <option value="ecommerce">{t.projects.ecommerce}</option>
                    <option value="maintenance">{t.projects.maintenance}</option>
                    <option value="consulting">{t.projects.consulting}</option>
                    <option value="design">{t.projects.design}</option>
                    <option value="marketing">{t.projects.marketing}</option>
                    <option value="seo">{t.projects.seo}</option>
                    <option value="hosting">{t.projects.hosting}</option>
                    <option value="other">{t.projects.other}</option>
                  </select>
                  {formData.project_type === 'other' && (
                    <input
                      type="text"
                      value={formData.custom_project_type}
                      onChange={(e) => setFormData({ ...formData, custom_project_type: e.target.value })}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t.projects.customType}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.status}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="active">{t.projects.statusActive}</option>
                    <option value="completed">{t.projects.statusCompleted}</option>
                    <option value="paused">{t.projects.statusPaused}</option>
                    <option value="cancelled">{t.projects.statusCancelled}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.projects.startDate}</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.projects.endDate}</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.projects.totalAmount}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.currency}</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'CHF' | 'EUR' | 'USD' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="CHF">CHF</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.projects.paymentType}</label>
                  <select
                    value={formData.payment_type}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as PaymentType | '' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t.forms.notSpecified}</option>
                    <option value="one_time">{t.projects.oneTime}</option>
                    <option value="monthly">{t.projects.monthly}</option>
                    <option value="annual">{t.projects.annual}</option>
                    <option value="milestone">{t.projects.milestone}</option>
                  </select>
                </div>

                {/* Email Profesional */}
                <div className="col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="has_professional_email"
                      checked={formData.has_professional_email}
                      onChange={(e) => setFormData({ ...formData, has_professional_email: e.target.checked })}
                      className="w-4 h-4 text-syntalys-blue border-gray-300 rounded focus:ring-syntalys-blue"
                    />
                    <label htmlFor="has_professional_email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t.projects.hasProfessionalEmail}
                    </label>
                  </div>
                  {formData.has_professional_email && (
                    <input
                      type="email"
                      value={formData.professional_email}
                      onChange={(e) => setFormData({ ...formData, professional_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t.projects.professionalEmail}
                    />
                  )}
                </div>

                {/* Página Web */}
                <div className="col-span-2">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="has_website"
                      checked={formData.has_website}
                      onChange={(e) => setFormData({ ...formData, has_website: e.target.checked })}
                      className="w-4 h-4 text-syntalys-blue border-gray-300 rounded focus:ring-syntalys-blue"
                    />
                    <label htmlFor="has_website" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t.projects.hasWebsite}
                    </label>
                  </div>
                  {formData.has_website && (
                    <input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://..."
                    />
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.notes}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    placeholder={t.forms.notesPlaceholder}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProject(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.client_id || !formData.project_name}
                className="px-4 py-2 bg-syntalys-blue text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {editingProject ? t.common.saveChanges : t.projects.addProject}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar/Editar Proyecto Interno */}
      {showInternalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-syntalys-blue to-blue-700">
              <div className="flex items-center gap-3">
                <Image
                  src="/logos/logo-syntalys-lab-horizontal-blue.png"
                  alt="Syntalys Lab"
                  width={120}
                  height={30}
                  className="h-7 w-auto brightness-0 invert"
                />
                <h2 className="text-xl font-bold text-white">
                  {editingInternalProject ? t.projects.editInternalProject : t.projects.addInternalProject}
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.projects.projectName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={internalFormData.name}
                    onChange={(e) => setInternalFormData({ ...internalFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t.forms.internalProjectPlaceholder}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.description}</label>
                  <textarea
                    value={internalFormData.description}
                    onChange={(e) => setInternalFormData({ ...internalFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder={t.forms.descriptionPlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.status}</label>
                  <select
                    value={internalFormData.status}
                    onChange={(e) => setInternalFormData({ ...internalFormData, status: e.target.value as InternalProjectStatus })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="idea">{t.projects.statusIdea}</option>
                    <option value="in_progress">{t.projects.statusInProgress}</option>
                    <option value="completed">{t.projects.statusCompleted}</option>
                    <option value="on_hold">{t.projects.statusOnHold}</option>
                    <option value="cancelled">{t.projects.statusCancelled}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.projects.type}</label>
                  <select
                    value={internalFormData.project_type}
                    onChange={(e) => setInternalFormData({ ...internalFormData, project_type: e.target.value as ProjectType | '' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t.forms.notSpecified}</option>
                    <option value="web_development">{t.projects.webDevelopment}</option>
                    <option value="app_development">{t.projects.appDevelopment}</option>
                    <option value="maintenance">{t.projects.maintenance}</option>
                    <option value="consulting">{t.projects.consulting}</option>
                    <option value="design">{t.projects.design}</option>
                    <option value="hosting">{t.projects.hosting}</option>
                    <option value="other">{t.projects.other}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.projects.startDate}</label>
                  <input
                    type="date"
                    value={internalFormData.start_date}
                    onChange={(e) => setInternalFormData({ ...internalFormData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.projects.targetDate}</label>
                  <input
                    type="date"
                    value={internalFormData.target_date}
                    onChange={(e) => setInternalFormData({ ...internalFormData, target_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.projects.repositoryUrl}</label>
                  <input
                    type="url"
                    value={internalFormData.repository_url}
                    onChange={(e) => setInternalFormData({ ...internalFormData, repository_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.projects.demoUrl}</label>
                  <input
                    type="url"
                    value={internalFormData.demo_url}
                    onChange={(e) => setInternalFormData({ ...internalFormData, demo_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://demo.syntalys.ch/..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.common.notes}</label>
                  <textarea
                    value={internalFormData.notes}
                    onChange={(e) => setInternalFormData({ ...internalFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    placeholder={t.forms.notesPlaceholder}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowInternalModal(false);
                  setEditingInternalProject(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleInternalSubmit}
                disabled={!internalFormData.name}
                className="px-4 py-2 bg-syntalys-blue text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {editingInternalProject ? t.common.saveChanges : t.projects.addInternalProject}
              </button>
            </div>
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

      {/* Modal de Hitos/Milestones */}
      {showMilestonesModal && selectedProjectForMilestones && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.projects.milestones}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{selectedProjectForMilestones.project_name}</p>
              </div>
              <button
                onClick={() => {
                  setShowMilestonesModal(false);
                  setSelectedProjectForMilestones(null);
                  setShowMilestoneForm(false);
                  loadProjects(); // Reload to update colors in real-time
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Summary - using project total, not milestones sum */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.projects.totalAmount}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedProjectForMilestones.total_amount || 0, selectedProjectForMilestones.currency)} {selectedProjectForMilestones.currency}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-sm text-green-600 dark:text-green-400">{t.projects.milestonePaid}</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(milestones.reduce((sum, m) => sum + m.paid_amount, 0), selectedProjectForMilestones.currency)} {selectedProjectForMilestones.currency}
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">{t.projects.milestonePending}</p>
                  <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                    {formatCurrency((selectedProjectForMilestones.total_amount || 0) - milestones.reduce((sum, m) => sum + m.paid_amount, 0), selectedProjectForMilestones.currency)} {selectedProjectForMilestones.currency}
                  </p>
                </div>
              </div>

              {/* Add milestone button */}
              {!showMilestoneForm && (
                <button
                  onClick={openAddMilestoneForm}
                  className="mb-4 flex items-center gap-2 text-syntalys-blue hover:text-blue-700 font-medium"
                >
                  <FaPlus className="w-4 h-4" />
                  {t.projects.addMilestone}
                </button>
              )}

              {/* Milestone Form */}
              {showMilestoneForm && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {editingMilestone ? t.common.edit : t.projects.addMilestone}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t.projects.milestoneName} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={milestoneFormData.name}
                        onChange={(e) => setMilestoneFormData({ ...milestoneFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder={t.projects.milestoneName}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.common.description}</label>
                      <textarea
                        value={milestoneFormData.description}
                        onChange={(e) => setMilestoneFormData({ ...milestoneFormData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t.common.amount} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={milestoneFormData.amount}
                        onChange={(e) => setMilestoneFormData({ ...milestoneFormData, amount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.common.currency}</label>
                      <select
                        value={milestoneFormData.currency}
                        onChange={(e) => setMilestoneFormData({ ...milestoneFormData, currency: e.target.value as Currency })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="CHF">CHF</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.projects.milestoneDueDate}</label>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          id="no_due_date"
                          checked={milestoneFormData.no_due_date}
                          onChange={(e) => setMilestoneFormData({ ...milestoneFormData, no_due_date: e.target.checked, due_date: e.target.checked ? '' : milestoneFormData.due_date })}
                          className="w-4 h-4 text-syntalys-blue border-gray-300 rounded focus:ring-syntalys-blue"
                        />
                        <label htmlFor="no_due_date" className="text-sm text-gray-600 dark:text-gray-400">{t.projects.noDueDate}</label>
                      </div>
                      {!milestoneFormData.no_due_date && (
                        <input
                          type="date"
                          value={milestoneFormData.due_date}
                          onChange={(e) => setMilestoneFormData({ ...milestoneFormData, due_date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.common.status}</label>
                      <select
                        value={milestoneFormData.status}
                        onChange={(e) => setMilestoneFormData({ ...milestoneFormData, status: e.target.value as MilestoneStatus })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="pending">{t.projects.milestonePending}</option>
                        <option value="partial">{t.projects.milestonePartial}</option>
                        <option value="paid">{t.projects.milestonePaid}</option>
                      </select>
                    </div>
                    {milestoneFormData.status === 'partial' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.projects.paidAmount}</label>
                        <input
                          type="number"
                          step="0.01"
                          value={milestoneFormData.paid_amount}
                          onChange={(e) => setMilestoneFormData({ ...milestoneFormData, paid_amount: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                    {(milestoneFormData.status === 'paid' || milestoneFormData.status === 'partial') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.projects.milestonePaidDate}</label>
                        <input
                          type="date"
                          value={milestoneFormData.paid_date}
                          onChange={(e) => setMilestoneFormData({ ...milestoneFormData, paid_date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => {
                        setShowMilestoneForm(false);
                        setEditingMilestone(null);
                      }}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      {t.common.cancel}
                    </button>
                    <button
                      onClick={handleMilestoneSubmit}
                      disabled={!milestoneFormData.name || !milestoneFormData.amount}
                      className="px-4 py-2 bg-syntalys-blue text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {editingMilestone ? t.common.saveChanges : t.projects.addMilestone}
                    </button>
                  </div>
                </div>
              )}

              {/* Milestones list */}
              {milestones.length === 0 && !showMilestoneForm ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">{t.projects.noMilestones}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{milestone.name}</h4>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getMilestoneStatusColor(milestone.status)}`}>
                            {milestone.status === 'paid' && t.projects.milestonePaid}
                            {milestone.status === 'pending' && t.projects.milestonePending}
                            {milestone.status === 'partial' && t.projects.milestonePartial}
                          </span>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{milestone.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(milestone.amount, milestone.currency)} {milestone.currency}
                          </span>
                          {milestone.status === 'partial' && (
                            <span className="text-green-600 dark:text-green-400">
                              ({t.projects.milestonePaid}: {formatCurrency(milestone.paid_amount, milestone.currency)} {milestone.currency})
                            </span>
                          )}
                          {milestone.due_date && (
                            <span className="text-gray-500 dark:text-gray-400">
                              {t.projects.milestoneDueDate}: {new Date(milestone.due_date).toLocaleDateString('es-ES')}
                            </span>
                          )}
                          {milestone.paid_date && (
                            <span className="text-green-600 dark:text-green-400">
                              {t.projects.milestonePaidDate}: {new Date(milestone.paid_date).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => openEditMilestoneForm(milestone)}
                          className="p-2 text-gray-500 hover:text-syntalys-blue hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMilestone(milestone.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowMilestonesModal(false);
                  setSelectedProjectForMilestones(null);
                  setShowMilestoneForm(false);
                  loadProjects(); // Reload to update colors in real-time
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown fijo para proyectos */}
      {openDropdown && dropdownPosition && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpenDropdown(null); setDropdownPosition(null); }} />
          <div
            className="fixed w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
            style={{
              top: dropdownPosition.openUp ? 'auto' : dropdownPosition.top,
              bottom: dropdownPosition.openUp ? window.innerHeight - dropdownPosition.top : 'auto',
              left: dropdownPosition.left
            }}
          >
            <button
              onClick={() => {
                const project = projects.find(p => p.id === openDropdown);
                if (project) openEditModal(project);
                setOpenDropdown(null);
                setDropdownPosition(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
            >
              {t.common.edit}
            </button>
            <button
              onClick={() => {
                const project = projects.find(p => p.id === openDropdown);
                if (project) openMilestonesModal(project);
                setOpenDropdown(null);
                setDropdownPosition(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {t.projects.milestones}
            </button>
            <button
              onClick={() => {
                const project = projects.find(p => p.id === openDropdown);
                if (project) handleDelete(project.id, project.project_name);
                setOpenDropdown(null);
                setDropdownPosition(null);
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

function getProjectTypeLabel(type: string, t: any, customType?: string | null): string {
  if (type === 'other' && customType) {
    return customType;
  }
  const labels: Record<string, string> = {
    web_development: t.projects.webDevelopment,
    app_development: t.projects.appDevelopment,
    game_development: t.projects.gameDevelopment,
    ecommerce: t.projects.ecommerce,
    maintenance: t.projects.maintenance,
    consulting: t.projects.consulting,
    design: t.projects.design,
    marketing: t.projects.marketing,
    seo: t.projects.seo,
    hosting: t.projects.hosting,
    other: t.projects.other,
  };
  return labels[type] || type;
}

function getStatusLabel(status: string, t: any): string {
  const labels: Record<string, string> = {
    active: t.projects.statusActive,
    completed: t.projects.statusCompleted,
    paused: t.projects.statusPaused,
    cancelled: t.projects.statusCancelled,
  };
  return labels[status] || status;
}

function formatCurrency(amount: number, currency: string): string {
  // CHF uses Swiss format: 1'234.56
  // EUR uses European format: 1.234,56
  // USD uses US format: 1,234.56
  const locales: Record<string, string> = {
    CHF: 'de-CH',
    EUR: 'de-DE',
    USD: 'en-US',
  };
  const locale = locales[currency] || 'de-CH';
  return amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
