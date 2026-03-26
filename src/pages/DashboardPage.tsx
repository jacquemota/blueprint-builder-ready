import { Users, ClipboardList, Package, UsersRound } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { PageHeader } from '@/components/PageHeader';
import { familiasMock, atendimentosMock, cestasMock, atividadesMock } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(168,60%,38%)', 'hsl(35,90%,55%)', 'hsl(205,80%,50%)', 'hsl(142,70%,45%)', 'hsl(0,72%,51%)'];

const DashboardPage = () => {
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

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral das atividades da ONG Mais que Social" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Famílias Cadastradas" value={familiasMock.length} icon={Users} />
        <StatsCard title="Atendimentos" value={atendimentosMock.length} icon={ClipboardList} />
        <StatsCard title="Cestas Entregues" value={cestasMock.reduce((s, c) => s + c.quantidade, 0)} icon={Package} />
        <StatsCard title="Atividades" value={atividadesMock.length} icon={UsersRound} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Famílias por Bairro */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Famílias por Bairro</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bairroChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(160,15%,88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(168,60%,38%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tipos de Atendimento */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Tipos de Atendimento</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={tipoChart} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {tipoChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cestas ao longo do tempo */}
        <div className="rounded-xl border bg-card p-6 shadow-card lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Cestas Básicas Distribuídas por Mês</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cestasChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(160,15%,88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(35,90%,55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
