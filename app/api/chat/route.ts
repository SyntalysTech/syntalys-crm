import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getCRMContext() {
  try {
    // Load all CRM data in parallel
    const [
      { data: clients },
      { data: projects },
      { data: companyExpenses },
      { data: clientExpenses },
      { data: income }
    ] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('company_expenses').select('*'),
      supabase.from('client_expenses').select('*'),
      supabase.from('income').select('*')
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

    return `
=== DATOS ACTUALES DEL CRM DE SYNTALYS ===

📊 RESUMEN GENERAL:
- Total clientes: ${totalClients} (${activeClients} activos, ${potentialClients} potenciales)
- Total proyectos: ${totalProjects} (${activeProjects} activos, ${completedProjects} completados, ${pausedProjects} pausados)

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

👥 LISTA DE CLIENTES:
${clientsList}

🗂️ LISTA DE PROYECTOS:
${projectsList}

📋 GASTOS DE EMPRESA:
${expensesList}

=== FIN DE DATOS ===
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
            content: `Eres un asistente inteligente para Syntalys, una empresa de desarrollo web y servicios digitales con sede en Suiza.

Tu rol es ayudar a los usuarios con:
- Análisis de finanzas basado en datos reales del CRM
- Consejos para mejorar ingresos y optimizar gastos
- Información sobre clientes y proyectos
- Recomendaciones estratégicas de negocio

IMPORTANTE: Tienes acceso a los datos reales del CRM. Usa estos datos para dar respuestas precisas y útiles.

${crmContext}

Responde de manera profesional, concisa y útil. Usa los datos proporcionados para dar respuestas específicas y accionables.
Puedes responder en español o francés según el idioma del usuario.
Cuando hables de dinero, usa CHF como moneda principal.`
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
