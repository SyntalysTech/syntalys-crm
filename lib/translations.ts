// Sistema de traducciones para el CRM Syntalys
// Idiomas soportados: Español (es) y Francés Suizo (fr-CH)

export type Language = 'es' | 'fr';

export interface Translations {
  // Navegación y General
  nav: {
    dashboard: string;
    leads: string;
    activities: string;
    pipeline: string;
    companies: string;
    clients: string;
    projects: string;
    expenses: string;
    income: string;
    stats: string;
    statistics: string;
    passwords: string;
    chatAI: string;
    settings: string;
    users: string;
    reports: string;
    logout: string;
  };

  // Sidebar categories
  sidebar: {
    general: string;
    sales: string;
    business: string;
    finance: string;
    tools: string;
    admin: string;
    syntalys: string;
  };

  // Syntalys internal section
  syntalys: {
    services: string;
    servicesSubtitle: string;
    comingSoon: string;
    underConstruction: string;
    ourServices: string;
    enterpriseServices: string;
    enterpriseSubtitle: string;
    pmeServices: string;
    pmeSubtitle: string;
    addService: string;
    editService: string;
    deleteService: string;
    price: string;
    priceFrom: string;
    commission: string;
    deliveryTime: string;
    available: string;
    discontinued: string;
    fixed: string;
    hourly: string;
    monthly: string;
    custom: string;
    noServices: string;
    createFirst: string;
    featured: string;
    allServices: string;
    filterByCategory: string;
    filterByStatus: string;
    serviceName: string;
    serviceDescription: string;
    icon: string;
    category: string;
    priceMin: string;
    priceMax: string;
    priceType: string;
    priceNote: string;
    commissionPercentage: string;
    commissionNotes: string;
    displayOrder: string;
    isFeatured: string;
    isVisible: string;
  };

  // Leads
  leads: {
    title: string;
    subtitle: string;
    addLead: string;
    editLead: string;
    deleteLead: string;
    deleteConfirm: string;
    // Tabs
    all: string;
    myLeads: string;
    kanban: string;
    // Stats
    totalLeads: string;
    newLeads: string;
    inProgress: string;
    wonLeads: string;
    lostLeads: string;
    conversionRate: string;
    // Fields
    name: string;
    companyName: string;
    email: string;
    phone: string;
    whatsapp: string;
    country: string;
    status: string;
    source: string;
    priority: string;
    temperature: string;
    estimatedValue: string;
    serviceInterested: string;
    firstContactDate: string;
    lastContactDate: string;
    nextFollowup: string;
    contactCount: string;
    notes: string;
    rejectionReason: string;
    assignedTo: string;
    // Status options (estado del lead - qué tan vivo está)
    statusNew: string;
    statusContacted: string;
    statusInterested: string;
    statusQualified: string;
    statusNotQualified: string;
    statusDormant: string;
    // Pipeline stage options (etapa comercial)
    pipelineStage: string;
    stageNone: string;
    stageProposal: string;
    stageNegotiation: string;
    stageDemo: string;
    stageClosing: string;
    stageWon: string;
    stageLost: string;
    // Service interested options
    serviceCallCenter: string;
    serviceAutomations: string;
    serviceChatbot: string;
    serviceVoicebot: string;
    serviceWebDevelopment: string;
    serviceAppDevelopment: string;
    serviceAI: string;
    serviceCRM: string;
    serviceMarketing: string;
    serviceSEO: string;
    serviceOther: string;
    // Pipeline type
    pipelineType: string;
    pipelineCallCenter: string;
    pipelineAutomations: string;
    pipelineChatbot: string;
    pipelineVoicebot: string;
    pipelineGeneral: string;
    allPipelines: string;
    // Source options
    sourceWebsite: string;
    sourceReferral: string;
    sourceSocialMedia: string;
    sourceColdCall: string;
    sourceColdEmail: string;
    sourceEmailCampaign: string;
    sourceEvent: string;
    sourceAdvertising: string;
    sourceLinkedin: string;
    sourceInstagram: string;
    sourceFacebook: string;
    sourceTiktok: string;
    sourceGoogleAds: string;
    sourceReactivated: string;
    sourceOther: string;
    // Priority options
    priorityLow: string;
    priorityMedium: string;
    priorityHigh: string;
    priorityUrgent: string;
    // Temperature options
    tempCold: string;
    tempWarm: string;
    tempHot: string;
    // Activity
    activities: string;
    addActivity: string;
    activityCall: string;
    activityEmail: string;
    activityWhatsapp: string;
    activityMeeting: string;
    activityNote: string;
    activityStatusChange: string;
    outcome: string;
    nextAction: string;
    // Messages
    noLeads: string;
    leadAdded: string;
    leadUpdated: string;
    leadDeleted: string;
    convertToClient: string;
    convertConfirm: string;
    // Filters
    filterByStatus: string;
    filterBySource: string;
    filterByPriority: string;
    filterByTemperature: string;
    allStatuses: string;
    allSources: string;
    allPriorities: string;
    allFollowups: string;
    followupToday: string;
    followupWeek: string;
    followupOverdue: string;
    followupNone: string;
    filterByService: string;
    // Quick actions
    call: string;
    sendWhatsapp: string;
    sendEmail: string;
    scheduleFollowup: string;
    // Pipeline
    pipelineTitle: string;
    pipelineSubtitle: string;
    dragToMove: string;
    emptyColumn: string;
    leadsInColumn: string;
    allServices: string;
    inPipeline: string;
  };

  // Companies (Account View)
  companies: {
    title: string;
    subtitle: string;
    totalCompanies: string;
    activeLeads: string;
    totalValue: string;
    lastActivity: string;
    generalStatus: string;
    viewDetails: string;
    viewLeads: string;
    addNote: string;
    notes: string;
    noNotes: string;
    activitySummary: string;
    noActivity: string;
    leadsCount: string;
    activeLeadsCount: string;
    country: string;
    mainContact: string;
    potentialValue: string;
    noCompanies: string;
    searchPlaceholder: string;
    // Status labels
    statusNegotiation: string;
    statusProposal: string;
    statusInitialContact: string;
    statusQualified: string;
    statusClosed: string;
    statusMixed: string;
    // Filters
    allCountries: string;
    allStatuses: string;
    filterByCountry: string;
    filterByStatus: string;
    // Detail panel
    companyDetails: string;
    leadsList: string;
    recentActivities: string;
    goToLead: string;
    noLeadsInCompany: string;
  };

