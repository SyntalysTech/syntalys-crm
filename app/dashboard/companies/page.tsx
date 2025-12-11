'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Lead, LeadActivity, LeadStatus, PipelineStage } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { FaBuilding, FaPhone, FaWhatsapp, FaEnvelope, FaGlobe, FaSearch, FaFilter, FaTimes, FaChevronRight, FaCalendarAlt, FaFire, FaSnowflake, FaSun, FaStickyNote, FaUser, FaExternalLinkAlt } from 'react-icons/fa';

// Countries data
const COUNTRIES_DATA: Record<string, { es: string; fr: string; flag: string }> = {
  CH: { es: 'Suiza', fr: 'Suisse', flag: '🇨🇭' },
  ES: { es: 'España', fr: 'Espagne', flag: '🇪🇸' },
  FR: { es: 'Francia', fr: 'France', flag: '🇫🇷' },
  DE: { es: 'Alemania', fr: 'Allemagne', flag: '🇩🇪' },
  IT: { es: 'Italia', fr: 'Italie', flag: '🇮🇹' },
  PT: { es: 'Portugal', fr: 'Portugal', flag: '🇵🇹' },
  UK: { es: 'Reino Unido', fr: 'Royaume-Uni', flag: '🇬🇧' },
  US: { es: 'Estados Unidos', fr: 'États-Unis', flag: '🇺🇸' },
  MX: { es: 'México', fr: 'Mexique', flag: '🇲🇽' },
  AR: { es: 'Argentina', fr: 'Argentine', flag: '🇦🇷' },
  CO: { es: 'Colombia', fr: 'Colombie', flag: '🇨🇴' },
  CL: { es: 'Chile', fr: 'Chili', flag: '🇨🇱' },
  PE: { es: 'Perú', fr: 'Pérou', flag: '🇵🇪' },
  BR: { es: 'Brasil', fr: 'Brésil', flag: '🇧🇷' },
};

interface Company {
  name: string;
  leads: Lead[];
  totalValue: number;
  activeLeads: number;
  lastActivity: string | null;
  country: string | null;
  mainContact: Lead | null;
  generalStatus: string;
  notes: string;
}

interface CompanyNote {
  id: string;
  company_name: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export default function CompaniesPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Record<string, LeadActivity[]>>({});
  const [companyNotes, setCompanyNotes] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // Load leads
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .order('updated_at', { ascending: false });

    if (leadsError) {
      console.error('Error loading leads:', leadsError);
    } else {
      setLeads(leadsData || []);

      // Load activities for all leads
      const leadIds = (leadsData || []).map(l => l.id);
      if (leadIds.length > 0) {
        const { data: activitiesData } = await supabase
          .from('lead_activities')
          .select('*')
          .in('lead_id', leadIds)
          .order('created_at', { ascending: false });

        if (activitiesData) {
          const activitiesByLead: Record<string, LeadActivity[]> = {};
          activitiesData.forEach(activity => {
            if (!activitiesByLead[activity.lead_id]) {
              activitiesByLead[activity.lead_id] = [];
            }
            activitiesByLead[activity.lead_id].push(activity);
          });
          setActivities(activitiesByLead);
        }
      }
    }

    // Load company notes
    const { data: notesData } = await supabase
      .from('company_notes')
      .select('*');

    if (notesData) {
      const notesMap: Record<string, string> = {};
      notesData.forEach((note: CompanyNote) => {
        notesMap[note.company_name] = note.note;
      });
      setCompanyNotes(notesMap);
    }

