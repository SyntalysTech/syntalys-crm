// Sistema de traducciones para el CRM Syntalys
// Idiomas soportados: Español (es) y Francés Suizo (fr-CH)

export type Language = 'es' | 'fr';

export interface Translations {
  // Navegación y General
  nav: {
    dashboard: string;
    clients: string;
    projects: string;
    expenses: string;
    income: string;
    stats: string;
    users: string;
    reports: string;
    logout: string;
  };

  // Common
  common: {
    add: string;
    edit: string;
    delete: string;
    cancel: string;
    save: string;
    search: string;
    filter: string;
    loading: string;
    noData: string;
    actions: string;
    status: string;
    date: string;
    amount: string;
    total: string;
    description: string;
    notes: string;
    currency: string;
    close: string;
    confirm: string;
    more: string;
    none: string;
    saveChanges: string;
    type: string;
    client: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    welcome: string;
    connectedAs: string;
    totalClients: string;
    activeProjects: string;
    monthlyExpenses: string;
    annualExpenses: string;
    yearlyProjected: string;
    totalExpenses: string;
    monthlyIncome: string;
    recentActivity: string;
    quickStats: string;
    expensesSummary: string;
    expensesSummarySubtitle: string;
    recurringExpenses: string;
    monthly: string;
    annual: string;
    annualProjection: string;
    estimatedYearTotal: string;
    viewAllExpenses: string;
    viewAllIncome: string;
    noExpenses: string;
    noExpensesSubtitle: string;
    noIncome: string;
    projectedAnnualProfit: string;
    annualIncome: string;
    annualExpense: string;
    netProfit: string;
    // Roles
    superAdmin: string;
    admin: string;
    manager: string;
    employee: string;
  };

  // Clients
  clients: {
    title: string;
    subtitle: string;
    addClient: string;
    editClient: string;
    deleteClient: string;
    totalClients: string;
    clientExpenses: string;
    clientExpensesSubtitle: string;
    totalIncome: string;
    totalIncomeSubtitle: string;
    totalProfit: string;
    totalProfitSubtitle: string;
    companyName: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    active: string;
    inactive: string;
    suspended: string;
    potential: string;
    isPotential: string;
    noClients: string;
    createFirst: string;
    monthlyExpenses: string;
    annualExpenses: string;
    monthlyIncome: string;
    annualIncome: string;
    monthlyProfit: string;
    annualProfit: string;
  };

  // Projects
  projects: {
    title: string;
    subtitle: string;
    addProject: string;
    editProject: string;
    totalProjects: string;
    active: string;
    onHold: string;
    completed: string;
    activeValue: string;
    activeValueSubtitle: string;
    pendingIncome: string;
    pendingIncomeSubtitle: string;
    projectName: string;
    client: string;
    type: string;
    startDate: string;
    endDate: string;
    totalAmount: string;
    paymentType: string;
    noProjects: string;
    createFirst: string;
    // Project types
    webDevelopment: string;
    appDevelopment: string;
    maintenance: string;
    consulting: string;
    design: string;
    hosting: string;
    other: string;
    // Project status
    statusActive: string;
    statusCompleted: string;
    statusPaused: string;
    statusCancelled: string;
    // Payment types
    oneTime: string;
    monthly: string;
    annual: string;
    milestone: string;
  };

  // Expenses
  expenses: {
    title: string;
    subtitle: string;
    addExpense: string;
    companyExpenses: string;
    clientExpenses: string;
    monthlyExpenses: string;
    annualExpenses: string;
    totalYearly: string;
    serviceName: string;
    category: string;
    frequency: string;
    renewalDate: string;
    paymentDate: string;
    noExpenses: string;
    // Categories
    software: string;
    hosting: string;
    domain: string;
    api: string;
    development: string;
    ssl: string;
    maintenanceService: string;
    other: string;
    // Status
    paid: string;
    pending: string;
    upcoming: string;
    // Additional
    addCompanyExpense: string;
    addClientExpense: string;
    companyExpensesTab: string;
    clientExpensesTab: string;
    noMonthlyExpenses: string;
    noAnnualExpenses: string;
    noClientsRegistered: string;
    expensesByClient: string;
    expensesByClientSubtitle: string;
    theirExpenses: string;
    theirExpensesSubtitle: string;
    noClientExpenses: string;
    totalAnnualProjected: string;
    monthlyTimesTwelvePlusAnnual: string;
    services: string;
    totalMonthlyExpensesClients: string;
    totalAnnualExpensesClients: string;
    totalMonthlyCombined: string;
    totalAnnualCombined: string;
    addCompanyExpenseTitle: string;
    addCompanyExpenseSubtitle: string;
    addClientExpenseTitle: string;
    addClientExpenseSubtitle: string;
    noCategory: string;
    service: string;
    renewal: string;
    selectClient: string;
    optionalDescription: string;
    monthly: string;
    annual: string;
    client: string;
  };