  // Activities (Setter Agenda)
  activities: {
    title: string;
    subtitle: string;
    newActivity: string;
    editActivity: string;
    // Stats
    todayTasks: string;
    overdueTasks: string;
    thisWeek: string;
    completed: string;
    // Views
    listView: string;
    calendarView: string;
    // Activity types
    typeCall: string;
    typeEmail: string;
    typeMeeting: string;
    typeFollowUp: string;
    typeReminder: string;
    typeDemo: string;
    typeProposal: string;
    typeOther: string;
    allTypes: string;
    // Status
    statusPending: string;
    statusCompleted: string;
    statusOverdue: string;
    statusCancelled: string;
    statusRescheduled: string;
    allStatuses: string;
    // Priority
    priorityLow: string;
    priorityMedium: string;
    priorityHigh: string;
    priorityUrgent: string;
    allPriorities: string;
    // Filters
    filterToday: string;
    filterTomorrow: string;
    filterWeek: string;
    filterMonth: string;
    filterOverdue: string;
    filterAll: string;
    // Form
    activityType: string;
    activityTitle: string;
    titlePlaceholder: string;
    associatedLead: string;
    noLead: string;
    date: string;
    time: string;
    priority: string;
    description: string;
    descriptionPlaceholder: string;
    create: string;
    // Actions
    markComplete: string;
    reschedule: string;
    cancel: string;
    openLead: string;
    scheduleActivity: string;
    // Completion
    completeActivity: string;
    completingTask: string;
    outcome: string;
    outcomePlaceholder: string;
    // Other
    today: string;
    tomorrow: string;
    noActivities: string;
    createFirst: string;
    reschedulePrompt: string;
    deleteConfirm: string;
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
    seeMore: string;
    none: string;
    saveChanges: string;
    type: string;
    client: string;
    clearFilters: string;
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
    // New dashboard
    quickAccess: string;
    calculator: string;
    aiAssistant: string;
    aiAssistantDescription: string;
    openChat: string;
    tip: string;
    tipDescription: string;
    // Motivational section
    dailyMotivation: string;
    bibleProverb: string;
    bibleRadio: string;
    spanish: string;
    french: string;
    playRadio: string;
    stopRadio: string;
    radioLoading: string;
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
    // Invoices
    invoices: string;
    addInvoice: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    invoiceStatus: string;
    invoicePaid: string;
    invoicePending: string;
    invoiceOverdue: string;
    invoiceCancelled: string;
    uploadPdf: string;
    selectPdf: string;
    noInvoices: string;
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
    // Filters
    filterBy: string;
    allProjects: string;
    filterPaid: string;
    filterUnpaid: string;
    filterPartial: string;
    sortBy: string;
    sortAlphabetic: string;
    sortNewest: string;
    sortOldest: string;
    sortAmount: string;
    // Project types
    webDevelopment: string;
    appDevelopment: string;
    gameDevelopment: string;
    ecommerce: string;
    maintenance: string;
    consulting: string;
    design: string;
    marketing: string;
    seo: string;
    hosting: string;
    ai: string;
    chatbot: string;
    automation: string;
    callcenter: string;
    crmProject: string;
    erp: string;
    apiIntegration: string;
    dataAnalytics: string;
    cybersecurity: string;
    cloud: string;
    other: string;
    customType: string;
    // Milestones
    milestones: string;
    addMilestone: string;
    editMilestone: string;
    milestoneName: string;
    milestoneAmount: string;
    milestoneDueDate: string;
    milestonePaidDate: string;
    milestoneStatus: string;
    milestonePaid: string;
    milestonePending: string;
    milestonePartial: string;
    paidAmount: string;
    totalPaid: string;
    remainingAmount: string;
    noMilestones: string;
    noDueDate: string;
    viewProject: string;
    projectDetails: string;
    // Additions
    additions: string;
    addAddition: string;
    editAddition: string;
    additionName: string;
    additionDescription: string;
    additionAmount: string;
    additionStatus: string;
    additionPaid: string;
    additionPending: string;
    noAdditions: string;
    noAmount: string;
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
    // Syntalys Lab
    syntalysLab: string;
    syntalysLabSubtitle: string;
    addInternalProject: string;
    editInternalProject: string;
    noInternalProjects: string;
    createFirstInternal: string;
    statusIdea: string;
    statusInProgress: string;
    statusOnHold: string;
    targetDate: string;
    repositoryUrl: string;
    demoUrl: string;
    clientProjects: string;
    // Email y Web profesional
    hasProfessionalEmail: string;
    professionalEmail: string;
    hasWebsite: string;
    websiteUrl: string;
    // Client type
    clientType: string;
    individual: string;
    company: string;
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
    ia: string;
    cloud: string;
    security: string;
    backup: string;
    analytics: string;
    marketing: string;
    seo: string;
    email: string;
    communications: string;
    storage: string;
    infrastructure: string;
    licenses: string;
    subscriptions: string;
    tools: string;
    automation: string;
    testing: string;
    monitoring: string;
    cdn: string;
    database: string;
    payments: string;
    advertising: string;
    training: string;
    support: string;
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
    totalServices: string;
    monthlyTotal: string;
    annualTotal: string;
    serviceCount: string;
    servicesCount: string;
    perMonth: string;
    perYear: string;
    expensesOf: string;
    noExpensesForClient: string;
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
    oneTime: string;
    oneTimeExpenses: string;
    noOneTimeExpenses: string;
    client: string;
    editExpense: string;
    editCompanyExpenseTitle: string;
    editClientExpenseTitle: string;
    deleteExpenseConfirm: string;
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
    country: string;
    selectCountry: string;
    // Placeholders
    clientNamePlaceholder: string;
    clientNotesPlaceholder: string;
    serviceNamePlaceholder: string;
    internalProjectPlaceholder: string;
    invoiceNumberPlaceholder: string;
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

  // Password Manager
  passwords: {
    title: string;
    subtitle: string;
    addPassword: string;
    addPasswordSubtitle: string;
    editPassword: string;
    totalPasswords: string;
    workAccounts: string;
    personalAccounts: string;
    bankingAccounts: string;
    noPasswords: string;
    createFirst: string;
    searchPlaceholder: string;
    allCategories: string;
    serviceName: string;
    serviceNamePlaceholder: string;
    username: string;
    usernamePlaceholder: string;
    password: string;
    generate: string;
    category: string;
    notesPlaceholder: string;
    copy: string;
    show: string;
    hide: string;
    view: string;
    createdAt: string;
    // Categories
    categoryWork: string;
    categoryPersonal: string;
    categorySocial: string;
    categoryBanking: string;
    categoryEmail: string;
    categoryHosting: string;
    categoryDevelopment: string;
    categoryOther: string;
  };

  // Chat AI
  chatAI: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    thinking: string;
    welcome: string;
    welcomeMessage: string;
    suggestions: string;
    suggestion1: string;
    suggestion2: string;
    suggestion3: string;
    suggestion4: string;
    clearChat: string;
    newChat: string;
    errorMessage: string;
    copyMessage: string;
    copied: string;
    enterToSend: string;
  };

  // Settings
  settings: {
    description: string;
    appearance: string;
    theme: string;
    lightMode: string;
    lightModeDesc: string;
    darkMode: string;
    darkModeDesc: string;
    language: string;
    languageDesc: string;
    spanish: string;
    french: string;
  };

  // Profile
  profile: {
    title: string;
    description: string;
    personalInfo: string;
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailNote: string;
    role: string;
    security: string;
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    passwordRequirements: string;
    passwordMinLength: string;
    profilePicture: string;
    profilePictureDesc: string;
    uploadPhoto: string;
    removePhoto: string;
    saveProfile: string;
    savePassword: string;
    profileUpdated: string;
    passwordUpdated: string;
    passwordMismatch: string;
    currentPasswordRequired: string;
    incorrectPassword: string;
  };
}

