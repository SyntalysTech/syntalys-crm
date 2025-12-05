import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side API to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getCRMContext() {
  try {
    // Load all CRM data in parallel
    const [
      { data: clients, error: clientsError },
      { data: projects, error: projectsError },
      { data: companyExpenses, error: expensesError },
      { data: clientExpenses, error: clientExpError },
      { data: income, error: incomeError },
      { data: leads, error: leadsError },
      { data: activities, error: activitiesError }
    ] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('company_expenses').select('*'),
      supabase.from('client_expenses').select('*'),
      supabase.from('income').select('*'),
      supabase.from('leads').select('*'),
      supabase.from('activities').select('*')
    ]);

    // Log any errors for debugging
    if (clientsError) console.error('Clients error:', clientsError);
    if (projectsError) console.error('Projects error:', projectsError);
    if (expensesError) console.error('Expenses error:', expensesError);
    if (incomeError) console.error('Income error:', incomeError);
    if (leadsError) console.error('Leads error:', leadsError);

    // Calculate financial summaries
    const totalClients = clients?.length || 0;
    const activeClients = clients?.filter(c => c.status === 'active').length || 0;
    const potentialClients = clients?.filter(c => c.is_potential).length || 0;

    const totalProjects = projects?.length || 0;
    const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
    const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
    const pausedProjects = projects?.filter(p => p.status === 'paused').length || 0;

    // Calculate project value
    const totalProjectValue = projects?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

    // Income by currency and type
    const incomeEUR = income?.filter(i => i.currency === 'EUR') || [];
    const incomeCHF = income?.filter(i => i.currency === 'CHF') || [];

    const totalIncomeEUR = incomeEUR.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalIncomeCHF = incomeCHF.reduce((sum, i) => sum + Number(i.amount), 0);

    const oneTimeIncomeEUR = incomeEUR.filter(i => i.frequency === 'one_time').reduce((sum, i) => sum + Number(i.amount), 0);
    const oneTimeIncomeCHF = incomeCHF.filter(i => i.frequency === 'one_time').reduce((sum, i) => sum + Number(i.amount), 0);
    const monthlyIncomeEUR = incomeEUR.filter(i => i.frequency === 'monthly').reduce((sum, i) => sum + Number(i.amount), 0);
    const monthlyIncomeCHF = incomeCHF.filter(i => i.frequency === 'monthly').reduce((sum, i) => sum + Number(i.amount), 0);
    const annualIncomeEUR = incomeEUR.filter(i => i.frequency === 'annual').reduce((sum, i) => sum + Number(i.amount), 0);
    const annualIncomeCHF = incomeCHF.filter(i => i.frequency === 'annual').reduce((sum, i) => sum + Number(i.amount), 0);

    // Company expenses by currency
    const expensesEUR = companyExpenses?.filter(e => e.currency === 'EUR') || [];
    const expensesCHF = companyExpenses?.filter(e => e.currency === 'CHF') || [];

    const monthlyExpensesCHF = expensesCHF.filter(e => e.frequency === 'monthly').reduce((sum, e) => sum + Number(e.amount), 0);
    const monthlyExpensesEUR = expensesEUR.filter(e => e.frequency === 'monthly').reduce((sum, e) => sum + Number(e.amount), 0);
    const annualExpensesCHF = expensesCHF.filter(e => e.frequency === 'annual').reduce((sum, e) => sum + Number(e.amount), 0);
    const annualExpensesEUR = expensesEUR.filter(e => e.frequency === 'annual').reduce((sum, e) => sum + Number(e.amount), 0);
    const totalExpensesCHF = expensesCHF.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalExpensesEUR = expensesEUR.reduce((sum, e) => sum + Number(e.amount), 0);

    // Leads statistics
    const totalLeads = leads?.length || 0;
    const newLeads = leads?.filter(l => l.status === 'new').length || 0;
    const contactedLeads = leads?.filter(l => l.status === 'contacted').length || 0;
    const interestedLeads = leads?.filter(l => l.status === 'interested').length || 0;
    const qualifiedLeads = leads?.filter(l => l.status === 'qualified').length || 0;
    const convertedLeads = leads?.filter(l => l.status === 'converted').length || 0;
    const lostLeads = leads?.filter(l => l.status === 'lost').length || 0;

    // Leads by pipeline stage
    const leadsByStage = {
      initial_contact: leads?.filter(l => l.pipeline_stage === 'initial_contact').length || 0,
      qualification: leads?.filter(l => l.pipeline_stage === 'qualification').length || 0,
      proposal: leads?.filter(l => l.pipeline_stage === 'proposal').length || 0,
      negotiation: leads?.filter(l => l.pipeline_stage === 'negotiation').length || 0,
      closing: leads?.filter(l => l.pipeline_stage === 'closing').length || 0,
      won: leads?.filter(l => l.pipeline_stage === 'won').length || 0,
      lost: leads?.filter(l => l.pipeline_stage === 'lost').length || 0,
    };

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

    // Potential value from leads
    const totalLeadValue = leads?.reduce((sum, l) => sum + Number(l.estimated_value || 0), 0) || 0;

    // Activities statistics
    const totalActivities = activities?.length || 0;
    const pendingActivities = activities?.filter(a => a.status === 'pending').length || 0;
    const completedActivities = activities?.filter(a => a.status === 'completed').length || 0;
    const today = new Date().toISOString().split('T')[0];
    const overdueActivities = activities?.filter(a => a.status === 'pending' && a.scheduled_date < today).length || 0;
    const todayActivities = activities?.filter(a => a.scheduled_date === today && a.status === 'pending').length || 0;

    // Build detailed lists
    const clientsDetailedList = clients?.map(c => {
      const clientProjects = projects?.filter(p => p.client_id === c.id) || [];
      const clientIncomeItems = income?.filter(i => i.client_id === c.id) || [];
      const clientTotalIncome = clientIncomeItems.reduce((sum, i) => sum + Number(i.amount), 0);
      const projectNames = clientProjects.map(p => p.name).join(', ') || 'Ninguno';

      return `  • ${c.name}
    - Estado: ${c.status === 'active' ? 'Activo' : c.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
    - Tipo: ${c.client_type === 'individual' ? 'Persona' : 'Empresa'}${c.is_potential ? ' (POTENCIAL)' : ''}
    - País: ${c.country || 'N/A'}
    - Email: ${c.email || 'N/A'}
    - Teléfono: ${c.phone || 'N/A'}
    - Proyectos: ${projectNames}
    - Ingresos totales: ${clientTotalIncome.toFixed(2)}`;
    }).join('\n\n') || 'Sin clientes';

    const projectsDetailedList = projects?.map(p => {
      const client = clients?.find(c => c.id === p.client_id);
      const statusText = p.status === 'active' ? '🟢 Activo' : p.status === 'completed' ? '✅ Completado' : '⏸️ Pausado';
      return `  • ${p.name} (${statusText})
    - Cliente: ${client?.name || 'N/A'}
    - Valor: ${p.currency} ${Number(p.amount || 0).toFixed(2)}${p.billing_type === 'monthly' ? '/mes' : p.billing_type === 'one_time' ? ' (único)' : ''}
    - Tipo de facturación: ${p.billing_type === 'monthly' ? 'Mensual' : p.billing_type === 'one_time' ? 'Pago único' : p.billing_type}
    - Descripción: ${p.description || 'N/A'}`;
    }).join('\n\n') || 'Sin proyectos';

    const incomeDetailedList = income?.map(i => {
      const client = clients?.find(c => c.id === i.client_id);
      const freqText = i.frequency === 'monthly' ? 'Mensual' : i.frequency === 'annual' ? 'Anual' : 'Pago único';
      const statusText = i.status === 'paid' ? '✅ Pagado' : i.status === 'active' ? '🟢 Activo' : '⏳ Pendiente';
      return `  • ${i.service_name}: ${i.currency} ${Number(i.amount).toFixed(2)} (${freqText}) - ${statusText}
    - Cliente: ${client?.name || 'N/A'}
    - Categoría: ${i.category || 'N/A'}
    - Fecha: ${i.payment_date || 'N/A'}`;
    }).join('\n\n') || 'Sin ingresos registrados';

    const expensesDetailedList = companyExpenses?.map(e => {
      const freqText = e.frequency === 'monthly' ? 'Mensual' : e.frequency === 'annual' ? 'Anual' : 'Único';
      const statusText = e.status === 'paid' ? '✅ Pagado' : '⏳ Pendiente';
      return `  • ${e.service_name}: ${e.currency} ${Number(e.amount).toFixed(2)} (${freqText}) - ${statusText}
    - Categoría: ${e.category || 'N/A'}`;
    }).join('\n\n') || 'Sin gastos registrados';

    const leadsDetailedList = (leads?.length ?? 0) > 0 ? leads!.map(l => {
      const stageMap: Record<string, string> = {
        initial_contact: 'Contacto inicial',
        qualification: 'Calificación',
        proposal: 'Propuesta',
        negotiation: 'Negociación',
        closing: 'Cierre',
        won: 'Ganado',
        lost: 'Perdido'
      };
      const statusMap: Record<string, string> = {
        new: '🆕 Nuevo',
        contacted: '📞 Contactado',
        interested: '⭐ Interesado',
        qualified: '✅ Calificado',
        converted: '🎉 Convertido',
        lost: '❌ Perdido',
        dormant: '😴 Dormido'
      };
      return `  • ${l.company_name || l.contact_name}
    - Estado: ${statusMap[l.status] || l.status}
    - Etapa pipeline: ${stageMap[l.pipeline_stage] || l.pipeline_stage}
    - Contacto: ${l.contact_name || 'N/A'} | Email: ${l.email || 'N/A'} | Tel: ${l.phone || 'N/A'}
    - Servicio interesado: ${l.service_interested || 'N/A'}
    - Valor estimado: ${l.currency || 'EUR'} ${Number(l.estimated_value || 0).toFixed(2)}
    - País: ${l.country || 'N/A'}
    - Notas: ${l.notes || 'Sin notas'}`;
    }).join('\n\n') : 'No hay leads registrados en el sistema';

    const activitiesList = activities?.filter(a => a.status === 'pending').slice(0, 10).map(a => {
      const lead = leads?.find(l => l.id === a.lead_id);
      const typeMap: Record<string, string> = {
        call: '📞 Llamada',
        email: '✉️ Email',
        meeting: '🤝 Reunión',
        follow_up: '🔄 Seguimiento',
        demo: '🖥️ Demo',
        proposal: '📄 Propuesta'
      };
      return `  • ${typeMap[a.type] || a.type}: ${a.title || 'Sin título'}
    - Lead: ${lead?.company_name || lead?.contact_name || 'N/A'}
    - Fecha: ${a.scheduled_date}
    - Prioridad: ${a.priority || 'Normal'}
    - Notas: ${a.notes || 'Sin notas'}`;
    }).join('\n\n') || 'No hay actividades pendientes';

    return `
============================================
DATOS COMPLETOS DEL CRM DE SYNTALYS
Fecha: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
============================================

📊 RESUMEN EJECUTIVO:
━━━━━━━━━━━━━━━━━━━━
• Clientes: ${totalClients} total (${activeClients} activos, ${potentialClients} potenciales)
• Proyectos: ${totalProjects} total (${activeProjects} activos, ${completedProjects} completados, ${pausedProjects} pausados)
• Leads: ${totalLeads} total
• Actividades: ${totalActivities} total (${pendingActivities} pendientes, ${overdueActivities} vencidas)

💰 FINANZAS - INGRESOS TOTALES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EN EUROS (EUR):
• Total recibido: EUR ${totalIncomeEUR.toFixed(2)}
  - Pagos únicos: EUR ${oneTimeIncomeEUR.toFixed(2)}
  - Mensuales: EUR ${monthlyIncomeEUR.toFixed(2)}
  - Anuales: EUR ${annualIncomeEUR.toFixed(2)}

EN FRANCOS SUIZOS (CHF):
• Total recibido: CHF ${totalIncomeCHF.toFixed(2)}
  - Pagos únicos: CHF ${oneTimeIncomeCHF.toFixed(2)}
  - Mensuales: CHF ${monthlyIncomeCHF.toFixed(2)}
  - Anuales: CHF ${annualIncomeCHF.toFixed(2)}

VALOR TOTAL DE PROYECTOS: EUR/CHF ${totalProjectValue.toFixed(2)}

💸 FINANZAS - GASTOS:
━━━━━━━━━━━━━━━━━━━━
EN CHF:
• Total gastos: CHF ${totalExpensesCHF.toFixed(2)}
  - Mensuales: CHF ${monthlyExpensesCHF.toFixed(2)}
  - Anuales: CHF ${annualExpensesCHF.toFixed(2)}

EN EUR:
• Total gastos: EUR ${totalExpensesEUR.toFixed(2)}
  - Mensuales: EUR ${monthlyExpensesEUR.toFixed(2)}
  - Anuales: EUR ${annualExpensesEUR.toFixed(2)}

📈 BENEFICIO NETO ESTIMADO:
• EUR: ${(totalIncomeEUR - totalExpensesEUR).toFixed(2)}
• CHF: ${(totalIncomeCHF - totalExpensesCHF).toFixed(2)}

🎯 PIPELINE DE VENTAS (LEADS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Total leads: ${totalLeads}
• Nuevos: ${newLeads}
• Contactados: ${contactedLeads}
• Interesados: ${interestedLeads}
• Calificados: ${qualifiedLeads}
• Convertidos: ${convertedLeads}
• Perdidos: ${lostLeads}
• Tasa de conversión: ${conversionRate}%
• Valor potencial total: EUR ${totalLeadValue.toFixed(2)}

Por etapa del pipeline:
• Contacto inicial: ${leadsByStage.initial_contact}
• Calificación: ${leadsByStage.qualification}
• Propuesta: ${leadsByStage.proposal}
• Negociación: ${leadsByStage.negotiation}
• Cierre: ${leadsByStage.closing}
• Ganados: ${leadsByStage.won}
• Perdidos: ${leadsByStage.lost}

📅 ACTIVIDADES PENDIENTES:
━━━━━━━━━━━━━━━━━━━━━━━━
• Para hoy: ${todayActivities}
• Vencidas: ${overdueActivities}
• Pendientes total: ${pendingActivities}

============================================
DETALLE COMPLETO DE DATOS
============================================

👥 CLIENTES (${totalClients}):
${clientsDetailedList}

🗂️ PROYECTOS (${totalProjects}):
${projectsDetailedList}

💵 INGRESOS REGISTRADOS (${income?.length || 0}):
${incomeDetailedList}

📋 GASTOS DE EMPRESA (${companyExpenses?.length || 0}):
${expensesDetailedList}

🎯 LEADS (${totalLeads}):
${leadsDetailedList}

📅 PRÓXIMAS ACTIVIDADES:
${activitiesList}

============================================
FIN DE DATOS DEL CRM
============================================
`;
  } catch (error) {
    console.error('Error loading CRM context:', error);
    return 'No se pudieron cargar los datos del CRM.';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API;

    if (!apiKey) {
      console.error('OpenAI API key not found. Set OPENAI_API_KEY or OPENAI_API in environment variables');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Load CRM data for context
    const crmContext = await getCRMContext();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres el asistente de IA del CRM de Syntalys, una empresa de desarrollo web, automatizaciones, chatbots, voicebots, call center y servicios digitales con sede en Suiza.

TIENES ACCESO COMPLETO A TODOS LOS DATOS DEL CRM EN TIEMPO REAL. Los datos que ves abajo son REALES y ACTUALIZADOS.

Tu rol es:
1. ANÁLISIS DE DATOS: Analizar clientes, leads, proyectos, ingresos, gastos y actividades
2. RESPUESTAS ESPECÍFICAS: Cuando pregunten por un cliente, lead o proyecto específico, busca en los datos y da información detallada
3. ESTADÍSTICAS: Calcular métricas, tendencias y comparaciones
4. RECOMENDACIONES: Dar consejos de negocio basados en los datos reales
5. SEGUIMIENTO: Informar sobre actividades pendientes, leads calientes, proyectos activos

REGLAS IMPORTANTES:
- SIEMPRE usa los datos reales proporcionados para responder
- Si preguntan por un cliente/lead/proyecto específico, busca en la lista y da TODA la información disponible
- Cuando pregunten "¿cuántos clientes tengo?", "¿cuáles son mis leads?", etc., usa los números EXACTOS de los datos
- Puedes hacer cálculos y análisis con los datos
- Responde en el idioma del usuario (español o francés)
- Usa CHF como moneda principal para finanzas generales, EUR para leads
- Sé conciso pero completo

${crmContext}

Recuerda: TIENES TODOS LOS DATOS. Úsalos para dar respuestas precisas, específicas y útiles. No digas que no tienes acceso a los datos porque SÍ los tienes arriba.`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', response.status, errorData);
      return NextResponse.json(
        { error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || 'No response';

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
