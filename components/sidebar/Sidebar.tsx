'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import Image from 'next/image';

interface MenuItem {
  key: string;
  path: string;
  icon: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    icon: '',
    roles: ['super_admin', 'admin', 'gestor', 'empleado'],
  },
  {
    key: 'clients',
    path: '/dashboard/clientes',
    icon: '',
    roles: ['super_admin', 'admin', 'gestor'],
  },
  {
    key: 'projects',
    path: '/dashboard/proyectos',
    icon: '',
    roles: ['super_admin', 'admin', 'gestor'],
  },
  {
    key: 'expenses',
    path: '/dashboard/gastos',
    icon: '',
    roles: ['super_admin', 'admin', 'gestor'],
  },
  {
    key: 'income',
    path: '/dashboard/ingresos',
    icon: '',
    roles: ['super_admin', 'admin', 'gestor'],
  },
  {
    key: 'stats',
    path: '/dashboard/estadisticas',
    icon: '',
    roles: ['super_admin', 'admin', 'gestor'],
  },
  {
    key: 'users',
    path: '/dashboard/usuarios',
    icon: '',
    roles: ['super_admin'],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading } = useAuth();
  const { t } = useLanguage();

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
      <div className="w-64 bg-syntalys-blue text-white h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  // Filtrar items del menú según el rol del usuario
  const visibleMenuItems = menuItems.filter(
    (item) => profile && item.roles.includes(profile.role)
  );

  return (
    <div className="w-64 bg-syntalys-blue text-white h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="w-full h-12 relative">
          <Image
            src="/logos/logo-horizontal-white.png"
            alt="Syntalys CRM"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Usuario info */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : profile?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.full_name || profile?.email || 'Usuario'}
            </p>
            <p className="text-xs text-white/60 truncate">
              {profile?.role === 'super_admin' && 'Super Admin'}
              {profile?.role === 'admin' && 'Admin'}
              {profile?.role === 'gestor' && 'Gestor'}
              {profile?.role === 'empleado' && 'Empleado'}
            </p>
          </div>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 overflow-y-auto py-4">
        {visibleMenuItems.map((item) => {
          const isActive = pathname === item.path;
          const menuLabels: Record<string, string> = {
            'dashboard': t.nav.dashboard,
            'clients': t.nav.clients,
            'projects': t.nav.projects,
            'expenses': t.nav.expenses,
            'income': t.nav.income,
            'stats': t.nav.stats,
            'users': t.nav.users,
          };

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center px-6 py-3 transition-colors
                ${
                  isActive
                    ? 'bg-white/10 border-l-4 border-white'
                    : 'hover:bg-white/5 border-l-4 border-transparent'
                }
              `}
            >
              <span className="font-medium">{menuLabels[item.key]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Language Switcher */}
      <LanguageSwitcher />

      {/* Botón de cerrar sesión */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
        >
          <span>{t.nav.logout}</span>
        </button>
      </div>
    </div>
  );
}
