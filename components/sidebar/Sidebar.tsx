'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  chevronLeft: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
        key: 'expenses',
        path: '/dashboard/gastos',
        roles: ['super_admin', 'admin', 'gestor'],
        icon: icons.expenses,
      },
      {
        key: 'income',
        path: '/dashboard/ingresos',
        roles: ['super_admin', 'admin', 'gestor'],
        icon: icons.income,
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
      {
        key: 'settings',
        path: '/dashboard/settings',
        roles: ['super_admin', 'admin', 'gestor', 'empleado'],
        icon: icons.settings,
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
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading } = useAuth();
  const { t } = useLanguage();
  const { isCollapsed, toggleSidebar } = useSidebar();

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
      <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-syntalys-blue text-white h-screen flex items-center justify-center transition-all duration-300 ease-in-out`}>
        <p className={isCollapsed ? 'hidden' : ''}>{t.common.loading}...</p>
      </div>
    );
  }

  // Filtrar secciones y items del menú según el rol del usuario
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
    clients: t.nav.clients,
    projects: t.nav.projects,
    expenses: t.nav.expenses,
    income: t.nav.income,
    stats: t.nav.stats,
    chatAI: t.nav.chatAI,
    passwords: t.nav.passwords,
    settings: t.nav.settings,
    users: t.nav.users,
  };

  const categoryLabels: Record<string, string> = {
    general: t.sidebar.general,
    business: t.sidebar.business,
    finance: t.sidebar.finance,
    tools: t.sidebar.tools,
    admin: t.sidebar.admin,
  };

  return (
    <div
      className="relative bg-syntalys-blue text-white h-screen flex flex-col"
      style={{
        width: isCollapsed ? '5rem' : '16rem',
        transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Toggle Button - positioned at the edge */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-50 w-6 h-6 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center text-syntalys-blue dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
        style={{ transition: 'background-color 200ms ease, transform 200ms ease' }}
        title={isCollapsed ? 'Expand' : 'Collapse'}
      >
        <span style={{ transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)', transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
          {icons.chevronRight}
        </span>
      </button>

      {/* Logo */}
      <div
        className="border-b border-white/10 flex items-center justify-center"
        style={{
          padding: isCollapsed ? '1rem' : '1.5rem',
          transition: 'padding 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          className="relative"
          style={{
            width: isCollapsed ? '3rem' : '100%',
            height: '3rem',
            transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Icon logo - always rendered but fades */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: isCollapsed ? 1 : 0,
              transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: isCollapsed ? '100ms' : '0ms',
            }}
          >
            <Image
              src="/logos/logo-icono-solo-white.png"
              alt="Syntalys CRM"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          {/* Horizontal logo - always rendered but fades */}
          <div
            className="absolute inset-0"
            style={{
              opacity: isCollapsed ? 0 : 1,
              transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: isCollapsed ? '0ms' : '100ms',
            }}
          >
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

      {/* Usuario info */}
      <div
        className="border-b border-white/10"
        style={{
          padding: isCollapsed ? '0.75rem 0' : '1rem',
          transition: 'padding 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          className="flex items-center"
          style={{
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            paddingLeft: isCollapsed ? 0 : '0.5rem',
            transition: 'padding-left 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-semibold">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : profile?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div
            className="min-w-0 overflow-hidden"
            style={{
              marginLeft: isCollapsed ? 0 : '0.75rem',
              width: isCollapsed ? 0 : 'auto',
              opacity: isCollapsed ? 0 : 1,
              transition: 'margin-left 400ms cubic-bezier(0.4, 0, 0.2, 1), width 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
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
      </div>

      {/* Menú de navegación - sin scroll */}
      <nav className="flex-1 py-1">
        {visibleSections.map((section, sectionIndex) => (
          <div key={section.categoryKey}>
            {/* Divider (except for first section) */}
            {sectionIndex > 0 && (
              <div
                className="my-1 border-t border-white/10"
                style={{
                  marginLeft: isCollapsed ? '0.5rem' : '1rem',
                  marginRight: isCollapsed ? '0.5rem' : '1rem',
                  transition: 'margin 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            )}

            {/* Category label - más compacto */}
            <div
              className="px-4 overflow-hidden"
              style={{
                height: isCollapsed ? 0 : 'auto',
                opacity: isCollapsed ? 0 : 1,
                paddingTop: isCollapsed ? 0 : '0.25rem',
                paddingBottom: isCollapsed ? 0 : '0.25rem',
                transition: 'height 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), padding 400ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap">
                {categoryLabels[section.categoryKey]}
              </span>
            </div>

            {/* Menu items - más compactos */}
            {section.items.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center py-2 ${isActive ? 'bg-white/10 border-l-4 border-white' : 'hover:bg-white/5 border-l-4 border-transparent'}`}
                  style={{
                    paddingLeft: isCollapsed ? '0' : '1rem',
                    paddingRight: isCollapsed ? '0' : '1rem',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    transition: 'padding 400ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms ease',
                  }}
                  title={isCollapsed ? menuLabels[item.key] : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span
                    className="font-medium text-sm whitespace-nowrap overflow-hidden"
                    style={{
                      marginLeft: isCollapsed ? 0 : '0.75rem',
                      width: isCollapsed ? 0 : 'auto',
                      opacity: isCollapsed ? 0 : 1,
                      transition: 'margin-left 400ms cubic-bezier(0.4, 0, 0.2, 1), width 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {menuLabels[item.key]}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Botón de cerrar sesión */}
      <div
        className="border-t border-white/10"
        style={{
          padding: isCollapsed ? '0.5rem' : '1rem',
          transition: 'padding 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center bg-white/10 hover:bg-white/20 rounded-md"
          style={{
            padding: isCollapsed ? '0.5rem' : '0.5rem 1rem',
            justifyContent: isCollapsed ? 'center' : 'center',
            transition: 'padding 400ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms ease',
          }}
          title={isCollapsed ? t.nav.logout : undefined}
        >
          {icons.logout}
          <span
            className="whitespace-nowrap overflow-hidden"
            style={{
              marginLeft: isCollapsed ? 0 : '0.5rem',
              width: isCollapsed ? 0 : 'auto',
              opacity: isCollapsed ? 0 : 1,
              transition: 'margin-left 400ms cubic-bezier(0.4, 0, 0.2, 1), width 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {t.nav.logout}
          </span>
        </button>
      </div>
    </div>
  );
}