  // Income
  income: {
    title: string;
    subtitle: string;
    addIncome: string;
    oneTimePayments: string;
    monthlyIncome: string;
    annualIncome: string;
    projectedAnnual: string;
    projectedAnnualSubtitle: string;
    serviceName: string;
    category: string;
    frequency: string;
    noIncome: string;
    noOneTimePayments: string;
    noMonthlyIncome: string;
    noAnnualIncome: string;
    payments: string;
    services: string;
    // Categories
    webDevelopment: string;
    maintenance: string;
    hosting: string;
    domain: string;
    crm: string;
    subscription: string;
    other: string;
    client: string;
    service: string;
    paymentDate: string;
    renewalDate: string;
    oneTime: string;
    addIncomeTitle: string;
    addIncomeSubtitle: string;
    selectFrequency: string;
  };

  // Forms
  forms: {
    required: string;
    optional: string;
    selectClient: string;
    selectCategory: string;
    selectStatus: string;
    selectFrequency: string;
    selectType: string;
    enterAmount: string;
    enterName: string;
    enterDescription: string;
    selectDate: string;
    notSpecified: string;
    projectPlaceholder: string;
    descriptionPlaceholder: string;
    notesPlaceholder: string;
    value: string;
    dates: string;
    name: string;
    email: string;
    phone: string;
    companyName: string;
  };

  // Messages
  messages: {
    deleteConfirm: string;
    deleteSuccess: string;
    deleteError: string;
    saveSuccess: string;
    saveError: string;
    loadError: string;
    fillRequired: string;
  };

  // Users / Super Admin
  users: {
    title: string;
    subtitle: string;
    addUser: string;
    editUser: string;
    deleteUser: string;
    totalUsers: string;
    activeUsers: string;
    inactiveUsers: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    active: string;
    inactive: string;
    noUsers: string;
    createFirst: string;
    selectRole: string;
    userActive: string;
    userInactive: string;
    superAdmin: string;
    admin: string;
    manager: string;
    employee: string;
    roleDescription: string;
    superAdminDesc: string;
    adminDesc: string;
    managerDesc: string;
    employeeDesc: string;
    addUserTitle: string;
    addUserSubtitle: string;
    editUserTitle: string;
    passwordPlaceholder: string;
    passwordNote: string;
    emailPlaceholder: string;
    namePlaceholder: string;
    phonePlaceholder: string;
  };

  // Stats page
  stats: {
    title: string;
    subtitle: string;
    dataType: string;
    period: string;
    chartType: string;
    syntalysExpenses: string;
    clientExpenses: string;
    clientIncome: string;
    monthly: string;
    annual: string;
    oneTime: string;
    bars: string;
    lines: string;
    pie: string;
    average: string;
    perPeriod: string;
    records: string;
    totalOf: string;
    noDataAvailable: string;
    selectFilters: string;
  };
}

