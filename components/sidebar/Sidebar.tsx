'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSidebar } from '@/contexts/SidebarContext';
import Image from 'next/image';

interface MenuItem {
  key: string;
  path: string;
  roles: string[];
  icon: React.ReactNode;
}

interface MenuSection {
  categoryKey: string;
  items: MenuItem[];
}

// SVG Icons
const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  clients: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  projects: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  expenses: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  income: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  stats: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  passwords: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  leads: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  pipeline: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  companies: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  activities: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  chatAI: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  services: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  templates: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

const menuSections: MenuSection[] = [
  {
    categoryKey: 'general',
    items: [
      {
        key: 'dashboard',
        path: '/dashboard',
        roles: ['super_admin', 'admin', 'gestor', 'empleado'],
        icon: icons.dashboard,
      },
      {
        key: 'stats',
        path: '/dashboard/estadisticas',
        roles: ['super_admin', 'admin', 'gestor'],
        icon: icons.stats,
      },
    ],
  },
  {
    categoryKey: 'sales',
    items: [
      {
        key: 'leads',
        path: '/dashboard/leads',
        roles: ['super_admin', 'admin', 'gestor', 'empleado'],
        icon: icons.leads,
      },
      {
        key: 'pipeline',
        path: '/dashboard/pipeline',
        roles: ['super_admin', 'admin', 'gestor', 'empleado'],
        icon: icons.pipeline,
      },
      {
        key: 'activities',
        path: '/dashboard/activities',
        roles: ['super_admin', 'admin', 'gestor', 'empleado'],
        icon: icons.activities,
      },
      {
        key: 'companies',
        path: '/dashboard/companies',
        roles: ['super_admin', 'admin', 'gestor', 'empleado'],
        icon: icons.companies,
      },
    ],
  },
  {
    categoryKey: 'business',
    items: [
      {
        key: 'clients',
        path: '/dashboard/clientes',
        roles: ['super_admin', 'admin', 'gestor'],
        icon: icons.clients,
      },
      {
        key: 'projects',
        path: '/dashboard/proyectos',
        roles: ['super_admin', 'admin', 'gestor'],
        icon: icons.projects,
      },
    ],
  },
  {
    categoryKey: 'finance',
    items: [
      {
        key: 'income',
        path: '/dashboard/ingresos',
        roles: ['super_admin', 'admin', 'gestor'],
        icon: icons.income,
      },
      {
        key: 'expenses',
        path: '/dashboard/gastos',
        roles: ['super_admin', 'admin', 'gestor'],
        icon: icons.expenses,
      },
    ],
  },
  {
    categoryKey: 'tools',
    items: [
      {
        key: 'chatAI',
        path: '/dashboard/chat',
        roles: ['super_admin', 'admin', 'gestor'],
        icon: icons.chatAI,
      },
      {
        key: 'passwords',
        path: '/dashboard/passwords',
        roles: ['super_admin', 'admin', 'gestor'],
        icon: icons.passwords,
      },
    ],
  },
  {
    categoryKey: 'syntalys',
    items: [
      {
        key: 'services',
        path: '/dashboard/servicios',
        roles: ['super_admin', 'admin', 'gestor'],
        icon: icons.services,
      },
      {
        key: 'templates',
        path: '/dashboard/plantillas',
        roles: ['super_admin', 'admin', 'gestor'],
        icon: icons.templates,
      },
    ],
  },
  {
    categoryKey: 'admin',
    items: [
      {
        key: 'users',
        path: '/dashboard/usuarios',
        roles: ['super_admin'],
        icon: icons.users,
      },
      {
        key: 'settings',
        path: '/dashboard/settings',
        roles: ['super_admin', 'admin', 'gestor', 'empleado'],
        icon: icons.settings,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading } = useAuth();
  const { t } = useLanguage();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    general: true,
    sales: true,
    business: true,
    finance: true,
    tools: true,
    syntalys: true,
    admin: true,
  });

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-syntalys-blue text-white h-screen flex items-center justify-center transition-all duration-300`}>
        <p className={isCollapsed ? 'hidden' : ''}>{t.common.loading}...</p>
      </div>
    );
  }

  const visibleSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => profile && item.roles.includes(profile.role)
      ),
    }))
    .filter((section) => section.items.length > 0);

  const menuLabels: Record<string, string> = {
    dashboard: t.nav.dashboard,
    leads: t.nav.leads,
    activities: t.nav.activities || 'Actividades',
    pipeline: t.nav.pipeline,
    companies: t.nav.companies,
    clients: t.nav.clients,
    projects: t.nav.projects,
    expenses: t.nav.expenses,
    income: t.nav.income,
    stats: t.nav.stats,
    chatAI: t.nav.chatAI,
    passwords: t.nav.passwords,
    settings: t.nav.settings,
    users: t.nav.users,
    services: t.syntalys.services,
    templates: t.syntalys.templates,
  };

  const categoryLabels: Record<string, string> = {
    general: t.sidebar.general,
    sales: t.sidebar.sales,
    business: t.sidebar.business,
    finance: t.sidebar.finance,
    tools: t.sidebar.tools,
    syntalys: t.sidebar.syntalys,
    admin: t.sidebar.admin,
  };

  return (
    <div
      className={`relative bg-syntalys-blue text-white h-screen flex flex-col transition-[width] duration-300 ease-out ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 w-6 h-6 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center text-syntalys-blue dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-colors duration-200"
        title={isCollapsed ? 'Expand' : 'Collapse'}
      >
        <span className={`transition-transform duration-300 ease-out ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}>
          {icons.chevronRight}
        </span>
      </button>

      {/* Logo */}
      <div className={`border-b border-white/10 flex items-center justify-center transition-all duration-300 ease-out ${isCollapsed ? 'p-4' : 'p-6'}`}>
        <div className={`relative h-12 transition-all duration-300 ease-out ${isCollapsed ? 'w-12' : 'w-full'}`}>
          {/* Icon logo */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isCollapsed ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src="/logos/logo-icono-solo-white.png"
              alt="Syntalys CRM"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          {/* Horizontal logo */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            <Image
              src="/logos/logo-horizontal-white.png"
              alt="Syntalys CRM"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* User info */}
      <Link
        href="/dashboard/perfil"
        className={`block border-b border-white/10 hover:bg-white/5 transition-all duration-300 ease-out ${isCollapsed ? 'py-3 px-0' : 'p-4'}`}
        title={isCollapsed ? (t.profile?.title || 'Perfil') : undefined}
      >
        <div className={`flex items-center transition-all duration-300 ease-out ${isCollapsed ? 'justify-center' : 'justify-start px-2'}`}>
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt="Avatar"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-semibold">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : profile?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div className={`overflow-hidden transition-all duration-300 ease-out ${isCollapsed ? 'w-0 ml-0 opacity-0' : 'w-auto ml-3 opacity-100'}`}>
            <p className="text-sm font-medium truncate whitespace-nowrap">
              {profile?.full_name || profile?.email || 'Usuario'}
            </p>
            <p className="text-xs text-white/60 truncate whitespace-nowrap">
              {profile?.role === 'super_admin' && t.dashboard.superAdmin}
              {profile?.role === 'admin' && t.dashboard.admin}
              {profile?.role === 'gestor' && t.dashboard.manager}
              {profile?.role === 'empleado' && t.dashboard.employee}
            </p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 py-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
        {visibleSections.map((section, sectionIndex) => {
          const isExpanded = expandedCategories[section.categoryKey];
          return (
            <div key={section.categoryKey}>
              {/* Divider */}
              {sectionIndex > 0 && (
                <div className={`my-1 border-t border-white/10 transition-all duration-300 ease-out ${isCollapsed ? 'mx-2' : 'mx-4'}`} />
              )}

              {/* Category label with toggle */}
              <button
                onClick={() => toggleCategory(section.categoryKey)}
                className={`w-full flex items-center justify-between hover:bg-white/5 transition-all duration-300 ease-out ${isCollapsed ? 'h-0 opacity-0 py-0 px-0 overflow-hidden' : 'h-auto opacity-100 py-1.5 px-4'}`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap">
                  {categoryLabels[section.categoryKey]}
                </span>
                <span className={`text-white/50 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                  {icons.chevronDown}
                </span>
              </button>

              {/* Menu items */}
              <div className={`overflow-hidden transition-all duration-200 ease-out ${isExpanded || isCollapsed ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                {section.items.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center py-2 transition-all duration-200 ease-out ${
                        isActive
                          ? 'bg-white/10 border-l-4 border-white'
                          : 'hover:bg-white/5 border-l-4 border-transparent'
                      } ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4'}`}
                      title={isCollapsed ? menuLabels[item.key] : undefined}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-out ${isCollapsed ? 'w-0 ml-0 opacity-0' : 'w-auto ml-3 opacity-100'}`}>
                        {menuLabels[item.key]}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className={`border-t border-white/10 transition-all duration-300 ease-out ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-md transition-all duration-200 ease-out ${isCollapsed ? 'p-2' : 'py-2 px-4'}`}
          title={isCollapsed ? t.nav.logout : undefined}
        >
          {icons.logout}
          <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-out ${isCollapsed ? 'w-0 ml-0 opacity-0' : 'w-auto ml-2 opacity-100'}`}>
            {t.nav.logout}
          </span>
        </button>
      </div>
    </div>
  );
}
