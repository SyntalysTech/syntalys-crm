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
      { data: clients },
      { data: projects },
      { data: companyExpenses },
      { data: clientExpenses },
      { data: income },
      { data: leads },
      { data: activities }
    ] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('company_expenses').select('*'),
      supabase.from('client_expenses').select('*'),
      supabase.from('income').select('*'),
      supabase.from('leads').select('*'),
      supabase.from('activities').select('*')
    ]);

    // Calculate financial summaries
    const totalClients = clients?.length || 0;
    const activeClients = clients?.filter(c => c.status === 'active').length || 0;
    const potentialClients = clients?.filter(c => c.is_potential).length || 0;

    const totalProjects = projects?.length || 0;
    const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
    const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
    const pausedProjects = projects?.filter(p => p.status === 'paused').length || 0;

    // Company expenses
    const monthlyCompanyExpenses = companyExpenses?.filter(e => e.frequency === 'monthly').reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    const annualCompanyExpenses = companyExpenses?.filter(e => e.frequency === 'annual').reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    const oneTimeCompanyExpenses = companyExpenses?.filter(e => e.frequency === 'one_time').reduce((sum, e) => sum + Number(e.amount), 0) || 0;

    // Client expenses
    const monthlyClientExpenses = clientExpenses?.filter(e => e.frequency === 'monthly').reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    const annualClientExpenses = clientExpenses?.filter(e => e.frequency === 'annual').reduce((sum, e) => sum + Number(e.amount), 0) || 0;

    // Income
    const monthlyIncome = income?.filter(i => i.frequency === 'monthly').reduce((sum, i) => sum + Number(i.amount), 0) || 0;
    const annualIncome = income?.filter(i => i.frequency === 'annual').reduce((sum, i) => sum + Number(i.amount), 0) || 0;
    const oneTimeIncome = income?.filter(i => i.frequency === 'one_time').reduce((sum, i) => sum + Number(i.amount), 0) || 0;

    // Projects income
    const projectsMonthlyIncome = projects?.filter(p => p.status === 'active' && p.billing_type === 'monthly').reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

    // Total monthly calculations
    const totalMonthlyIncome = monthlyIncome + projectsMonthlyIncome;
    const totalMonthlyExpenses = monthlyCompanyExpenses;
    const monthlyProfit = totalMonthlyIncome - totalMonthlyExpenses;

    // Client list with details
    const clientsList = clients?.map(c => `- ${c.name}${c.is_potential ? ' (potencial)' : ''}: ${c.status === 'active' ? 'activo' : c.status}`).join('\n') || 'Sin clientes';

    // Projects list
    const projectsList = projects?.map(p => `- ${p.name}: ${p.status === 'active' ? 'activo' : p.status === 'completed' ? 'completado' : 'pausado'} - ${p.currency} ${p.amount || 0}${p.billing_type === 'monthly' ? '/mes' : ''}`).join('\n') || 'Sin proyectos';

    // Expenses list
    const expensesList = companyExpenses?.map(e => `- ${e.service_name}: ${e.currency} ${e.amount} (${e.frequency === 'monthly' ? 'mensual' : e.frequency === 'annual' ? 'anual' : 'único'})`).join('\n') || 'Sin gastos';

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
    const qualifiedLeadValue = leads?.filter(l => l.status === 'qualified' || l.status === 'interested').reduce((sum, l) => sum + Number(l.estimated_value || 0), 0) || 0;

    // Leads list with details
    const leadsList = leads?.map(l => {
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
        new: 'nuevo',
        contacted: 'contactado',
        interested: 'interesado',
        qualified: 'calificado',
        converted: 'convertido',
        lost: 'perdido',
        dormant: 'dormido',
        not_qualified: 'no calificado'
      };
      return `- ${l.company_name || l.contact_name}: ${statusMap[l.status] || l.status} | Etapa: ${stageMap[l.pipeline_stage] || l.pipeline_stage} | Servicio: ${l.service_interested || 'N/A'} | Valor estimado: ${l.currency || 'EUR'} ${l.estimated_value || 0}`;
    }).join('\n') || 'Sin leads';

    // Activities statistics
    const totalActivities = activities?.length || 0;
    const pendingActivities = activities?.filter(a => a.status === 'pending').length || 0;
    const completedActivities = activities?.filter(a => a.status === 'completed').length || 0;
    const overdueActivities = activities?.filter(a => {
      if (a.status !== 'pending') return false;
      const today = new Date().toISOString().split('T')[0];
      return a.scheduled_date < today;
    }).length || 0;

    // Today's activities
    const today = new Date().toISOString().split('T')[0];
    const todayActivities = activities?.filter(a => a.scheduled_date === today && a.status === 'pending').length || 0;

    // Activities by type
    const activitiesByType = {
      call: activities?.filter(a => a.type === 'call').length || 0,
      email: activities?.filter(a => a.type === 'email').length || 0,
      meeting: activities?.filter(a => a.type === 'meeting').length || 0,
      follow_up: activities?.filter(a => a.type === 'follow_up').length || 0,
      demo: activities?.filter(a => a.type === 'demo').length || 0,
      proposal: activities?.filter(a => a.type === 'proposal').length || 0,
    };

    // Detailed client info with projects and income
    const clientsWithDetails = clients?.map(c => {
      const clientProjects = projects?.filter(p => p.client_id === c.id) || [];
      const clientIncome = income?.filter(i => i.client_id === c.id) || [];
      const clientMonthlyIncome = clientIncome.filter(i => i.frequency === 'monthly').reduce((sum, i) => sum + Number(i.amount), 0);
      const activeProjectsCount = clientProjects.filter(p => p.status === 'active').length;

      return `- ${c.name}${c.is_potential ? ' (POTENCIAL)' : ''}: ${c.status === 'active' ? '✅ Activo' : c.status === 'inactive' ? '⏸️ Inactivo' : '❌ Suspendido'} | País: ${c.country || 'N/A'} | Email: ${c.email || 'N/A'} | Teléfono: ${c.phone || 'N/A'} | Proyectos activos: ${activeProjectsCount} | Ingreso mensual: CHF ${clientMonthlyIncome.toFixed(2)}`;
    }).join('\n') || 'Sin clientes';

    // Income details
    const incomeList = income?.map(i => {
      const client = clients?.find(c => c.id === i.client_id);
      return `- ${i.service_name}: ${i.currency} ${i.amount} (${i.frequency === 'monthly' ? 'mensual' : i.frequency === 'annual' ? 'anual' : 'único'}) | Cliente: ${client?.name || 'N/A'} | Estado: ${i.status === 'active' ? 'activo' : i.status}`;
    }).join('\n') || 'Sin ingresos';

    return `
=== DATOS ACTUALES DEL CRM DE SYNTALYS ===
Fecha actual: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

📊 RESUMEN GENERAL:
- Total clientes: ${totalClients} (${activeClients} activos, ${potentialClients} potenciales)
- Total proyectos: ${totalProjects} (${activeProjects} activos, ${completedProjects} completados, ${pausedProjects} pausados)
- Total leads: ${totalLeads}
- Total actividades: ${totalActivities} (${pendingActivities} pendientes, ${completedActivities} completadas)

💰 FINANZAS MENSUALES:
- Ingresos mensuales recurrentes: CHF ${totalMonthlyIncome.toFixed(2)}
  - De servicios: CHF ${monthlyIncome.toFixed(2)}
  - De proyectos activos: CHF ${projectsMonthlyIncome.toFixed(2)}
- Gastos mensuales de empresa: CHF ${monthlyCompanyExpenses.toFixed(2)}
- Beneficio mensual estimado: CHF ${monthlyProfit.toFixed(2)}

📈 INGRESOS TOTALES:
- Mensuales recurrentes: CHF ${monthlyIncome.toFixed(2)}
- Anuales: CHF ${annualIncome.toFixed(2)}
- Pagos únicos: CHF ${oneTimeIncome.toFixed(2)}

💸 GASTOS DE EMPRESA:
- Mensuales: CHF ${monthlyCompanyExpenses.toFixed(2)}
- Anuales: CHF ${annualCompanyExpenses.toFixed(2)}
- Únicos: CHF ${oneTimeCompanyExpenses.toFixed(2)}

💼 GASTOS DE CLIENTES (servicios que pagamos por ellos):
- Mensuales: CHF ${monthlyClientExpenses.toFixed(2)}
- Anuales: CHF ${annualClientExpenses.toFixed(2)}

🎯 LEADS Y VENTAS:
- Total de leads: ${totalLeads}
- Por estado: ${newLeads} nuevos, ${contactedLeads} contactados, ${interestedLeads} interesados, ${qualifiedLeads} calificados, ${convertedLeads} convertidos, ${lostLeads} perdidos
- Tasa de conversión: ${conversionRate}%
- Valor total potencial de leads: EUR ${totalLeadValue.toFixed(2)}
- Valor de leads calificados/interesados: EUR ${qualifiedLeadValue.toFixed(2)}

🔄 PIPELINE DE VENTAS:
- Contacto inicial: ${leadsByStage.initial_contact} leads
- Calificación: ${leadsByStage.qualification} leads
- Propuesta: ${leadsByStage.proposal} leads
- Negociación: ${leadsByStage.negotiation} leads
- Cierre: ${leadsByStage.closing} leads
- Ganados: ${leadsByStage.won} leads
- Perdidos: ${leadsByStage.lost} leads

📅 ACTIVIDADES:
- Actividades para hoy: ${todayActivities}
- Actividades vencidas: ${overdueActivities}
- Pendientes totales: ${pendingActivities}
- Completadas: ${completedActivities}
- Por tipo: ${activitiesByType.call} llamadas, ${activitiesByType.email} emails, ${activitiesByType.meeting} reuniones, ${activitiesByType.follow_up} seguimientos, ${activitiesByType.demo} demos, ${activitiesByType.proposal} propuestas

👥 LISTA DETALLADA DE CLIENTES:
${clientsWithDetails}

🎯 LISTA DE LEADS:
${leadsList}

🗂️ LISTA DE PROYECTOS:
${projectsList}

💵 DETALLE DE INGRESOS:
${incomeList}

📋 GASTOS DE EMPRESA:
${expensesList}

=== FIN DE DATOS DEL CRM ===
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