    setLoading(false);
  }

  // Group leads by company
  const companies = useMemo(() => {
    const companyMap = new Map<string, Company>();

    leads.forEach(lead => {
      const companyName = lead.company_name || lead.name;

      if (!companyMap.has(companyName)) {
        companyMap.set(companyName, {
          name: companyName,
          leads: [],
          totalValue: 0,
          activeLeads: 0,
          lastActivity: null,
          country: null,
          mainContact: null,
          generalStatus: '',
          notes: companyNotes[companyName] || '',
        });
      }

      const company = companyMap.get(companyName)!;
      company.leads.push(lead);
      company.totalValue += lead.estimated_value || 0;

      // Count active leads (pipeline_stage not won or lost)
      if (!['won', 'lost'].includes(lead.pipeline_stage || 'none')) {
        company.activeLeads++;
      }

      // Get country from first lead with country
      if (!company.country && lead.country) {
        company.country = lead.country;
      }

      // Set main contact as the lead with most recent activity
      if (!company.mainContact || (lead.updated_at > company.mainContact.updated_at)) {
        company.mainContact = lead;
      }

      // Track last activity
      if (!company.lastActivity || lead.updated_at > company.lastActivity) {
        company.lastActivity = lead.updated_at;
      }
    });

    // Calculate general status for each company
    companyMap.forEach(company => {
      company.generalStatus = calculateGeneralStatus(company.leads);
    });

    return Array.from(companyMap.values()).sort((a, b) => {
      // Sort by last activity, most recent first
      if (a.lastActivity && b.lastActivity) {
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      }
      return 0;
    });
  }, [leads, companyNotes]);

  function calculateGeneralStatus(companyLeads: Lead[]): string {
    // Check pipeline stages for company status
    const pipelineStages = companyLeads.map(l => l.pipeline_stage || 'none');
    const activePipeline = pipelineStages.filter(s => !['won', 'lost'].includes(s));

    // If all leads are won or lost
    if (activePipeline.length === 0) {
      return 'closed';
    }

    // Check for active pipeline stages (ordered by priority)
    if (pipelineStages.includes('closing')) {
      return 'closing';
    }
    if (pipelineStages.includes('negotiation')) {
      return 'negotiation';
    }
    if (pipelineStages.includes('demo')) {
      return 'demo';
    }
    if (pipelineStages.includes('proposal')) {
      return 'proposal';
    }

    // Check lead statuses
    const statuses = companyLeads.map(l => l.status);
    if (statuses.includes('qualified')) {
      return 'qualified';
    }
    if (statuses.every(s => ['new', 'contacted'].includes(s))) {
      return 'initial';
    }
    return 'mixed';
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'closing': return t.leads.stageClosing;
      case 'negotiation': return t.leads.stageNegotiation;
      case 'demo': return t.leads.stageDemo;
      case 'proposal': return t.leads.stageProposal;
      case 'qualified': return t.leads.statusQualified;
      case 'initial': return t.companies.statusInitialContact;
      case 'closed': return t.companies.statusClosed;
      default: return t.companies.statusMixed;
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'closing': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'negotiation': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'demo': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400';
      case 'proposal': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'qualified': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'initial': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  }

  function getLeadStatusLabel(status: LeadStatus): string {
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

  function getLeadStatusColor(status: LeadStatus): string {
    const colors: Record<LeadStatus, string> = {
      new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      contacted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      interested: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      qualified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      not_qualified: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      dormant: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colors[status];
  }

  function getPipelineStageLabel(stage: PipelineStage): string {
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

  function getPipelineStageColor(stage: PipelineStage): string {
    const colors: Record<PipelineStage, string> = {
      none: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      proposal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      demo: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      negotiation: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      closing: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      won: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[stage];
  }

  function getTemperatureIcon(temp: string) {
    switch (temp) {
      case 'cold': return <FaSnowflake className="text-blue-500" title={t.leads.tempCold} />;
      case 'warm': return <FaSun className="text-yellow-500" title={t.leads.tempWarm} />;
      case 'hot': return <FaFire className="text-red-500" title={t.leads.tempHot} />;
      default: return null;
    }
  }

  function getCountryName(code: string | null): string {
    if (!code) return '-';
    const country = COUNTRIES_DATA[code];
    if (!country) return code;
    return `${country.flag} ${language === 'fr' ? country.fr : country.es}`;
  }

  // Filter companies
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.leads.some(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCountry = countryFilter === 'all' || company.country === countryFilter;
    const matchesStatus = statusFilter === 'all' || company.generalStatus === statusFilter;
    return matchesSearch && matchesCountry && matchesStatus;
  });

  // Get unique countries
  const uniqueCountries = useMemo(() => {
    const countriesSet = new Set<string>();
    companies.forEach(c => {
      if (c.country) countriesSet.add(c.country);
    });
    return Array.from(countriesSet);
  }, [companies]);

  // Get company activities
  function getCompanyActivities(company: Company): LeadActivity[] {
    const allActivities: LeadActivity[] = [];
    company.leads.forEach(lead => {
      const leadActivities = activities[lead.id] || [];
      allActivities.push(...leadActivities);
    });
    return allActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  }

  async function handleSaveNote() {
    if (!selectedCompany) return;

    setSavingNote(true);

    // Check if note exists
    const { data: existingNote } = await supabase
      .from('company_notes')
      .select('*')
      .eq('company_name', selectedCompany.name)
      .single();

    if (existingNote) {
      await supabase
        .from('company_notes')
        .update({ note: noteText, updated_at: new Date().toISOString() })
        .eq('company_name', selectedCompany.name);
    } else {
      await supabase
        .from('company_notes')
        .insert([{ company_name: selectedCompany.name, note: noteText }]);
    }

    setCompanyNotes(prev => ({ ...prev, [selectedCompany.name]: noteText }));
    setShowNoteModal(false);
    setSavingNote(false);

    // Update selected company notes
    setSelectedCompany(prev => prev ? { ...prev, notes: noteText } : null);
  }

  function openNoteModal(company: Company) {
    setNoteText(company.notes);
    setShowNoteModal(true);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.companies.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t.companies.subtitle}</p>
      </div>

      {/* Filters */}
      <div className="bg-syntalys-blue dark:bg-gray-800 border border-syntalys-blue dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 dark:text-gray-400" />
            <input
              type="text"
              placeholder={t.companies.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white placeholder-white/60 dark:placeholder-gray-400 focus:ring-2 focus:ring-white/40"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border transition-colors ${showFilters ? 'bg-white/20 border-white/40 text-white dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400' : 'border-white/20 dark:border-gray-600 text-white dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700'}`}
          >
            <FaFilter className="w-4 h-4" />
            {t.common.filter}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20 dark:border-gray-700">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white"
            >
              <option value="all" className="text-gray-900">{t.companies.allCountries}</option>
              {uniqueCountries.map(code => (
                <option key={code} value={code} className="text-gray-900">{getCountryName(code)}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 text-white dark:text-white"
            >
              <option value="all" className="text-gray-900">{t.companies.allStatuses}</option>
              <option value="negotiation" className="text-gray-900">{t.companies.statusNegotiation}</option>
              <option value="proposal" className="text-gray-900">{t.companies.statusProposal}</option>
              <option value="qualified" className="text-gray-900">{t.companies.statusQualified}</option>
              <option value="initial" className="text-gray-900">{t.companies.statusInitialContact}</option>
              <option value="closed" className="text-gray-900">{t.companies.statusClosed}</option>
              <option value="mixed" className="text-gray-900">{t.companies.statusMixed}</option>
            </select>
          </div>
        )}
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FaBuilding className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t.companies.noCompanies}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <div
              key={company.name}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => setSelectedCompany(company)}
            >
              {/* Company Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FaBuilding className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{company.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getCountryName(company.country)}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(company.generalStatus)}`}>
                  {getStatusLabel(company.generalStatus)}
                </span>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{company.leads.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.companies.leadsCount}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{company.activeLeads}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.companies.activeLeadsCount}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {company.totalValue > 0 ? `${(company.totalValue / 1000).toFixed(0)}K` : '-'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">CHF</p>
                </div>
              </div>

              {/* Main Contact */}
              {company.mainContact && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <FaUser className="w-3 h-3" />
                  <span className="truncate">{company.mainContact.name}</span>
                  {company.mainContact.phone && (
                    <a
                      href={`tel:${company.mainContact.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="ml-auto p-1 hover:text-blue-600 transition-colors"
                    >
                      <FaPhone className="w-3 h-3" />
                    </a>
                  )}
                  {company.mainContact.whatsapp && (
                    <a
                      href={`https://wa.me/${company.mainContact.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 hover:text-green-600 transition-colors"
                    >
                      <FaWhatsapp className="w-3 h-3" />
                    </a>
                  )}
                  {company.mainContact.email && (
                    <a
                      href={`mailto:${company.mainContact.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 hover:text-orange-600 transition-colors"
                    >
                      <FaEnvelope className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Last Activity */}
              {company.lastActivity && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <FaCalendarAlt className="w-3 h-3" />
                  <span>
                    {t.companies.lastActivity}: {new Date(company.lastActivity).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Notes indicator */}
              {company.notes && (
                <div className="flex items-center gap-1 mt-2 text-xs text-amber-600 dark:text-amber-400">
                  <FaStickyNote className="w-3 h-3" />
                  <span className="truncate">{company.notes}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Company Detail Slide Panel */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setSelectedCompany(null)}>
          <div
            className="w-full max-w-2xl bg-white dark:bg-gray-800 h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FaBuilding className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCompany.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getCountryName(selectedCompany.country)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCompany.leads.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.companies.leadsCount}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedCompany.activeLeads}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.companies.activeLeadsCount}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedCompany.totalValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">CHF</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedCompany.generalStatus)}`}>
                    {getStatusLabel(selectedCompany.generalStatus)}
                  </span>
                </div>
              </div>

              {/* Main Contact Info */}
              {selectedCompany.mainContact && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaUser className="w-4 h-4" />
                    {t.companies.mainContact}
                  </h3>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCompany.mainContact.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCompany.mainContact.phone && (
                        <a
                          href={`tel:${selectedCompany.mainContact.phone}`}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          <FaPhone className="w-3 h-3" />
                          {selectedCompany.mainContact.phone}
                        </a>
                      )}
                      {selectedCompany.mainContact.whatsapp && (
                        <a
                          href={`https://wa.me/${selectedCompany.mainContact.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                          <FaWhatsapp className="w-3 h-3" />
                          WhatsApp
                        </a>
                      )}
                      {selectedCompany.mainContact.email && (
                        <a
                          href={`mailto:${selectedCompany.mainContact.email}`}
                          className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                        >
                          <FaEnvelope className="w-3 h-3" />
                          {selectedCompany.mainContact.email}
                        </a>
                      )}
                    </div>
                    {selectedCompany.mainContact.service_interested && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <span className="font-medium">{t.leads.serviceInterested}:</span> {selectedCompany.mainContact.service_interested}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Company Notes */}
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FaStickyNote className="w-4 h-4 text-amber-600" />
                    {t.companies.notes}
                  </h3>
                  <button
                    onClick={() => openNoteModal(selectedCompany)}
                    className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    {selectedCompany.notes ? t.common.edit : t.companies.addNote}
                  </button>
                </div>
                {selectedCompany.notes ? (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedCompany.notes}</p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">{t.companies.noNotes}</p>
                )}
              </div>

              {/* Leads List */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t.companies.leadsList}</h3>
                <div className="space-y-2">
                  {selectedCompany.leads.map(lead => (
                    <Link
                      key={lead.id}
                      href={`/dashboard/leads?search=${encodeURIComponent(lead.name)}`}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getTemperatureIcon(lead.temperature)}
                          <span className="font-medium text-gray-900 dark:text-white">{lead.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getLeadStatusColor(lead.status)}`}>
                          {getLeadStatusLabel(lead.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {lead.estimated_value && (
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            {lead.currency} {lead.estimated_value.toLocaleString()}
                          </span>
                        )}
                        <FaExternalLinkAlt className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t.companies.recentActivities}</h3>
                {getCompanyActivities(selectedCompany).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 italic text-sm">{t.companies.noActivity}</p>
                ) : (
                  <div className="space-y-2">
                    {getCompanyActivities(selectedCompany).map(activity => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                          {activity.outcome && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {t.leads.outcome}: {activity.outcome}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowNoteModal(false)}>
          <div
            className="bg-white dark:bg-gray-800 shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.companies.notes} - {selectedCompany.name}
              </h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaTimes className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={t.forms.notesPlaceholder}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSaveNote}
                disabled={savingNote}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {savingNote ? t.common.loading + '...' : t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
