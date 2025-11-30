'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Project, ProjectWithClient, Client, ProjectType, ProjectStatus, PaymentType } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProyectosPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    client_id: '',
    project_name: '',
    description: '',
    project_type: '' as ProjectType | '',
    status: 'active' as ProjectStatus,
    start_date: '',
    end_date: '',
    total_amount: '',
    currency: 'CHF' as 'CHF' | 'EUR' | 'USD',
    payment_type: '' as PaymentType | '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      await Promise.all([loadProjects(), loadClients()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
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

    const projectsWithClients: ProjectWithClient[] = (projectsData || []).map(project => ({
      ...project,
      client: clientsData?.find(c => c.id === project.client_id),
    }));

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
        project_name: formData.project_name,
        description: formData.description || null,
        project_type: formData.project_type || null,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        total_amount: formData.total_amount ? parseFloat(formData.total_amount) : null,
        currency: formData.currency,
        payment_type: formData.payment_type || null,
        notes: formData.notes || null,
      };

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) {
          console.error('Error updating project:', error);
          alert(t.messages.saveError);
          return;
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
      }

      resetForm();
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert(t.messages.saveError);
    }
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
      project_name: project.project_name,
      description: project.description || '',
      project_type: (project.project_type as ProjectType) || '',
      status: project.status,
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      total_amount: project.total_amount ? project.total_amount.toString() : '',
      currency: project.currency,
      payment_type: (project.payment_type as PaymentType) || '',
      notes: project.notes || '',
    });
    setShowModal(true);
  }

  function resetForm() {
    setFormData({
      client_id: '',
      project_name: '',
      description: '',
      project_type: '',
      status: 'active',
      start_date: '',
      end_date: '',
      total_amount: '',
      currency: 'CHF',
      payment_type: '',
      notes: '',
    });
  }

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const pausedProjects = projects.filter(p => p.status === 'paused');
  const totalValueActive = projects
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const totalValuePending = projects
    .filter(p => p.status === 'paused')
    .reduce((sum, p) => sum + (p.total_amount || 0), 0);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">{t.common.loading}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.projects.title}</h1>
          <p className="text-gray-600 mt-2">
            {t.projects.subtitle}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-syntalys-blue text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          + {t.projects.addProject}
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t.projects.totalProjects}</h3>
          <p className="text-3xl font-bold text-syntalys-blue">{projects.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t.projects.active}</h3>
          <p className="text-3xl font-bold text-green-600">{activeProjects.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t.projects.onHold}</h3>
          <p className="text-3xl font-bold text-orange-600">{pausedProjects.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t.projects.completed}</h3>
          <p className="text-3xl font-bold text-gray-600">{completedProjects.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t.projects.activeValue}</h3>
          <p className="text-2xl font-bold text-green-600">{totalValueActive.toFixed(2)} CHF</p>
          <p className="text-xs text-gray-400 mt-1">{t.projects.activeValueSubtitle}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t.projects.pendingIncome}</h3>
          <p className="text-2xl font-bold text-orange-600">{totalValuePending.toFixed(2)} CHF</p>
          <p className="text-xs text-gray-400 mt-1">{t.projects.pendingIncomeSubtitle}</p>
        </div>
      </div>

      {/* Lista de proyectos */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">{t.projects.noProjects}</p>
          <button
            onClick={openAddModal}
            className="bg-syntalys-blue text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t.projects.createFirst}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.projects.projectName}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.projects.client}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.projects.type}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.common.status}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.forms.value}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.forms.dates}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{project.project_name}</div>
                        {project.description && (
                          <div className="text-sm text-gray-500">{project.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{project.client?.company_name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {project.project_type ? getProjectTypeLabel(project.project_type, t) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusLabel(project.status, t)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {project.total_amount ? `${project.total_amount.toFixed(2)} ${project.currency}` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString('es-ES') : 'N/A'}
                      {project.end_date && ` - ${new Date(project.end_date).toLocaleDateString('es-ES')}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openEditModal(project)}
                        className="text-syntalys-blue hover:text-blue-700 mr-3"
                      >
                        {t.common.edit}
                      </button>
                      <button
                        onClick={() => handleDelete(project.id, project.project_name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        {t.common.delete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Agregar/Editar Proyecto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProject ? t.projects.editProject : t.projects.addProject}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.projects.client} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  >
                    <option value="">{t.forms.selectClient}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.company_name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.projects.projectName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                    placeholder={t.forms.projectPlaceholder}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.common.description}</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                    rows={3}
                    placeholder={t.forms.descriptionPlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.projects.type}</label>
                  <select
                    value={formData.project_type}
                    onChange={(e) => setFormData({ ...formData, project_type: e.target.value as ProjectType | '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.common.status}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  >
                    <option value="active">{t.projects.statusActive}</option>
                    <option value="completed">{t.projects.statusCompleted}</option>
                    <option value="paused">{t.projects.statusPaused}</option>
                    <option value="cancelled">{t.projects.statusCancelled}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.projects.startDate}</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.projects.endDate}</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.projects.totalAmount}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.common.currency}</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'CHF' | 'EUR' | 'USD' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  >
                    <option value="CHF">CHF</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.projects.paymentType}</label>
                  <select
                    value={formData.payment_type}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as PaymentType | '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  >
                    <option value="">{t.forms.notSpecified}</option>
                    <option value="one_time">{t.projects.oneTime}</option>
                    <option value="monthly">{t.projects.monthly}</option>
                    <option value="annual">{t.projects.annual}</option>
                    <option value="milestone">{t.projects.milestone}</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.common.notes}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                    rows={2}
                    placeholder={t.forms.notesPlaceholder}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProject(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
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
    </div>
  );
}

function getProjectTypeLabel(type: string, t: any): string {
  const labels: Record<string, string> = {
    web_development: t.projects.webDevelopment,
    app_development: t.projects.appDevelopment,
    maintenance: t.projects.maintenance,
    consulting: t.projects.consulting,
    design: t.projects.design,
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