export const translations: Record<Language, Translations> = {
  es: {
    nav: {
      dashboard: 'Dashboard',
      clients: 'Clientes',
      projects: 'Proyectos',
      expenses: 'Gastos',
      income: 'Ingresos',
      stats: 'Estadísticas',
      users: 'Usuarios',
      reports: 'Reportes',
      logout: 'Cerrar Sesión',
    },
    common: {
      add: 'Agregar',
      edit: 'Editar',
      delete: 'Eliminar',
      cancel: 'Cancelar',
      save: 'Guardar',
      search: 'Buscar',
      filter: 'Filtrar',
      loading: 'Cargando',
      noData: 'No hay datos',
      actions: 'Acciones',
      status: 'Estado',
      date: 'Fecha',
      amount: 'Importe',
      total: 'Total',
      description: 'Descripción',
      notes: 'Notas',
      currency: 'Moneda',
      close: 'Cerrar',
      confirm: 'Confirmar',
      more: 'más',
      none: 'Sin',
      saveChanges: 'Guardar Cambios',
      type: 'Tipo',
      client: 'Cliente',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Resumen general de tu negocio',
      welcome: 'Bienvenido',
      connectedAs: 'Estás conectado como',
      totalClients: 'Total Clientes',
      activeProjects: 'Proyectos Activos',
      monthlyExpenses: 'Gastos Mensuales',
      annualExpenses: 'Gastos Anuales',
      yearlyProjected: 'Total Anual Proyectado',
      totalExpenses: 'Total de Gastos',
      monthlyIncome: 'Ingresos Mensuales',
      recentActivity: 'Actividad Reciente',
      quickStats: 'Estadísticas Rápidas',
      expensesSummary: 'Resumen de Gastos',
      expensesSummarySubtitle: 'Gestiona y visualiza todos los gastos de Syntalys Tech',
      recurringExpenses: 'Gastos Recurrentes',
      monthly: 'Mensuales',
      annual: 'anual',
      annualProjection: 'Proyección Anual',
      estimatedYearTotal: 'Total estimado del año',
      viewAllExpenses: 'Ver todos los gastos',
      viewAllIncome: 'Ver todos los ingresos',
      noExpenses: 'No hay gastos registrados aún',
      noExpensesSubtitle: 'Ve a la sección de Gastos para agregar uno nuevo',
      noIncome: 'No hay ingresos registrados aún',
      projectedAnnualProfit: 'Beneficio Proyectado Anual',
      annualIncome: 'Ingresos Anuales',
      annualExpense: 'Gastos Anuales',
      netProfit: 'Beneficio Neto',
      superAdmin: 'Super Administrador',
      admin: 'Administrador',
      manager: 'Gestor',
      employee: 'Empleado',
    },
    clients: {
      title: 'Gestión de Clientes',
      subtitle: 'Administra tus clientes y visualiza sus gastos e ingresos',
      addClient: 'Agregar Cliente',
      editClient: 'Editar Cliente',
      deleteClient: 'Eliminar Cliente',
      totalClients: 'Total Clientes',
      clientExpenses: 'Gastos de Clientes (Anual)',
      clientExpensesSubtitle: 'Sus gastos (hosting, dominios, APIs, etc.)',
      totalIncome: 'Ingresos Totales (Anual)',
      totalIncomeSubtitle: 'Lo que nos pagan',
      totalProfit: 'Beneficio Total (Anual)',
      totalProfitSubtitle: 'Ingresos - Sus gastos',
      companyName: 'Nombre de la Empresa',
      contactName: 'Nombre de Contacto',
      contactEmail: 'Email de Contacto',
      contactPhone: 'Teléfono de Contacto',
      address: 'Dirección',
      active: 'Activo',
      inactive: 'Inactivo',
      suspended: 'Suspendido',
      potential: 'Potencial',
      isPotential: 'Cliente Potencial',
      noClients: 'No hay clientes registrados aún',
      createFirst: 'Crear primer cliente',
      monthlyExpenses: 'Gastos Mensuales',
      annualExpenses: 'Gastos Anuales',
      monthlyIncome: 'Ingresos Mensuales',
      annualIncome: 'Ingresos Anuales',
      monthlyProfit: 'Beneficio Mensual',
      annualProfit: 'Beneficio Anual',
    },
    projects: {
      title: 'Proyectos y Servicios',
      subtitle: 'Gestiona los proyectos y servicios que ofrecemos a nuestros clientes',
      addProject: 'Nuevo Proyecto',
      editProject: 'Editar Proyecto',
      totalProjects: 'Total Proyectos',
      active: 'Activos',
      onHold: 'En Espera',
      completed: 'Completados',
      activeValue: 'Valor Activo',
      activeValueSubtitle: 'En progreso',
      pendingIncome: 'Ingresos Pendientes',
      pendingIncomeSubtitle: 'Por cobrar',
      projectName: 'Nombre del Proyecto',
      client: 'Cliente',
      type: 'Tipo',
      startDate: 'Fecha Inicio',
      endDate: 'Fecha Fin',
      totalAmount: 'Monto Total',
      paymentType: 'Tipo de Pago',
      noProjects: 'No hay proyectos registrados aún',
      createFirst: 'Crear primer proyecto',
      webDevelopment: 'Desarrollo Web',
      appDevelopment: 'Desarrollo de Apps',
      maintenance: 'Mantenimiento',
      consulting: 'Consultoría',
      design: 'Diseño',
      hosting: 'Hosting',
      other: 'Otro',
      statusActive: 'Activo',
      statusCompleted: 'Completado',
      statusPaused: 'En Espera',
      statusCancelled: 'Cancelado',
      oneTime: 'Pago Único',
      monthly: 'Mensual',
      annual: 'Anual',
      milestone: 'Por Hito',
    },
    expenses: {
      title: 'Gestión de Gastos',
      subtitle: 'Control de gastos de la empresa y de clientes',
      addExpense: 'Agregar Gasto',
      companyExpenses: 'Gastos de la Empresa',
      clientExpenses: 'Gastos de Clientes',
      monthlyExpenses: 'Gastos Mensuales',
      annualExpenses: 'Gastos Anuales',
      totalYearly: 'Total Anual Proyectado',
      serviceName: 'Nombre del Servicio',
      category: 'Categoría',
      frequency: 'Frecuencia',
      renewalDate: 'Fecha de Renovación',
      paymentDate: 'Fecha de Pago',
      noExpenses: 'No hay gastos registrados',
      software: 'Software',
      hosting: 'Hosting',
      domain: 'Dominio',
      api: 'API',
      development: 'Desarrollo',
      ssl: 'SSL',
      maintenanceService: 'Mantenimiento',
      other: 'Otro',
      paid: 'Pagado',
      pending: 'Pendiente',
      upcoming: 'Próximo',
      addCompanyExpense: 'Gasto de Syntalys',
      addClientExpense: 'Gasto del Cliente',
      companyExpensesTab: 'Gastos de Syntalys',
      clientExpensesTab: 'Gastos de Clientes',
      noMonthlyExpenses: 'No hay gastos mensuales registrados',
      noAnnualExpenses: 'No hay gastos anuales registrados',
      noClientsRegistered: 'No hay clientes registrados',
      expensesByClient: 'Gastos por Cliente',
      expensesByClientSubtitle: 'Servicios que los clientes usan (hosting, dominios, etc.)',
      theirExpenses: 'Sus Gastos',
      theirExpensesSubtitle: 'Servicios que usan (hosting, dominios, APIs, etc.)',
      noClientExpenses: 'Sin gastos registrados',
      totalAnnualProjected: 'Total Anual Proyectado',
      monthlyTimesTwelvePlusAnnual: 'Mensual × 12 + Anual',
      services: 'servicios',
      totalMonthlyExpensesClients: 'Gastos Mensuales de Clientes',
      totalAnnualExpensesClients: 'Gastos Anuales de Clientes',
      totalMonthlyCombined: 'Total mensual combinado',
      totalAnnualCombined: 'Total anual combinado',
      addCompanyExpenseTitle: 'Agregar Gasto de Syntalys',
      addCompanyExpenseSubtitle: 'Registra un gasto de la empresa',
      addClientExpenseTitle: 'Agregar Gasto del Cliente',
      addClientExpenseSubtitle: 'Servicios que el cliente usa (hosting, dominio, etc.)',
      noCategory: 'Sin categoría',
      service: 'Servicio',
      renewal: 'Renovación',
      selectClient: 'Seleccionar cliente',
      optionalDescription: 'Descripción opcional',
      monthly: 'Mensual',
      annual: 'Anual',
      client: 'Cliente',
    },
    income: {
      title: 'Ingresos',
      subtitle: 'Lo que nos pagan nuestros clientes',
      addIncome: 'Nuevo Ingreso',
      oneTimePayments: 'Pagos Únicos',
      monthlyIncome: 'Ingresos Mensuales',
      annualIncome: 'Ingresos Anuales',
      projectedAnnual: 'Total Anual Proyectado',
      projectedAnnualSubtitle: 'Recurrente anual',
      serviceName: 'Nombre del Servicio',
      category: 'Categoría',
      frequency: 'Frecuencia',
      noIncome: 'No hay ingresos registrados',
      noOneTimePayments: 'No hay pagos únicos registrados',
      noMonthlyIncome: 'No hay ingresos mensuales registrados',
      noAnnualIncome: 'No hay ingresos anuales registrados',
      payments: 'pagos',
      services: 'servicios',
      webDevelopment: 'Desarrollo Web',
      maintenance: 'Mantenimiento',
      hosting: 'Hosting',
      domain: 'Dominio',
      crm: 'CRM',
      subscription: 'Suscripción',
      other: 'Otro',
      client: 'Cliente',
      service: 'Servicio',
      paymentDate: 'Fecha de Pago',
      renewalDate: 'Fecha de Renovación',
      oneTime: 'Pago Único',
      addIncomeTitle: 'Agregar Ingreso',
      addIncomeSubtitle: 'Registra un ingreso de un cliente',
      selectFrequency: 'Selecciona una frecuencia',
    },
    forms: {
      required: 'obligatorio',
      optional: 'opcional',
      selectClient: 'Selecciona un cliente',
      selectCategory: 'Selecciona una categoría',
      selectStatus: 'Selecciona un estado',
      selectFrequency: 'Selecciona una frecuencia',
      selectType: 'Selecciona un tipo',
      enterAmount: 'Ingresa el monto',
      enterName: 'Ingresa el nombre',
      enterDescription: 'Ingresa una descripción',
      selectDate: 'Selecciona una fecha',
      notSpecified: 'Sin especificar',
      projectPlaceholder: 'Ej: Desarrollo Web E-commerce',
      descriptionPlaceholder: 'Descripción del proyecto...',
      notesPlaceholder: 'Notas adicionales...',
      value: 'Valor',
      dates: 'Fechas',
      name: 'Nombre',
      email: 'Email',
      phone: 'Teléfono',
      companyName: 'Nombre de la Empresa',
    },
    messages: {
      deleteConfirm: '¿Estás seguro de que quieres eliminar',
      deleteSuccess: 'Eliminado correctamente',
      deleteError: 'Error al eliminar',
      saveSuccess: 'Guardado correctamente',
      saveError: 'Error al guardar',
      loadError: 'Error al cargar los datos',
      fillRequired: 'Por favor completa los campos obligatorios',
    },
    users: {
      title: 'Usuarios',
      subtitle: 'Administra los usuarios del sistema',
      addUser: 'Agregar Usuario',
      editUser: 'Editar Usuario',
      deleteUser: 'Eliminar Usuario',
      totalUsers: 'Total de Usuarios',
      activeUsers: 'Usuarios Activos',
      inactiveUsers: 'Usuarios Inactivos',
      fullName: 'Nombre Completo',
      email: 'Correo Electrónico',
      phone: 'Teléfono',
      role: 'Rol',
      active: 'Activo',
      inactive: 'Inactivo',
      noUsers: 'No hay usuarios registrados',
      createFirst: 'Crea el primer usuario',
      selectRole: 'Selecciona un rol',
      userActive: 'Usuario Activo',
      userInactive: 'Usuario Inactivo',
      superAdmin: 'Super Administrador',
      admin: 'Administrador',
      manager: 'Gestor',
      employee: 'Empleado',
      roleDescription: 'Descripción del Rol',
      superAdminDesc: 'Acceso total al sistema, puede gestionar usuarios',
      adminDesc: 'Acceso completo excepto gestión de usuarios',
      managerDesc: 'Puede gestionar clientes, proyectos, gastos e ingresos',
      employeeDesc: 'Acceso de solo lectura al dashboard',
      addUserTitle: 'Agregar Nuevo Usuario',
      addUserSubtitle: 'Crea una nueva cuenta de usuario en el sistema',
      editUserTitle: 'Editar Usuario',
      passwordPlaceholder: 'Contraseña (mínimo 6 caracteres)',
      passwordNote: 'Dejar en blanco para mantener la contraseña actual',
      emailPlaceholder: 'correo@ejemplo.com',
      namePlaceholder: 'Juan Pérez',
      phonePlaceholder: '+41 xx xxx xx xx',
    },
    stats: {
      title: 'Estadísticas',
      subtitle: 'Visualiza y analiza tus datos financieros con gráficos interactivos',
      dataType: 'Tipo de Datos',
      period: 'Período',
      chartType: 'Tipo de Gráfico',
      syntalysExpenses: 'Gastos de Syntalys',
      clientExpenses: 'Gastos de Clientes',
      clientIncome: 'Ingresos de Clientes',
      monthly: 'Mensuales',
      annual: 'Anuales',
      oneTime: 'Pago Único',
      bars: 'Barras',
      lines: 'Líneas',
      pie: 'Torta',
      average: 'Promedio',
      perPeriod: 'Por período',
      records: 'Registros',
      totalOf: 'Total de',
      noDataAvailable: 'No hay datos disponibles',
      selectFilters: 'Selecciona diferentes filtros o agrega datos en las secciones correspondientes',
    },
  },
  fr: {
    nav: {
      dashboard: 'Tableau de bord',
      clients: 'Clients',
      projects: 'Projets',
      expenses: 'Dépenses',
      income: 'Revenus',
      stats: 'Statistiques',
      users: 'Utilisateurs',
      reports: 'Rapports',
      logout: 'Déconnexion',
    },
    common: {
      add: 'Ajouter',
      edit: 'Modifier',
      delete: 'Supprimer',
      cancel: 'Annuler',
      save: 'Enregistrer',
      search: 'Rechercher',
      filter: 'Filtrer',
      loading: 'Chargement',
      noData: 'Aucune donnée',
      actions: 'Actions',
      status: 'Statut',
      date: 'Date',
      amount: 'Montant',
      total: 'Total',
      description: 'Description',
      notes: 'Notes',
      currency: 'Monnaie',
      close: 'Fermer',
      confirm: 'Confirmer',
      more: 'de plus',
      none: 'Sans',
      saveChanges: 'Enregistrer les Modifications',
      type: 'Type',
      client: 'Client',
    },
    dashboard: {
      title: 'Tableau de bord',
      subtitle: 'Vue d\'ensemble de votre entreprise',
      welcome: 'Bienvenue',
      connectedAs: 'Vous êtes connecté en tant que',
      totalClients: 'Total Clients',
      activeProjects: 'Projets Actifs',
      monthlyExpenses: 'Dépenses Mensuelles',
      annualExpenses: 'Dépenses Annuelles',
      yearlyProjected: 'Total Annuel Projeté',
      totalExpenses: 'Total des Dépenses',
      monthlyIncome: 'Revenus Mensuels',
      recentActivity: 'Activité Récente',
      quickStats: 'Statistiques Rapides',
      expensesSummary: 'Résumé des Dépenses',
      expensesSummarySubtitle: 'Gérez et visualisez toutes les dépenses de Syntalys Tech',
      recurringExpenses: 'Dépenses Récurrentes',
      monthly: 'Mensuelles',
      annual: 'annuel',
      annualProjection: 'Projection Annuelle',
      estimatedYearTotal: 'Total estimé de l\'année',
      viewAllExpenses: 'Voir toutes les dépenses',
      viewAllIncome: 'Voir tous les revenus',
      noExpenses: 'Aucune dépense enregistrée pour le moment',
      noExpensesSubtitle: 'Allez dans la section Dépenses pour en ajouter une nouvelle',
      noIncome: 'Aucun revenu enregistré pour le moment',
      projectedAnnualProfit: 'Bénéfice Annuel Projeté',
      annualIncome: 'Revenus Annuels',
      annualExpense: 'Dépenses Annuelles',
      netProfit: 'Bénéfice Net',
      superAdmin: 'Super Administrateur',
      admin: 'Administrateur',
      manager: 'Gestionnaire',
      employee: 'Employé',
    },
    clients: {
      title: 'Gestion des Clients',
      subtitle: 'Gérez vos clients et visualisez leurs dépenses et revenus',
      addClient: 'Ajouter un Client',
      editClient: 'Modifier le Client',
      deleteClient: 'Supprimer le Client',
      totalClients: 'Total Clients',
      clientExpenses: 'Dépenses des Clients (Annuel)',
      clientExpensesSubtitle: 'Leurs dépenses (hébergement, domaines, APIs, etc.)',
      totalIncome: 'Revenus Totaux (Annuel)',
      totalIncomeSubtitle: 'Ce qu\'ils nous paient',
      totalProfit: 'Bénéfice Total (Annuel)',
      totalProfitSubtitle: 'Revenus - Leurs dépenses',
      companyName: 'Nom de l\'Entreprise',
      contactName: 'Nom du Contact',
      contactEmail: 'Email du Contact',
      contactPhone: 'Téléphone du Contact',
      address: 'Adresse',
      active: 'Actif',
      inactive: 'Inactif',
      suspended: 'Suspendu',
      potential: 'Potentiel',
      isPotential: 'Client Potentiel',
      noClients: 'Aucun client enregistré pour le moment',
      createFirst: 'Créer le premier client',
      monthlyExpenses: 'Dépenses Mensuelles',
      annualExpenses: 'Dépenses Annuelles',
      monthlyIncome: 'Revenus Mensuels',
      annualIncome: 'Revenus Annuels',
      monthlyProfit: 'Bénéfice Mensuel',
      annualProfit: 'Bénéfice Annuel',
    },
    projects: {
      title: 'Projets et Services',
      subtitle: 'Gérez les projets et services que nous offrons à nos clients',
      addProject: 'Nouveau Projet',
      editProject: 'Modifier le Projet',
      totalProjects: 'Total Projets',
      active: 'Actifs',
      onHold: 'En Attente',
      completed: 'Terminés',
      activeValue: 'Valeur Active',
      activeValueSubtitle: 'En cours',
      pendingIncome: 'Revenus en Attente',
      pendingIncomeSubtitle: 'À encaisser',
      projectName: 'Nom du Projet',
      client: 'Client',
      type: 'Type',
      startDate: 'Date de Début',
      endDate: 'Date de Fin',
      totalAmount: 'Montant Total',
      paymentType: 'Type de Paiement',
      noProjects: 'Aucun projet enregistré pour le moment',
      createFirst: 'Créer le premier projet',
      webDevelopment: 'Développement Web',
      appDevelopment: 'Développement d\'Apps',
      maintenance: 'Maintenance',
      consulting: 'Conseil',
      design: 'Design',
      hosting: 'Hébergement',
      other: 'Autre',
      statusActive: 'Actif',
      statusCompleted: 'Terminé',
      statusPaused: 'En Attente',
      statusCancelled: 'Annulé',
      oneTime: 'Paiement Unique',
      monthly: 'Mensuel',
      annual: 'Annuel',
      milestone: 'Par Jalon',
    },
    expenses: {
      title: 'Gestion des Dépenses',
      subtitle: 'Contrôle des dépenses de l\'entreprise et des clients',
      addExpense: 'Ajouter une Dépense',
      companyExpenses: 'Dépenses de l\'Entreprise',
      clientExpenses: 'Dépenses des Clients',
      monthlyExpenses: 'Dépenses Mensuelles',
      annualExpenses: 'Dépenses Annuelles',
      totalYearly: 'Total Annuel Projeté',
      serviceName: 'Nom du Service',
      category: 'Catégorie',
      frequency: 'Fréquence',
      renewalDate: 'Date de Renouvellement',
      paymentDate: 'Date de Paiement',
      noExpenses: 'Aucune dépense enregistrée',
      software: 'Logiciel',
      hosting: 'Hébergement',
      domain: 'Domaine',
      api: 'API',
      development: 'Développement',
      ssl: 'SSL',
      maintenanceService: 'Maintenance',
      other: 'Autre',
      paid: 'Payé',
      pending: 'En Attente',
      upcoming: 'Prochain',
      addCompanyExpense: 'Dépense de Syntalys',
      addClientExpense: 'Dépense du Client',
      companyExpensesTab: 'Dépenses de Syntalys',
      clientExpensesTab: 'Dépenses des Clients',
      noMonthlyExpenses: 'Aucune dépense mensuelle enregistrée',
      noAnnualExpenses: 'Aucune dépense annuelle enregistrée',
      noClientsRegistered: 'Aucun client enregistré',
      expensesByClient: 'Dépenses par Client',
      expensesByClientSubtitle: 'Services que les clients utilisent (hébergement, domaines, etc.)',
      theirExpenses: 'Leurs Dépenses',
      theirExpensesSubtitle: 'Services qu\'ils utilisent (hébergement, domaines, APIs, etc.)',
      noClientExpenses: 'Aucune dépense enregistrée',
      totalAnnualProjected: 'Total Annuel Projeté',
      monthlyTimesTwelvePlusAnnual: 'Mensuel × 12 + Annuel',
      services: 'services',
      totalMonthlyExpensesClients: 'Dépenses Mensuelles des Clients',
      totalAnnualExpensesClients: 'Dépenses Annuelles des Clients',
      totalMonthlyCombined: 'Total mensuel combiné',
      totalAnnualCombined: 'Total annuel combiné',
      addCompanyExpenseTitle: 'Ajouter une Dépense de Syntalys',
      addCompanyExpenseSubtitle: 'Enregistrer une dépense de l\'entreprise',
      addClientExpenseTitle: 'Ajouter une Dépense du Client',
      addClientExpenseSubtitle: 'Services que le client utilise (hébergement, domaine, etc.)',
      noCategory: 'Sans catégorie',
      service: 'Service',
      renewal: 'Renouvellement',
      selectClient: 'Sélectionner un client',
      optionalDescription: 'Description optionnelle',
      monthly: 'Mensuel',
      annual: 'Annuel',
      client: 'Client',
    },
    income: {
      title: 'Revenus',
      subtitle: 'Ce que nos clients nous paient',
      addIncome: 'Nouveau Revenu',
      oneTimePayments: 'Paiements Uniques',
      monthlyIncome: 'Revenus Mensuels',
      annualIncome: 'Revenus Annuels',
      projectedAnnual: 'Total Annuel Projeté',
      projectedAnnualSubtitle: 'Récurrent annuel',
      serviceName: 'Nom du Service',
      category: 'Catégorie',
      frequency: 'Fréquence',
      noIncome: 'Aucun revenu enregistré',
      noOneTimePayments: 'Aucun paiement unique enregistré',
      noMonthlyIncome: 'Aucun revenu mensuel enregistré',
      noAnnualIncome: 'Aucun revenu annuel enregistré',
      payments: 'paiements',
      services: 'services',
      webDevelopment: 'Développement Web',
      maintenance: 'Maintenance',
      hosting: 'Hébergement',
      domain: 'Domaine',
      crm: 'CRM',
      subscription: 'Abonnement',
      other: 'Autre',
      client: 'Client',
      service: 'Service',
      paymentDate: 'Date de Paiement',
      renewalDate: 'Date de Renouvellement',
      oneTime: 'Paiement Unique',
      addIncomeTitle: 'Ajouter un Revenu',
      addIncomeSubtitle: 'Enregistrer un revenu d\'un client',
      selectFrequency: 'Sélectionnez une fréquence',
    },
    forms: {
      required: 'obligatoire',
      optional: 'optionnel',
      selectClient: 'Sélectionnez un client',
      selectCategory: 'Sélectionnez une catégorie',
      selectStatus: 'Sélectionnez un statut',
      selectFrequency: 'Sélectionnez une fréquence',
      selectType: 'Sélectionnez un type',
      enterAmount: 'Entrez le montant',
      enterName: 'Entrez le nom',
      enterDescription: 'Entrez une description',
      selectDate: 'Sélectionnez une date',
      notSpecified: 'Non spécifié',
      projectPlaceholder: 'Ex: Développement Web E-commerce',
      descriptionPlaceholder: 'Description du projet...',
      notesPlaceholder: 'Notes supplémentaires...',
      value: 'Valeur',
      dates: 'Dates',
      name: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      companyName: 'Nom de l\'Entreprise',
    },
    messages: {
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer',
      deleteSuccess: 'Supprimé avec succès',
      deleteError: 'Erreur lors de la suppression',
      saveSuccess: 'Enregistré avec succès',
      saveError: 'Erreur lors de l\'enregistrement',
      loadError: 'Erreur lors du chargement des données',
      fillRequired: 'Veuillez remplir les champs obligatoires',
    },
    users: {
      title: 'Utilisateurs',
      subtitle: 'Gérer les utilisateurs du système',
      addUser: 'Ajouter un Utilisateur',
      editUser: 'Modifier l\'Utilisateur',
      deleteUser: 'Supprimer l\'Utilisateur',
      totalUsers: 'Total des Utilisateurs',
      activeUsers: 'Utilisateurs Actifs',
      inactiveUsers: 'Utilisateurs Inactifs',
      fullName: 'Nom Complet',
      email: 'Adresse E-mail',
      phone: 'Téléphone',
      role: 'Rôle',
      active: 'Actif',
      inactive: 'Inactif',
      noUsers: 'Aucun utilisateur enregistré',
      createFirst: 'Créer le premier utilisateur',
      selectRole: 'Sélectionnez un rôle',
      userActive: 'Utilisateur Actif',
      userInactive: 'Utilisateur Inactif',
      superAdmin: 'Super Administrateur',
      admin: 'Administrateur',
      manager: 'Gestionnaire',
      employee: 'Employé',
      roleDescription: 'Description du Rôle',
      superAdminDesc: 'Accès total au système, peut gérer les utilisateurs',
      adminDesc: 'Accès complet sauf gestion des utilisateurs',
      managerDesc: 'Peut gérer clients, projets, dépenses et revenus',
      employeeDesc: 'Accès en lecture seule au tableau de bord',
      addUserTitle: 'Ajouter un Nouvel Utilisateur',
      addUserSubtitle: 'Créer un nouveau compte utilisateur dans le système',
      editUserTitle: 'Modifier l\'Utilisateur',
      passwordPlaceholder: 'Mot de passe (minimum 6 caractères)',
      passwordNote: 'Laisser vide pour conserver le mot de passe actuel',
      emailPlaceholder: 'email@exemple.com',
      namePlaceholder: 'Jean Dupont',
      phonePlaceholder: '+41 xx xxx xx xx',
    },
    stats: {
      title: 'Statistiques',
      subtitle: 'Visualisez et analysez vos données financières avec des graphiques interactifs',
      dataType: 'Type de Données',
      period: 'Période',
      chartType: 'Type de Graphique',
      syntalysExpenses: 'Dépenses Syntalys',
      clientExpenses: 'Dépenses Clients',
      clientIncome: 'Revenus Clients',
      monthly: 'Mensuels',
      annual: 'Annuels',
      oneTime: 'Paiement Unique',
      bars: 'Barres',
      lines: 'Lignes',
      pie: 'Camembert',
      average: 'Moyenne',
      perPeriod: 'Par période',
      records: 'Enregistrements',
      totalOf: 'Total de',
      noDataAvailable: 'Aucune donnée disponible',
      selectFilters: 'Sélectionnez différents filtres ou ajoutez des données dans les sections correspondantes',
    },
  },
};
