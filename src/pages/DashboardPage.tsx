import { Link } from 'react-router-dom';
import { Users, HeartHandshake, Package, UsersRound, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { familiasMock, atendimentosMock, cestasMock, atividadesMock } from '@/data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { motion } from 'framer-motion';

const CHART_COLORS = [
  'hsl(174, 60%, 40%)',
  'hsl(30, 80%, 55%)',
  'hsl(210, 70%, 55%)',
  'hsl(152, 60%, 42%)',
  'hsl(0, 72%, 51%)',
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

const statCards = [
  { label: 'Famílias Cadastradas', icon: Users, path: '/familias', color: 'primary' },
  { label: 'Atendimentos', icon: HeartHandshake, path: '/atendimentos', color: 'info' },
  { label: 'Cestas Entregues', icon: Package, path: '/cestas', color: 'warning' },
  { label: 'Atividades', icon: UsersRound, path: '/grupos', color: 'success' },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const firstName = user?.nome.split(' ')[0] || 'Usuário';

  const values = [
    familiasMock.length,
    atendimentosMock.length,
    cestasMock.reduce((s, c) => s + c.quantidade, 0),
    atividadesMock.length,
  ];

  // Famílias por bairro
  const bairroData = familiasMock.reduce<Record<string, number>>((acc, f) => {
    acc[f.bairro] = (acc[f.bairro] || 0) + 1;
    return acc;
  }, {});
  const bairroChart = Object.entries(bairroData).map(([name, value]) => ({ name, value }));

  // Atendimentos por tipo
  const tipoData = atendimentosMock.reduce<Record<string, number>>((acc, a) => {
    acc[a.tipoAtendimento] = (acc[a.tipoAtendimento] || 0) + 1;
    return acc;
  }, {});
  const tipoChart = Object.entries(tipoData).map(([name, value]) => ({ name, value }));

  // Cestas por mês
  const cestasMes = cestasMock.reduce<Record<string, number>>((acc, c) => {
    const mes = c.dataEntrega.substring(0, 7);
    acc[mes] = (acc[mes] || 0) + c.quantidade;
    return acc;
  }, {});
  const cestasChart = Object.entries(cestasMes).map(([name, value]) => ({
    name: new Date(name + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    value,
  }));

  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    info: 'bg-info/10 text-info',
    warning: 'bg-warning/10 text-warning',
    success: 'bg-success/10 text-success',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá, {firstName}! 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visão geral das atividades da ONG Mais que Social</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.path}
            initial="hidden"
            animate="visible"
            custom={i}
            variants={fadeUp}
          >
            <Link
              to={card.path}
              className="block glass-elevated rounded-xl p-5 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${colorMap[card.color]?.split(' ')[0]}`}>
                  <card.icon className={`w-5 h-5 ${colorMap[card.color]?.split(' ')[1]}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-3xl font-bold text-foreground">{values[i]}</div>
              <div className="text-sm text-muted-foreground">{card.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Famílias por Bairro */}
        <div className="glass-card p-6">
          <h3 className="mb-4 font-semibold text-card-foreground">Famílias por Bairro</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bairroChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,15%,90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tipos de Atendimento */}
        <div className="glass-card p-6">
          <h3 className="mb-4 font-semibold text-card-foreground">Tipos de Atendimento</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={tipoChart}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {tipoChart.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cestas por Mês — span 2 colunas */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-card-foreground">Cestas Básicas Distribuídas por Mês</h3>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cestasChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,15%,90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
