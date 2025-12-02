'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { CompanyExpense, ClientExpense, ClientIncome, Project } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

type DataType = 'company_expenses' | 'client_expenses' | 'client_income' | 'projects';
type Period = 'monthly' | 'annual' | 'one_time';
type ChartType = 'bar' | 'line' | 'pie';

interface MonthlyData {
  month: string;
  amount: number;
}

export default function EstadisticasPage() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [dataType, setDataType] = useState<DataType>('client_income');
  const [period, setPeriod] = useState<Period>('monthly');
  const [chartType, setChartType] = useState<ChartType>('bar');

  const [companyExpenses, setCompanyExpenses] = useState<CompanyExpense[]>([]);
  const [clientExpenses, setClientExpenses] = useState<ClientExpense[]>([]);
  const [clientIncome, setClientIncome] = useState<ClientIncome[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [expensesRes, clientExpensesRes, incomeRes, projectsRes] = await Promise.all([
        supabase.from('company_expenses').select('*'),
        supabase.from('client_expenses').select('*'),
        supabase.from('client_income').select('*'),
        supabase.from('projects').select('*'),
      ]);

      setCompanyExpenses(expensesRes.data || []);
      setClientExpenses(clientExpensesRes.data || []);
      setClientIncome(incomeRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Obtener datos según el tipo seleccionado
  function getCurrentData() {
    if (dataType === 'company_expenses') {
      return companyExpenses.filter(e => e.frequency === period);
    } else if (dataType === 'client_expenses') {
      return clientExpenses.filter(e => e.frequency === period);
    } else if (dataType === 'client_income') {
      return clientIncome.filter(i => i.frequency === period);
    } else if (dataType === 'projects') {
      // Para proyectos, filtrar por payment_type
      if (period === 'one_time') {
        return projects.filter(p => p.payment_type === 'one_time' && p.total_amount);
      } else if (period === 'monthly') {
        return projects.filter(p => p.payment_type === 'monthly' && p.total_amount);
      } else if (period === 'annual') {
        return projects.filter(p => p.payment_type === 'annual' && p.total_amount);
      }
    }
    return [];
  }

  // Agrupar datos por mes
  function getMonthlyData(): MonthlyData[] {
    const data = getCurrentData();
    const monthlyMap = new Map<string, number>();

    data.forEach(item => {
      let date: Date;
      let amount: number;

      // Manejar proyectos de manera diferente
      if (dataType === 'projects') {
        const project = item as Project;
        date = new Date(project.end_date || project.start_date || project.created_at);
        amount = project.total_amount || 0;
      } else {
        const record = item as CompanyExpense | ClientExpense | ClientIncome;
        date = new Date(record.payment_date || record.created_at);
        amount = record.amount;
      }

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const current = monthlyMap.get(monthKey) || 0;
      monthlyMap.set(monthKey, current + Number(amount));
    });

    // Ordenar por fecha y tomar últimos 12 meses
    const sortedEntries = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12);

    return sortedEntries.map(([key, amount]) => ({
      month: new Date(key + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
      amount
    }));
  }

  // Obtener datos para el gráfico de torta (por categoría)
  function getCategoryData() {
    const data = getCurrentData();
    const categoryMap = new Map<string, number>();

    data.forEach(item => {
      let category: string;
      let amount: number;

      if (dataType === 'projects') {
        const project = item as Project;
        category = project.project_type || 'other';
        amount = project.total_amount || 0;
      } else {
        const record = item as CompanyExpense | ClientExpense | ClientIncome;
        category = record.category || 'other';
        amount = record.amount;
      }

      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + Number(amount));
    });

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount
    }));
  }

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();
  const maxValue = Math.max(...monthlyData.map(d => d.amount), 1);
  const totalAmount = monthlyData.reduce((sum, d) => sum + d.amount, 0);

  // Configuración de títulos
  const dataTypeLabels: Record<DataType, string> = {
    company_expenses: t.stats.syntalysExpenses,
    client_expenses: t.stats.clientExpenses,
    client_income: t.stats.clientIncome,
    projects: t.nav.projects,
  };

  const periodLabels: Record<Period, string> = {
    monthly: t.stats.monthly,
    annual: t.stats.annual,
    one_time: t.stats.oneTime,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.stats.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.stats.subtitle}
        </p>
      </div>

      {/* Controles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Selector de tipo de datos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.stats.dataType}
            </label>
            <select
              value={dataType}
              onChange={(e) => {
                const newType = e.target.value as DataType;
                setDataType(newType);
                // Si es proyectos, cambiar a one_time por defecto
                if (newType === 'projects' && period !== 'one_time' && period !== 'monthly' && period !== 'annual') {
                  setPeriod('one_time');
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-syntalys-blue focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="client_income">{t.stats.clientIncome}</option>
              <option value="projects">{t.nav.projects}</option>
              <option value="company_expenses">{t.stats.syntalysExpenses}</option>
              <option value="client_expenses">{t.stats.clientExpenses}</option>
            </select>
          </div>

          {/* Selector de período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.stats.period}
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-syntalys-blue focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {dataType === 'projects' ? (
                <>
                  <option value="one_time">{t.stats.oneTime}</option>
                  <option value="monthly">{t.stats.monthly}</option>
                  <option value="annual">{t.stats.annual}</option>
                </>
              ) : (
                <>
                  <option value="monthly">{t.stats.monthly}</option>
                  <option value="annual">{t.stats.annual}</option>
                </>
              )}
            </select>
          </div>

          {/* Selector de tipo de gráfico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.stats.chartType}
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-syntalys-blue focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="bar">{t.stats.bars}</option>
              <option value="line">{t.stats.lines}</option>
              <option value="pie">{t.stats.pie}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t.common.total}</h3>
          <p className="text-3xl font-bold text-syntalys-blue dark:text-blue-400">
            {totalAmount.toFixed(2)} CHF
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {dataTypeLabels[dataType]} {periodLabels[period]}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t.stats.average}</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {monthlyData.length > 0 ? (totalAmount / monthlyData.length).toFixed(2) : '0.00'} CHF
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.stats.perPeriod}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t.stats.records}</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {getCurrentData().length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.stats.totalOf} {periodLabels[period]}</p>
        </div>
      </div>

      {/* Gráfico principal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {dataTypeLabels[dataType]} - {periodLabels[period]}
        </h2>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500 dark:text-gray-400">{t.common.loading}...</p>
          </div>
        ) : monthlyData.length === 0 ? (
          <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">{t.stats.noDataAvailable}</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                {t.stats.selectFilters}
              </p>
            </div>
          </div>
        ) : (
          <>
            {chartType === 'bar' && <BarChart data={monthlyData} maxValue={maxValue} />}
            {chartType === 'line' && <LineChart data={monthlyData} maxValue={maxValue} />}
            {chartType === 'pie' && <PieChart data={categoryData} />}
          </>
        )}
      </div>
    </div>
  );
}

// Componente de gráfico de barras
function BarChart({ data, maxValue }: { data: MonthlyData[]; maxValue: number }) {
  const chartHeight = 400;
  const chartWidth = 800;
  const padding = 40;
  const barWidth = (chartWidth - padding * 2) / data.length - 10;

  return (
    <div className="w-full overflow-x-auto">
      <svg width={chartWidth} height={chartHeight} className="mx-auto">
        {/* Eje Y */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={chartHeight - padding}
          stroke="#ccc"
          strokeWidth="2"
        />
        {/* Eje X */}
        <line
          x1={padding}
          y1={chartHeight - padding}
          x2={chartWidth - padding}
          y2={chartHeight - padding}
          stroke="#ccc"
          strokeWidth="2"
        />

        {/* Barras */}
        {data.map((item, index) => {
          const barHeight = ((item.amount / maxValue) * (chartHeight - padding * 2));
          const x = padding + index * (barWidth + 10) + 5;
          const y = chartHeight - padding - barHeight;

          return (
            <g key={index}>
              {/* Barra */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#0066CC"
                className="hover:fill-syntalys-blue transition-colors cursor-pointer"
              />
              {/* Etiqueta del mes */}
              <text
                x={x + barWidth / 2}
                y={chartHeight - padding + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                {item.month}
              </text>
              {/* Valor */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="11"
                fill="#333"
                fontWeight="bold"
              >
                {item.amount.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Líneas de referencia */}
        {[0.25, 0.5, 0.75, 1].map((fraction, i) => {
          const y = chartHeight - padding - (chartHeight - padding * 2) * fraction;
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#eee"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#999"
              >
                {(maxValue * fraction).toFixed(0)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Componente de gráfico de líneas
function LineChart({ data, maxValue }: { data: MonthlyData[]; maxValue: number }) {
  const chartHeight = 400;
  const chartWidth = 800;
  const padding = 40;
  const pointSpacing = (chartWidth - padding * 2) / (data.length - 1 || 1);

  const points = data.map((item, index) => {
    const x = padding + index * pointSpacing;
    const y = chartHeight - padding - ((item.amount / maxValue) * (chartHeight - padding * 2));
    return { x, y, amount: item.amount, month: item.month };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  return (
    <div className="w-full overflow-x-auto">
      <svg width={chartWidth} height={chartHeight} className="mx-auto">
        {/* Eje Y */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={chartHeight - padding}
          stroke="#ccc"
          strokeWidth="2"
        />
        {/* Eje X */}
        <line
          x1={padding}
          y1={chartHeight - padding}
          x2={chartWidth - padding}
          y2={chartHeight - padding}
          stroke="#ccc"
          strokeWidth="2"
        />

        {/* Área bajo la curva */}
        <path
          d={`${pathData} L ${points[points.length - 1].x},${chartHeight - padding} L ${padding},${chartHeight - padding} Z`}
          fill="#0066CC"
          fillOpacity="0.1"
        />

        {/* Línea principal */}
        <path
          d={pathData}
          fill="none"
          stroke="#0066CC"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Puntos y etiquetas */}
        {points.map((point, index) => (
          <g key={index}>
            {/* Punto */}
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#0066CC"
              className="hover:r-7 transition-all cursor-pointer"
            />
            {/* Etiqueta del mes */}
            <text
              x={point.x}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#666"
            >
              {point.month}
            </text>
            {/* Valor */}
            <text
              x={point.x}
              y={point.y - 15}
              textAnchor="middle"
              fontSize="11"
              fill="#333"
              fontWeight="bold"
            >
              {point.amount.toFixed(0)}
            </text>
          </g>
        ))}

        {/* Líneas de referencia */}
        {[0.25, 0.5, 0.75, 1].map((fraction, i) => {
          const y = chartHeight - padding - (chartHeight - padding * 2) * fraction;
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#eee"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#999"
              >
                {(maxValue * fraction).toFixed(0)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Componente de gráfico de torta
function PieChart({ data }: { data: { category: string; amount: number }[] }) {
  const size = 400;
  const radius = 150;
  const centerX = size / 2;
  const centerY = size / 2;

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  let currentAngle = -90; // Empezar desde arriba

  const colors = [
    '#0066CC', '#00CC66', '#CC6600', '#CC0066',
    '#6600CC', '#00CCCC', '#CCCC00', '#CC00CC'
  ];

  const categoryLabels: Record<string, string> = {
    // Categorías de gastos/ingresos
    software: 'Software',
    hosting: 'Hosting',
    domain: 'Dominio',
    api: 'API',
    development: 'Desarrollo',
    ssl: 'SSL',
    maintenance: 'Mantenimiento',
    crm: 'CRM',
    subscription: 'Suscripción',
    // Tipos de proyectos
    web_development: 'Desarrollo Web',
    app_development: 'Desarrollo de Apps',
    consulting: 'Consultoría',
    design: 'Diseño',
    other: 'Otro',
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        {data.map((item, index) => {
          const percentage = (item.amount / total) * 100;
          const angle = (percentage / 100) * 360;

          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const x1 = centerX + radius * Math.cos(startRad);
          const y1 = centerY + radius * Math.sin(startRad);
          const x2 = centerX + radius * Math.cos(endRad);
          const y2 = centerY + radius * Math.sin(endRad);

          const largeArc = angle > 180 ? 1 : 0;

          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');

          currentAngle = endAngle;

          // Posición del texto (en el centro del arco)
          const midAngle = (startAngle + endAngle) / 2;
          const midRad = (midAngle * Math.PI) / 180;
          const textX = centerX + (radius * 0.7) * Math.cos(midRad);
          const textY = centerY + (radius * 0.7) * Math.sin(midRad);

          return (
            <g key={index}>
              <path
                d={pathData}
                fill={colors[index % colors.length]}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
              {percentage > 5 && (
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  fontSize="12"
                  fill="white"
                  fontWeight="bold"
                >
                  {percentage.toFixed(0)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Leyenda */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <div className="text-sm">
              <span className="font-medium text-gray-900 dark:text-white">
                {categoryLabels[item.category] || item.category}
              </span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">
                {item.amount.toFixed(2)} CHF
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