export const translations: Record<Language, Translations> = {
  es: {
    nav: {
      dashboard: 'Dashboard',
      leads: 'Leads',
      activities: 'Actividades',
      pipeline: 'Pipeline',
      companies: 'Empresas',
      clients: 'Clientes',
      projects: 'Proyectos',
      expenses: 'Gastos',
      income: 'Ingresos',
      stats: 'Estadísticas',
      statistics: 'Estadísticas',
      passwords: 'Contraseñas',
      chatAI: 'Chat IA',
      settings: 'Ajustes',
      users: 'Usuarios',
      reports: 'Reportes',
      logout: 'Cerrar Sesión',
    },
    sidebar: {
      general: 'General',
      sales: 'Ventas',
      business: 'Negocio',
      finance: 'Finanzas',
      tools: 'Herramientas',
      admin: 'Administración',
      syntalys: 'Syntalys',
    },
    syntalys: {
      services: 'Servicios',
      servicesSubtitle: 'Catalogo de servicios de Syntalys',
      comingSoon: 'Proximamente',
      underConstruction: 'Esta seccion esta en construccion. Pronto podras gestionar los servicios de Syntalys.',
      ourServices: 'Nuestros Servicios',
      enterpriseServices: 'Empresas',
      enterpriseSubtitle: 'Soluciones digitales completas para empresas y grandes cuentas',
      pmeServices: 'PYME e Independientes',
      pmeSubtitle: 'Soluciones disenadas para autonomos, freelances y pequenas empresas',
      addService: 'Nuevo Servicio',
      editService: 'Editar Servicio',
      deleteService: 'Eliminar Servicio',
      price: 'Precio',
      priceFrom: 'Desde',
      commission: 'Comision',
      deliveryTime: 'Tiempo de entrega',
      available: 'Disponible',
      discontinued: 'Descontinuado',
      fixed: 'Fijo',
      hourly: 'Por hora',
      monthly: 'Mensual',
      custom: 'A medida',
      noServices: 'No hay servicios registrados',
      createFirst: 'Crear primer servicio',
      featured: 'Destacado',
      allServices: 'Todos',
      filterByCategory: 'Filtrar por categoria',
      filterByStatus: 'Filtrar por estado',
      serviceName: 'Nombre del servicio',
      serviceDescription: 'Descripcion',
      icon: 'Icono',
      category: 'Categoria',
      priceMin: 'Precio minimo',
      priceMax: 'Precio maximo',
      priceType: 'Tipo de precio',
      priceNote: 'Nota de precio',
      commissionPercentage: 'Porcentaje de comision',
      commissionNotes: 'Notas de comision',
      displayOrder: 'Orden de visualizacion',
      isFeatured: 'Destacado',
      isVisible: 'Visible',
    },
    leads: {
      title: 'Leads',
      subtitle: 'Gestiona tus leads y oportunidades de venta',
      addLead: 'Añadir Lead',
      editLead: 'Editar Lead',
      deleteLead: 'Eliminar Lead',
      deleteConfirm: '¿Estás seguro de que quieres eliminar este lead?',
      all: 'Todos',
      myLeads: 'Mis Leads',
      kanban: 'Kanban',
      totalLeads: 'Total Leads',
      newLeads: 'Nuevos',
      inProgress: 'En Progreso',
      wonLeads: 'Ganados',
      lostLeads: 'Perdidos',
      conversionRate: 'Tasa de Conversión',
      name: 'Nombre',
      companyName: 'Empresa',
      email: 'Email',
      phone: 'Teléfono',
      whatsapp: 'WhatsApp',
      country: 'País',
      status: 'Estado',
      source: 'Fuente',
      priority: 'Prioridad',
      temperature: 'Temperatura',
      estimatedValue: 'Valor Estimado',
      serviceInterested: 'Servicio de Interés',
      firstContactDate: 'Primer Contacto',
      lastContactDate: 'Último Contacto',
      nextFollowup: 'Próximo Seguimiento',
      contactCount: 'Nº Contactos',
      notes: 'Notas',
      rejectionReason: 'Motivo de Rechazo',
      assignedTo: 'Asignado a',
      // Status (estado del lead)
      statusNew: 'Nuevo',
      statusContacted: 'Contactado',
      statusInterested: 'Interesado',
      statusQualified: 'Cualificado',
      statusNotQualified: 'No Cualificado',
      statusDormant: 'Dormido',
      // Pipeline stage (etapa comercial)
      pipelineStage: 'Etapa Pipeline',
      stageNone: 'Sin Pipeline',
      stageProposal: 'Propuesta',
      stageNegotiation: 'Negociación',
      stageDemo: 'Demo',
      stageClosing: 'Cierre',
      stageWon: 'Ganado',
      stageLost: 'Perdido',
      // Service interested
      serviceCallCenter: 'Call Center',
      serviceAutomations: 'Automatizaciones',
      serviceChatbot: 'Chatbot IA',
      serviceVoicebot: 'Voicebot',
      serviceWebDevelopment: 'Desarrollo Web',
      serviceAppDevelopment: 'Desarrollo de Apps',
      serviceAI: 'Inteligencia Artificial',
      serviceCRM: 'CRM',
      serviceMarketing: 'Marketing Digital',
      serviceSEO: 'SEO / Posicionamiento',
      serviceOther: 'Otro',
      // Pipeline type
      pipelineType: 'Tipo de Pipeline',
      pipelineCallCenter: 'Call Center',
      pipelineAutomations: 'Automatizaciones',
      pipelineChatbot: 'Chatbot',
      pipelineVoicebot: 'Voicebot',
      pipelineGeneral: 'General',
      allPipelines: 'Todos los pipelines',
      // Source
      sourceWebsite: 'Sitio Web',
      sourceReferral: 'Referido',
      sourceSocialMedia: 'Redes Sociales',
      sourceColdCall: 'Llamada en Frío',
      sourceColdEmail: 'Email en Frío',
      sourceEmailCampaign: 'Email Marketing',
      sourceEvent: 'Evento',
      sourceAdvertising: 'Publicidad',
      sourceLinkedin: 'LinkedIn',
      sourceInstagram: 'Instagram',
      sourceFacebook: 'Facebook',
      sourceTiktok: 'TikTok',
      sourceGoogleAds: 'Google Ads',
      sourceReactivated: 'Reactivado',
      sourceOther: 'Otro',
      priorityLow: 'Baja',
      priorityMedium: 'Media',
      priorityHigh: 'Alta',
      priorityUrgent: 'Urgente',
      tempCold: 'Frío',
      tempWarm: 'Tibio',
      tempHot: 'Caliente',
      activities: 'Actividades',
      addActivity: 'Añadir Actividad',
      activityCall: 'Llamada',
      activityEmail: 'Email',
      activityWhatsapp: 'WhatsApp',
      activityMeeting: 'Reunión',
      activityNote: 'Nota',
      activityStatusChange: 'Cambio de Estado',
      outcome: 'Resultado',
      nextAction: 'Próxima Acción',
      noLeads: 'No hay leads todavía',
      leadAdded: 'Lead añadido correctamente',
      leadUpdated: 'Lead actualizado correctamente',
      leadDeleted: 'Lead eliminado correctamente',
      convertToClient: 'Convertir a Cliente',
      convertConfirm: '¿Convertir este lead en cliente?',
      filterByStatus: 'Filtrar por estado',
      filterBySource: 'Filtrar por fuente',
      filterByPriority: 'Filtrar por prioridad',
      filterByTemperature: 'Filtrar por temperatura',
      allStatuses: 'Todos los estados',
      allSources: 'Todas las fuentes',
      allPriorities: 'Todas las prioridades',
      allFollowups: 'Todos los seguimientos',
      followupToday: 'Hoy',
      followupWeek: 'Esta semana',
      followupOverdue: 'Vencidos',
      followupNone: 'Sin fecha',
      filterByService: 'Filtrar por servicio...',
      call: 'Llamar',
      sendWhatsapp: 'Enviar WhatsApp',
      sendEmail: 'Enviar Email',
      scheduleFollowup: 'Programar Seguimiento',
      pipelineTitle: 'Pipeline de Ventas',
      pipelineSubtitle: 'Visualiza y gestiona el flujo de tus leads',
      dragToMove: 'Arrastra para mover',
      emptyColumn: 'Sin leads',
      leadsInColumn: 'leads',
      allServices: 'Todos los servicios',
      inPipeline: 'En Pipeline',
    },
    companies: {
      title: 'Empresas',
      subtitle: 'Vista por empresa de todos tus leads y oportunidades',
      totalCompanies: 'Total Empresas',
      activeLeads: 'Leads Activos',
      totalValue: 'Valor Total',
      lastActivity: 'Última Actividad',
      generalStatus: 'Estado General',
      viewDetails: 'Ver Detalles',
      viewLeads: 'Ver Leads',
      addNote: 'Añadir Nota',
      notes: 'Notas de Empresa',
      noNotes: 'Sin notas de empresa',
      activitySummary: 'Resumen de Actividad',
      noActivity: 'Sin actividad registrada',
      leadsCount: 'leads',
      activeLeadsCount: 'activos',
      country: 'País',
      mainContact: 'Contacto Principal',
      potentialValue: 'Valor Potencial',
      noCompanies: 'No hay empresas con leads registrados',
      searchPlaceholder: 'Buscar empresa...',
      statusNegotiation: 'En Negociación',
      statusProposal: 'Con Propuestas',
      statusInitialContact: 'Contacto Inicial',
      statusQualified: 'Cualificados',
      statusClosed: 'Cerrados',
      statusMixed: 'Varios Estados',
      allCountries: 'Todos los países',
      allStatuses: 'Todos los estados',
      filterByCountry: 'País',
      filterByStatus: 'Estado',
      companyDetails: 'Detalles de Empresa',
      leadsList: 'Leads de esta Empresa',
      recentActivities: 'Actividades Recientes',
      goToLead: 'Ir al Lead',
      noLeadsInCompany: 'Esta empresa no tiene leads',
    },
    activities: {
      title: 'Actividades',
      subtitle: 'Gestiona tu agenda de setter',
      newActivity: 'Nueva actividad',
      editActivity: 'Editar actividad',
      todayTasks: 'Hoy',
      overdueTasks: 'Vencidas',
      thisWeek: 'Esta semana',
      completed: 'Completadas',
      listView: 'Lista',
      calendarView: 'Calendario',
      typeCall: 'Llamada',
      typeEmail: 'Email',
      typeMeeting: 'Reunión',
      typeFollowUp: 'Seguimiento',
      typeReminder: 'Recordatorio',
      typeDemo: 'Demo',
      typeProposal: 'Propuesta',
      typeOther: 'Otro',
      allTypes: 'Todos los tipos',
      statusPending: 'Pendiente',
      statusCompleted: 'Completada',
      statusOverdue: 'Vencida',
      statusCancelled: 'Cancelada',
      statusRescheduled: 'Reprogramada',
      allStatuses: 'Todos los estados',
      priorityLow: 'Baja',
      priorityMedium: 'Media',
      priorityHigh: 'Alta',
      priorityUrgent: 'Urgente',
      allPriorities: 'Todas las prioridades',
      filterToday: 'Hoy',
      filterTomorrow: 'Mañana',
      filterWeek: 'Esta semana',
      filterMonth: 'Este mes',
      filterOverdue: 'Vencidas',
      filterAll: 'Todas',
      activityType: 'Tipo de actividad',
      activityTitle: 'Título',
      titlePlaceholder: 'Ej: Llamada de seguimiento',
      associatedLead: 'Lead asociado',
      noLead: 'Sin lead asociado',
      date: 'Fecha',
      time: 'Hora',
      priority: 'Prioridad',
      description: 'Descripción',
      descriptionPlaceholder: 'Notas adicionales...',
      create: 'Crear',
      markComplete: 'Completar',
      reschedule: 'Reprogramar',
      cancel: 'Cancelar',
      openLead: 'Ver lead',
      scheduleActivity: 'Programar actividad',
      completeActivity: 'Completar actividad',
      completingTask: 'Completando',
      outcome: 'Resultado / Notas',
      outcomePlaceholder: '¿Qué resultado tuvo? ¿Próximos pasos?',
      today: 'Hoy',
      tomorrow: 'Mañana',
      noActivities: 'No hay actividades programadas',
      createFirst: 'Crear primera actividad',
      reschedulePrompt: 'Nueva fecha (YYYY-MM-DD):',
      deleteConfirm: '¿Eliminar esta actividad?',
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
      seeMore: 'Ver más',
      none: 'Sin',
      saveChanges: 'Guardar Cambios',
      type: 'Tipo',
      client: 'Cliente',
      clearFilters: 'Limpiar filtros',
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
      quickAccess: 'Acceso Rápido',
      calculator: 'Calculadora',
      aiAssistant: 'Asistente IA',
      aiAssistantDescription: 'Pregúntale cualquier cosa sobre tu negocio, clientes, gastos o ingresos. Tu asistente personal está aquí para ayudarte.',
      openChat: 'Abrir Chat',
      tip: 'Consejo del día',
      tipDescription: 'Utiliza la página de Estadísticas para ver gráficos detallados de tus ingresos, gastos y beneficios. Puedes filtrar por período y tipo de datos.',
      dailyMotivation: 'Frase del día',
      bibleProverb: 'Proverbio Bíblico',
      bibleRadio: 'Radio Bíblica',
      spanish: 'Español',
      french: 'Francés',
      playRadio: 'Reproducir',
      stopRadio: 'Detener',
      radioLoading: 'Cargando...',
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
      invoices: 'Facturas',
      addInvoice: 'Añadir Factura',
      invoiceNumber: 'Número de Factura',
      issueDate: 'Fecha de emisión',
      dueDate: 'Fecha de vencimiento',
      invoiceStatus: 'Estado de la factura',
      invoicePaid: 'Pagada',
      invoicePending: 'Pendiente',
      invoiceOverdue: 'Vencida',
      invoiceCancelled: 'Cancelada',
      uploadPdf: 'Subir PDF',
      selectPdf: 'Seleccionar archivo PDF',
      noInvoices: 'No hay facturas registradas',
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
      filterBy: 'Filtrar por',
      allProjects: 'Todos',
      filterPaid: 'Pagados',
      filterUnpaid: 'No pagados',
      filterPartial: 'Pago parcial',
      sortBy: 'Ordenar por',
      sortAlphabetic: 'Alfabético',
      sortNewest: 'Más recientes',
      sortOldest: 'Más antiguos',
      sortAmount: 'Monto',
      webDevelopment: 'Desarrollo Web',
      appDevelopment: 'Desarrollo de Apps',
      gameDevelopment: 'Desarrollo de Juegos',
      ecommerce: 'E-commerce',
      maintenance: 'Mantenimiento',
      consulting: 'Consultoría',
      design: 'Diseño',
      marketing: 'Marketing Digital',
      seo: 'SEO / Posicionamiento',
      hosting: 'Hosting',
      ai: 'Inteligencia Artificial',
      chatbot: 'Chatbot',
      automation: 'Automatización',
      callcenter: 'Call Center',
      crmProject: 'CRM',
      erp: 'ERP',
      apiIntegration: 'Integración API',
      dataAnalytics: 'Análisis de Datos',
      cybersecurity: 'Ciberseguridad',
      cloud: 'Cloud / Nube',
      other: 'Otro',
      customType: 'Especificar tipo',
      milestones: 'Hitos de Pago',
      addMilestone: 'Añadir Hito',
      editMilestone: 'Editar Hito',
      milestoneName: 'Nombre del Hito',
      milestoneAmount: 'Monto del Hito',
      milestoneDueDate: 'Fecha de Vencimiento',
      milestonePaidDate: 'Fecha de Pago',
      milestoneStatus: 'Estado del Pago',
      milestonePaid: 'Pagado',
      milestonePending: 'Pendiente',
      milestonePartial: 'Pago Parcial',
      paidAmount: 'Monto Pagado',
      totalPaid: 'Total Pagado',
      remainingAmount: 'Monto Restante',
      noMilestones: 'No hay hitos registrados',
      noDueDate: 'Sin fecha de vencimiento',
      viewProject: 'Ver Proyecto',
      projectDetails: 'Detalles del Proyecto',
      additions: 'Modificaciones / Extras',
      addAddition: 'Añadir Modificación',
      editAddition: 'Editar Modificación',
      additionName: 'Nombre de la modificación',
      additionDescription: 'Descripción',
      additionAmount: 'Monto (opcional)',
      additionStatus: 'Estado del pago',
      additionPaid: 'Pagado',
      additionPending: 'Pendiente',
      noAdditions: 'No hay modificaciones registradas',
      noAmount: 'Sin monto',
      statusActive: 'Activo',
      statusCompleted: 'Completado',
      statusPaused: 'En Espera',
      statusCancelled: 'Cancelado',
      oneTime: 'Pago Único',
      monthly: 'Mensual',
      annual: 'Anual',
      milestone: 'Por Hito',
      // Syntalys Lab
      syntalysLab: 'Syntalys Lab',
      syntalysLabSubtitle: 'Proyectos internos e ideas de Syntalys',
      addInternalProject: 'Nuevo Proyecto Interno',
      editInternalProject: 'Editar Proyecto Interno',
      noInternalProjects: 'No hay proyectos internos registrados',
      createFirstInternal: 'Crear primer proyecto interno',
      statusIdea: 'Idea',
      statusInProgress: 'En Progreso',
      statusOnHold: 'En Espera',
      targetDate: 'Fecha Objetivo',
      repositoryUrl: 'URL del Repositorio',
      demoUrl: 'URL Demo',
      clientProjects: 'Proyectos de Clientes',
      hasProfessionalEmail: 'Tiene email profesional',
      professionalEmail: 'Email Profesional',
      hasWebsite: 'Tiene página web',
      websiteUrl: 'URL de la Web',
      clientType: 'Tipo de Cliente',
      individual: 'Particular',
      company: 'Empresa',
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
      ia: 'IA / Inteligencia Artificial',
      cloud: 'Cloud / Computación en la Nube',
      security: 'Seguridad',
      backup: 'Copias de Seguridad',
      analytics: 'Análisis / Analytics',
      marketing: 'Marketing',
      seo: 'SEO',
      email: 'Email / Correo',
      communications: 'Comunicaciones',
      storage: 'Almacenamiento',
      infrastructure: 'Infraestructura',
      licenses: 'Licencias',
      subscriptions: 'Suscripciones',
      tools: 'Herramientas',
      automation: 'Automatización',
      testing: 'Testing / Pruebas',
      monitoring: 'Monitoreo',
      cdn: 'CDN',
      database: 'Base de Datos',
      payments: 'Procesamiento de Pagos',
      advertising: 'Publicidad',
      training: 'Formación / Capacitación',
      support: 'Soporte Técnico',
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
      totalServices: 'Servicios',
      monthlyTotal: 'Total Mensual',
      annualTotal: 'Total Anual',
      serviceCount: 'servicio',
      servicesCount: 'servicios',
      perMonth: '/mes',
      perYear: '/año',
      expensesOf: 'Gastos de',
      noExpensesForClient: 'Este cliente no tiene gastos registrados',
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
      oneTime: 'Pago Único',
      oneTimeExpenses: 'Gastos Únicos',
      noOneTimeExpenses: 'No hay gastos únicos registrados',
      client: 'Cliente',
      editExpense: 'Editar Gasto',
      editCompanyExpenseTitle: 'Editar Gasto de Syntalys',
      editClientExpenseTitle: 'Editar Gasto del Cliente',
      deleteExpenseConfirm: '¿Estás seguro de que quieres eliminar este gasto?',
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
      country: 'País',
      selectCountry: 'Selecciona un país',
      clientNamePlaceholder: 'Ej: Juan Pérez',
      clientNotesPlaceholder: 'Notas adicionales sobre el cliente',
      serviceNamePlaceholder: 'Ej: Claude Max, Vercel Pro...',
      internalProjectPlaceholder: 'Ej: CRM Syntalys, App Interna...',
      invoiceNumberPlaceholder: 'FAC-001',
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
    passwords: {
      title: 'Gestor de Contraseñas',
      subtitle: 'Administra tus cuentas y contraseñas de forma segura',
      addPassword: 'Agregar Contraseña',
      addPasswordSubtitle: 'Guarda una nueva cuenta de forma segura',
      editPassword: 'Editar Contraseña',
      totalPasswords: 'Total de Contraseñas',
      workAccounts: 'Cuentas de Trabajo',
      personalAccounts: 'Cuentas Personales',
      bankingAccounts: 'Cuentas Bancarias',
      noPasswords: 'No hay contraseñas guardadas aún',
      createFirst: 'Agregar primera contraseña',
      searchPlaceholder: 'Buscar por servicio, usuario o email...',
      allCategories: 'Todas las categorías',
      serviceName: 'Nombre del Servicio',
      serviceNamePlaceholder: 'Ej: Google, Netflix, Banco...',
      username: 'Usuario',
      usernamePlaceholder: 'Tu nombre de usuario',
      password: 'Contraseña',
      generate: 'Generar',
      category: 'Categoría',
      notesPlaceholder: 'Notas adicionales sobre esta cuenta...',
      copy: 'Copiar',
      show: 'Mostrar',
      hide: 'Ocultar',
      view: 'Ver',
      createdAt: 'Creado el',
      categoryWork: 'Trabajo',
      categoryPersonal: 'Personal',
      categorySocial: 'Redes Sociales',
      categoryBanking: 'Banca',
      categoryEmail: 'Email',
      categoryHosting: 'Hosting',
      categoryDevelopment: 'Desarrollo',
      categoryOther: 'Otro',
    },
    chatAI: {
      title: 'Chat IA',
      subtitle: 'Asistente inteligente para tu negocio',
      placeholder: 'Escribe tu mensaje aquí...',
      send: 'Enviar',
      thinking: 'Pensando...',
      welcome: '¡Hola! Soy tu asistente IA',
      welcomeMessage: 'Estoy aquí para ayudarte con cualquier pregunta sobre tu negocio, clientes, finanzas o cualquier cosa que necesites. ¿En qué puedo ayudarte hoy?',
      suggestions: 'Sugerencias rápidas',
      suggestion1: '¿Cuál es el estado de mis finanzas?',
      suggestion2: '¿Cómo puedo mejorar mis ingresos?',
      suggestion3: 'Genera un resumen de mis clientes',
      suggestion4: '¿Qué gastos puedo optimizar?',
      clearChat: 'Limpiar chat',
      newChat: 'Nuevo chat',
      errorMessage: 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.',
      copyMessage: 'Copiar mensaje',
      copied: 'Copiado',
      enterToSend: 'Presiona Enter para enviar, Shift+Enter para nueva línea',
    },
    settings: {
      description: 'Configura las preferencias de tu cuenta',
      appearance: 'Apariencia',
      theme: 'Tema',
      lightMode: 'Modo Claro',
      lightModeDesc: 'Fondo blanco, texto oscuro',
      darkMode: 'Modo Oscuro',
      darkModeDesc: 'Fondo oscuro, texto claro',
      language: 'Idioma',
      languageDesc: 'Selecciona el idioma de la interfaz',
      spanish: 'Español',
      french: 'Français',
    },
    profile: {
      title: 'Mi Perfil',
      description: 'Gestiona tu información personal y seguridad',
      personalInfo: 'Información Personal',
      fullName: 'Nombre Completo',
      fullNamePlaceholder: 'Tu nombre completo',
      email: 'Correo Electrónico',
      emailNote: 'El correo no se puede cambiar',
      role: 'Rol',
      security: 'Seguridad',
      changePassword: 'Cambiar Contraseña',
      currentPassword: 'Contraseña Actual',
      newPassword: 'Nueva Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      passwordRequirements: 'Requisitos de contraseña',
      passwordMinLength: 'Mínimo 6 caracteres',
      profilePicture: 'Foto de Perfil',
      profilePictureDesc: 'Sube una foto para personalizar tu perfil',
      uploadPhoto: 'Subir Foto',
      removePhoto: 'Eliminar Foto',
      saveProfile: 'Guardar Perfil',
      savePassword: 'Cambiar Contraseña',
      profileUpdated: 'Perfil actualizado correctamente',
      passwordUpdated: 'Contraseña actualizada correctamente',
      passwordMismatch: 'Las contraseñas no coinciden',
      currentPasswordRequired: 'Debes ingresar tu contraseña actual',
      incorrectPassword: 'La contraseña actual es incorrecta',
    },
  },
  fr: {
    nav: {
      dashboard: 'Tableau de bord',
      leads: 'Leads',
      activities: 'Activités',
      pipeline: 'Pipeline',
      companies: 'Entreprises',
      clients: 'Clients',
      projects: 'Projets',
      expenses: 'Dépenses',
      income: 'Revenus',
      stats: 'Statistiques',
      statistics: 'Statistiques',
      passwords: 'Mots de passe',
      chatAI: 'Chat IA',
      settings: 'Paramètres',
      users: 'Utilisateurs',
      reports: 'Rapports',
      logout: 'Déconnexion',
    },
    sidebar: {
      general: 'Général',
      sales: 'Ventes',
      business: 'Affaires',
      finance: 'Finances',
      tools: 'Outils',
      admin: 'Administration',
      syntalys: 'Syntalys',
    },
    syntalys: {
      services: 'Services',
      servicesSubtitle: 'Catalogue des services Syntalys',
      comingSoon: 'Prochainement',
      underConstruction: 'Cette section est en construction. Bientot vous pourrez gerer les services de Syntalys.',
      ourServices: 'Nos Services',
      enterpriseServices: 'Entreprises',
      enterpriseSubtitle: 'Solutions numeriques completes pour les entreprises et grands comptes',
      pmeServices: 'PME et Independants',
      pmeSubtitle: 'Solutions concues pour les independants, freelances et petites entreprises',
      addService: 'Nouveau Service',
      editService: 'Modifier Service',
      deleteService: 'Supprimer Service',
      price: 'Prix',
      priceFrom: 'A partir de',
      commission: 'Commission',
      deliveryTime: 'Delai de livraison',
      available: 'Disponible',
      discontinued: 'Discontinue',
      fixed: 'Fixe',
      hourly: 'Horaire',
      monthly: 'Mensuel',
      custom: 'Sur mesure',
      noServices: 'Aucun service enregistre',
      createFirst: 'Creer le premier service',
      featured: 'En vedette',
      allServices: 'Tous',
      filterByCategory: 'Filtrer par categorie',
      filterByStatus: 'Filtrer par statut',
      serviceName: 'Nom du service',
      serviceDescription: 'Description',
      icon: 'Icone',
      category: 'Categorie',
      priceMin: 'Prix minimum',
      priceMax: 'Prix maximum',
      priceType: 'Type de prix',
      priceNote: 'Note de prix',
      commissionPercentage: 'Pourcentage de commission',
      commissionNotes: 'Notes de commission',
      displayOrder: 'Ordre d\'affichage',
      isFeatured: 'En vedette',
      isVisible: 'Visible',
    },
    leads: {
      title: 'Leads',
      subtitle: 'Gerez vos leads et opportunites de vente',
      addLead: 'Ajouter Lead',
      editLead: 'Modifier Lead',
      deleteLead: 'Supprimer Lead',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce lead?',
      all: 'Tous',
      myLeads: 'Mes Leads',
      kanban: 'Kanban',
      totalLeads: 'Total Leads',
      newLeads: 'Nouveaux',
      inProgress: 'En Cours',
      wonLeads: 'Gagnés',
      lostLeads: 'Perdus',
      conversionRate: 'Taux de Conversion',
      name: 'Nom',
      companyName: 'Entreprise',
      email: 'Email',
      phone: 'Téléphone',
      whatsapp: 'WhatsApp',
      country: 'Pays',
      status: 'Statut',
      source: 'Source',
      priority: 'Priorité',
      temperature: 'Température',
      estimatedValue: 'Valeur Estimée',
      serviceInterested: 'Service d\'Intérêt',
      firstContactDate: 'Premier Contact',
      lastContactDate: 'Dernier Contact',
      nextFollowup: 'Prochain Suivi',
      contactCount: 'Nº Contacts',
      notes: 'Notes',
      rejectionReason: 'Motif de Rejet',
      assignedTo: 'Assigné à',
      statusNew: 'Nouveau',
      statusContacted: 'Contacté',
      // Status (état du lead)
      statusInterested: 'Intéressé',
      statusQualified: 'Qualifié',
      statusNotQualified: 'Non Qualifié',
      statusDormant: 'Dormant',
      // Pipeline stage (étape commerciale)
      pipelineStage: 'Étape Pipeline',
      stageNone: 'Sans Pipeline',
      stageProposal: 'Proposition',
      stageNegotiation: 'Négociation',
      stageDemo: 'Démo',
      stageClosing: 'Clôture',
      stageWon: 'Gagné',
      stageLost: 'Perdu',
      // Service interested
      serviceCallCenter: 'Centre d\'Appels',
      serviceAutomations: 'Automatisations',
      serviceChatbot: 'Chatbot IA',
      serviceVoicebot: 'Voicebot',
      serviceWebDevelopment: 'Développement Web',
      serviceAppDevelopment: 'Développement d\'Apps',
      serviceAI: 'Intelligence Artificielle',
      serviceCRM: 'CRM',
      serviceMarketing: 'Marketing Digital',
      serviceSEO: 'SEO / Référencement',
      serviceOther: 'Autre',
      // Pipeline type
      pipelineType: 'Type de Pipeline',
      pipelineCallCenter: 'Centre d\'Appels',
      pipelineAutomations: 'Automatisations',
      pipelineChatbot: 'Chatbot',
      pipelineVoicebot: 'Voicebot',
      pipelineGeneral: 'Général',
      allPipelines: 'Tous les pipelines',
      // Source
      sourceWebsite: 'Site Web',
      sourceReferral: 'Référence',
      sourceSocialMedia: 'Réseaux Sociaux',
      sourceColdCall: 'Appel à Froid',
      sourceColdEmail: 'Email à Froid',
      sourceEmailCampaign: 'Email Marketing',
      sourceEvent: 'Événement',
      sourceAdvertising: 'Publicité',
      sourceLinkedin: 'LinkedIn',
      sourceInstagram: 'Instagram',
      sourceFacebook: 'Facebook',
      sourceTiktok: 'TikTok',
      sourceGoogleAds: 'Google Ads',
      sourceReactivated: 'Réactivé',
      sourceOther: 'Autre',
      priorityLow: 'Basse',
      priorityMedium: 'Moyenne',
      priorityHigh: 'Haute',
      priorityUrgent: 'Urgente',
      tempCold: 'Froid',
      tempWarm: 'Tiède',
      tempHot: 'Chaud',
      activities: 'Activités',
      addActivity: 'Ajouter Activité',
      activityCall: 'Appel',
      activityEmail: 'Email',
      activityWhatsapp: 'WhatsApp',
      activityMeeting: 'Réunion',
      activityNote: 'Note',
      activityStatusChange: 'Changement de Statut',
      outcome: 'Résultat',
      nextAction: 'Prochaine Action',
      noLeads: 'Aucun lead pour le moment',
      leadAdded: 'Lead ajouté avec succès',
      leadUpdated: 'Lead mis à jour avec succès',
      leadDeleted: 'Lead supprimé avec succès',
      convertToClient: 'Convertir en Client',
      convertConfirm: 'Convertir ce lead en client?',
      filterByStatus: 'Filtrer par statut',
      filterBySource: 'Filtrer par source',
      filterByPriority: 'Filtrer par priorité',
      filterByTemperature: 'Filtrer par température',
      allStatuses: 'Tous les statuts',
      allSources: 'Toutes les sources',
      allPriorities: 'Toutes les priorités',
      allFollowups: 'Tous les suivis',
      followupToday: "Aujourd'hui",
      followupWeek: 'Cette semaine',
      followupOverdue: 'En retard',
      followupNone: 'Sans date',
      filterByService: 'Filtrer par service...',
      call: 'Appeler',
      sendWhatsapp: 'Envoyer WhatsApp',
      sendEmail: 'Envoyer Email',
      scheduleFollowup: 'Planifier Suivi',
      pipelineTitle: 'Pipeline de Ventes',
      pipelineSubtitle: 'Visualisez et gérez le flux de vos leads',
      dragToMove: 'Glissez pour déplacer',
      emptyColumn: 'Aucun lead',
      leadsInColumn: 'leads',
      allServices: 'Tous les services',
      inPipeline: 'En Pipeline',
    },
    companies: {
      title: 'Entreprises',
      subtitle: 'Vue par entreprise de tous vos leads et opportunités',
      totalCompanies: 'Total Entreprises',
      activeLeads: 'Leads Actifs',
      totalValue: 'Valeur Totale',
      lastActivity: 'Dernière Activité',
      generalStatus: 'Statut Général',
      viewDetails: 'Voir les Détails',
      viewLeads: 'Voir les Leads',
      addNote: 'Ajouter une Note',
      notes: 'Notes d\'Entreprise',
      noNotes: 'Aucune note d\'entreprise',
      activitySummary: 'Résumé d\'Activité',
      noActivity: 'Aucune activité enregistrée',
      leadsCount: 'leads',
      activeLeadsCount: 'actifs',
      country: 'Pays',
      mainContact: 'Contact Principal',
      potentialValue: 'Valeur Potentielle',
      noCompanies: 'Aucune entreprise avec des leads enregistrés',
      searchPlaceholder: 'Rechercher une entreprise...',
      statusNegotiation: 'En Négociation',
      statusProposal: 'Avec Propositions',
      statusInitialContact: 'Contact Initial',
      statusQualified: 'Qualifiés',
      statusClosed: 'Fermés',
      statusMixed: 'Statuts Divers',
      allCountries: 'Tous les pays',
      allStatuses: 'Tous les statuts',
      filterByCountry: 'Pays',
      filterByStatus: 'Statut',
      companyDetails: 'Détails de l\'Entreprise',
      leadsList: 'Leads de cette Entreprise',
      recentActivities: 'Activités Récentes',
      goToLead: 'Aller au Lead',
      noLeadsInCompany: 'Cette entreprise n\'a pas de leads',
    },
    activities: {
      title: 'Activités',
      subtitle: 'Gérez votre agenda de setter',
      newActivity: 'Nouvelle activité',
      editActivity: 'Modifier l\'activité',
      todayTasks: 'Aujourd\'hui',
      overdueTasks: 'En retard',
      thisWeek: 'Cette semaine',
      completed: 'Complétées',
      listView: 'Liste',
      calendarView: 'Calendrier',
      typeCall: 'Appel',
      typeEmail: 'Email',
      typeMeeting: 'Réunion',
      typeFollowUp: 'Suivi',
      typeReminder: 'Rappel',
      typeDemo: 'Démo',
      typeProposal: 'Proposition',
      typeOther: 'Autre',
      allTypes: 'Tous les types',
      statusPending: 'En attente',
      statusCompleted: 'Complétée',
      statusOverdue: 'En retard',
      statusCancelled: 'Annulée',
      statusRescheduled: 'Reprogrammée',
      allStatuses: 'Tous les statuts',
      priorityLow: 'Basse',
      priorityMedium: 'Moyenne',
      priorityHigh: 'Haute',
      priorityUrgent: 'Urgente',
      allPriorities: 'Toutes les priorités',
      filterToday: 'Aujourd\'hui',
      filterTomorrow: 'Demain',
      filterWeek: 'Cette semaine',
      filterMonth: 'Ce mois',
      filterOverdue: 'En retard',
      filterAll: 'Toutes',
      activityType: 'Type d\'activité',
      activityTitle: 'Titre',
      titlePlaceholder: 'Ex: Appel de suivi',
      associatedLead: 'Lead associé',
      noLead: 'Aucun lead associé',
      date: 'Date',
      time: 'Heure',
      priority: 'Priorité',
      description: 'Description',
      descriptionPlaceholder: 'Notes supplémentaires...',
      create: 'Créer',
      markComplete: 'Terminer',
      reschedule: 'Reprogrammer',
      cancel: 'Annuler',
      openLead: 'Voir lead',
      scheduleActivity: 'Programmer activité',
      completeActivity: 'Terminer l\'activité',
      completingTask: 'Terminer',
      outcome: 'Résultat / Notes',
      outcomePlaceholder: 'Quel résultat? Prochaines étapes?',
      today: 'Aujourd\'hui',
      tomorrow: 'Demain',
      noActivities: 'Aucune activité programmée',
      createFirst: 'Créer première activité',
      reschedulePrompt: 'Nouvelle date (AAAA-MM-JJ):',
      deleteConfirm: 'Supprimer cette activité?',
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
      seeMore: 'Voir plus',
      none: 'Sans',
      saveChanges: 'Enregistrer les Modifications',
      type: 'Type',
      client: 'Client',
      clearFilters: 'Effacer les filtres',
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
      quickAccess: 'Accès Rapide',
      calculator: 'Calculatrice',
      aiAssistant: 'Assistant IA',
      aiAssistantDescription: 'Posez-lui n\'importe quelle question sur votre entreprise, clients, dépenses ou revenus. Votre assistant personnel est là pour vous aider.',
      openChat: 'Ouvrir le Chat',
      tip: 'Conseil du jour',
      tipDescription: 'Utilisez la page Statistiques pour voir des graphiques détaillés de vos revenus, dépenses et bénéfices. Vous pouvez filtrer par période et type de données.',
      dailyMotivation: 'Phrase du jour',
      bibleProverb: 'Proverbe Biblique',
      bibleRadio: 'Radio Biblique',
      spanish: 'Espagnol',
      french: 'Français',
      playRadio: 'Lecture',
      stopRadio: 'Arrêter',
      radioLoading: 'Chargement...',
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
      invoices: 'Factures',
      addInvoice: 'Ajouter une Facture',
      invoiceNumber: 'Numéro de Facture',
      issueDate: 'Date d\'émission',
      dueDate: 'Date d\'échéance',
      invoiceStatus: 'Statut de la facture',
      invoicePaid: 'Payée',
      invoicePending: 'En attente',
      invoiceOverdue: 'En retard',
      invoiceCancelled: 'Annulée',
      uploadPdf: 'Télécharger PDF',
      selectPdf: 'Sélectionner un fichier PDF',
      noInvoices: 'Aucune facture enregistrée',
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
      filterBy: 'Filtrer par',
      allProjects: 'Tous',
      filterPaid: 'Payés',
      filterUnpaid: 'Non payés',
      filterPartial: 'Paiement partiel',
      sortBy: 'Trier par',
      sortAlphabetic: 'Alphabétique',
      sortNewest: 'Plus récents',
      sortOldest: 'Plus anciens',
      sortAmount: 'Montant',
      webDevelopment: 'Développement Web',
      appDevelopment: 'Développement d\'Apps',
      gameDevelopment: 'Développement de Jeux',
      ecommerce: 'E-commerce',
      maintenance: 'Maintenance',
      consulting: 'Conseil',
      design: 'Design',
      marketing: 'Marketing Digital',
      seo: 'SEO / Référencement',
      hosting: 'Hébergement',
      ai: 'Intelligence Artificielle',
      chatbot: 'Chatbot',
      automation: 'Automatisation',
      callcenter: 'Centre d\'Appels',
      crmProject: 'CRM',
      erp: 'ERP',
      apiIntegration: 'Intégration API',
      dataAnalytics: 'Analyse de Données',
      cybersecurity: 'Cybersécurité',
      cloud: 'Cloud',
      other: 'Autre',
      customType: 'Spécifier le type',
      milestones: 'Jalons de Paiement',
      addMilestone: 'Ajouter un Jalon',
      editMilestone: 'Modifier le Jalon',
      milestoneName: 'Nom du Jalon',
      milestoneAmount: 'Montant du Jalon',
      milestoneDueDate: 'Date d\'Échéance',
      milestonePaidDate: 'Date de Paiement',
      milestoneStatus: 'Statut du Paiement',
      milestonePaid: 'Payé',
      milestonePending: 'En Attente',
      milestonePartial: 'Paiement Partiel',
      paidAmount: 'Montant Payé',
      totalPaid: 'Total Payé',
      remainingAmount: 'Montant Restant',
      noMilestones: 'Aucun jalon enregistré',
      noDueDate: 'Sans date d\'échéance',
      viewProject: 'Voir le Projet',
      projectDetails: 'Détails du Projet',
      additions: 'Modifications / Extras',
      addAddition: 'Ajouter une Modification',
      editAddition: 'Modifier',
      additionName: 'Nom de la modification',
      additionDescription: 'Description',
      additionAmount: 'Montant (optionnel)',
      additionStatus: 'Statut du paiement',
      additionPaid: 'Payé',
      additionPending: 'En Attente',
      noAdditions: 'Aucune modification enregistrée',
      noAmount: 'Sans montant',
      statusActive: 'Actif',
      statusCompleted: 'Terminé',
      statusPaused: 'En Attente',
      statusCancelled: 'Annulé',
      oneTime: 'Paiement Unique',
      monthly: 'Mensuel',
      annual: 'Annuel',
      milestone: 'Par Jalon',
      // Syntalys Lab
      syntalysLab: 'Syntalys Lab',
      syntalysLabSubtitle: 'Projets internes et idées de Syntalys',
      addInternalProject: 'Nouveau Projet Interne',
      editInternalProject: 'Modifier le Projet Interne',
      noInternalProjects: 'Aucun projet interne enregistré',
      createFirstInternal: 'Créer le premier projet interne',
      statusIdea: 'Idée',
      statusInProgress: 'En Cours',
      statusOnHold: 'En Attente',
      targetDate: 'Date Cible',
      repositoryUrl: 'URL du Dépôt',
      demoUrl: 'URL Démo',
      clientProjects: 'Projets Clients',
      hasProfessionalEmail: 'A un email professionnel',
      professionalEmail: 'Email Professionnel',
      hasWebsite: 'A un site web',
      websiteUrl: 'URL du Site Web',
      clientType: 'Type de Client',
      individual: 'Particulier',
      company: 'Entreprise',
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
      ia: 'IA / Intelligence Artificielle',
      cloud: 'Cloud / Informatique en Nuage',
      security: 'Sécurité',
      backup: 'Sauvegardes',
      analytics: 'Analyse / Analytics',
      marketing: 'Marketing',
      seo: 'SEO',
      email: 'Email / Courrier',
      communications: 'Communications',
      storage: 'Stockage',
      infrastructure: 'Infrastructure',
      licenses: 'Licences',
      subscriptions: 'Abonnements',
      tools: 'Outils',
      automation: 'Automatisation',
      testing: 'Tests / QA',
      monitoring: 'Surveillance',
      cdn: 'CDN',
      database: 'Base de Données',
      payments: 'Traitement des Paiements',
      advertising: 'Publicité',
      training: 'Formation / Entraînement',
      support: 'Support Technique',
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
      totalServices: 'Services',
      monthlyTotal: 'Total Mensuel',
      annualTotal: 'Total Annuel',
      serviceCount: 'service',
      servicesCount: 'services',
      perMonth: '/mois',
      perYear: '/an',
      expensesOf: 'Dépenses de',
      noExpensesForClient: 'Ce client n\'a pas de dépenses enregistrées',
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
      oneTime: 'Paiement Unique',
      oneTimeExpenses: 'Dépenses Uniques',
      noOneTimeExpenses: 'Aucune dépense unique enregistrée',
      client: 'Client',
      editExpense: 'Modifier la Dépense',
      editCompanyExpenseTitle: 'Modifier la Dépense de Syntalys',
      editClientExpenseTitle: 'Modifier la Dépense du Client',
      deleteExpenseConfirm: 'Êtes-vous sûr de vouloir supprimer cette dépense?',
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
      country: 'Pays',
      selectCountry: 'Sélectionnez un pays',
      clientNamePlaceholder: 'Ex: Jean Dupont',
      clientNotesPlaceholder: 'Notes supplémentaires sur le client',
      serviceNamePlaceholder: 'Ex: Claude Max, Vercel Pro...',
      internalProjectPlaceholder: 'Ex: CRM Syntalys, App Interne...',
      invoiceNumberPlaceholder: 'FAC-001',
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
    passwords: {
      title: 'Gestionnaire de Mots de Passe',
      subtitle: 'Gérez vos comptes et mots de passe en toute sécurité',
      addPassword: 'Ajouter un Mot de Passe',
      addPasswordSubtitle: 'Enregistrer un nouveau compte en toute sécurité',
      editPassword: 'Modifier le Mot de Passe',
      totalPasswords: 'Total des Mots de Passe',
      workAccounts: 'Comptes Professionnels',
      personalAccounts: 'Comptes Personnels',
      bankingAccounts: 'Comptes Bancaires',
      noPasswords: 'Aucun mot de passe enregistré pour le moment',
      createFirst: 'Ajouter le premier mot de passe',
      searchPlaceholder: 'Rechercher par service, utilisateur ou email...',
      allCategories: 'Toutes les catégories',
      serviceName: 'Nom du Service',
      serviceNamePlaceholder: 'Ex: Google, Netflix, Banque...',
      username: 'Nom d\'utilisateur',
      usernamePlaceholder: 'Votre nom d\'utilisateur',
      password: 'Mot de passe',
      generate: 'Générer',
      category: 'Catégorie',
      notesPlaceholder: 'Notes supplémentaires sur ce compte...',
      copy: 'Copier',
      show: 'Afficher',
      hide: 'Masquer',
      view: 'Voir',
      createdAt: 'Créé le',
      categoryWork: 'Travail',
      categoryPersonal: 'Personnel',
      categorySocial: 'Réseaux Sociaux',
      categoryBanking: 'Banque',
      categoryEmail: 'Email',
      categoryHosting: 'Hébergement',
      categoryDevelopment: 'Développement',
      categoryOther: 'Autre',
    },
    chatAI: {
      title: 'Chat IA',
      subtitle: 'Assistant intelligent pour votre entreprise',
      placeholder: 'Écrivez votre message ici...',
      send: 'Envoyer',
      thinking: 'Réflexion...',
      welcome: 'Bonjour! Je suis votre assistant IA',
      welcomeMessage: 'Je suis là pour vous aider avec toutes vos questions concernant votre entreprise, clients, finances ou tout ce dont vous avez besoin. Comment puis-je vous aider aujourd\'hui?',
      suggestions: 'Suggestions rapides',
      suggestion1: 'Quel est l\'état de mes finances?',
      suggestion2: 'Comment puis-je améliorer mes revenus?',
      suggestion3: 'Génère un résumé de mes clients',
      suggestion4: 'Quelles dépenses puis-je optimiser?',
      clearChat: 'Effacer le chat',
      newChat: 'Nouveau chat',
      errorMessage: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
      copyMessage: 'Copier le message',
      copied: 'Copié',
      enterToSend: 'Appuyez sur Entrée pour envoyer, Shift+Entrée pour nouvelle ligne',
    },
    settings: {
      description: 'Configurez les préférences de votre compte',
      appearance: 'Apparence',
      theme: 'Thème',
      lightMode: 'Mode Clair',
      lightModeDesc: 'Fond blanc, texte sombre',
      darkMode: 'Mode Sombre',
      darkModeDesc: 'Fond sombre, texte clair',
      language: 'Langue',
      languageDesc: 'Sélectionnez la langue de l\'interface',
      spanish: 'Español',
      french: 'Français',
    },
    profile: {
      title: 'Mon Profil',
      description: 'Gérez vos informations personnelles et sécurité',
      personalInfo: 'Informations Personnelles',
      fullName: 'Nom Complet',
      fullNamePlaceholder: 'Votre nom complet',
      email: 'Adresse Email',
      emailNote: 'L\'email ne peut pas être modifié',
      role: 'Rôle',
      security: 'Sécurité',
      changePassword: 'Changer le Mot de Passe',
      currentPassword: 'Mot de Passe Actuel',
      newPassword: 'Nouveau Mot de Passe',
      confirmPassword: 'Confirmer le Mot de Passe',
      passwordRequirements: 'Exigences du mot de passe',
      passwordMinLength: 'Minimum 6 caractères',
      profilePicture: 'Photo de Profil',
      profilePictureDesc: 'Téléchargez une photo pour personnaliser votre profil',
      uploadPhoto: 'Télécharger Photo',
      removePhoto: 'Supprimer Photo',
      saveProfile: 'Enregistrer Profil',
      savePassword: 'Changer Mot de Passe',
      profileUpdated: 'Profil mis à jour avec succès',
      passwordUpdated: 'Mot de passe mis à jour avec succès',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      currentPasswordRequired: 'Vous devez entrer votre mot de passe actuel',
      incorrectPassword: 'Le mot de passe actuel est incorrect',
    },
  },
};
