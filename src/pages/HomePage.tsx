import { Link } from 'react-router-dom';
import { Heart, Users, HandHeart, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Users, title: 'Gestão de Famílias', desc: 'Cadastro completo e prontuário digital unificado para cada família atendida.' },
  { icon: HandHeart, title: 'Atendimentos', desc: 'Registro de fisioterapia, assistência social e orientações com histórico completo.' },
  { icon: Package, title: 'Cestas Básicas', desc: 'Controle de distribuição com alerta de duplicidade para garantir equidade.' },
];

const HomePage = () => (
  <div className="min-h-screen bg-background">
    {/* Header */}
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Mais que Social</span>
        </div>
        <Link to="/login">
          <Button>Entrar no Sistema</Button>
        </Link>
      </div>
    </header>

    {/* Hero */}
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="relative mx-auto max-w-6xl px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm mb-6">
          <Heart className="h-4 w-4 text-primary" /> Maceió — AL
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Transformando vidas com{' '}
          <span className="text-primary">gestão social</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Sistema de gestão digital da ONG Mais que Social. Cadastro de famílias, controle de atendimentos, distribuição de cestas básicas e grupos de socialização.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/login">
            <Button size="lg" className="gap-2">
              Acessar o Sistema <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold text-foreground">O que fazemos</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Atuamos na promoção de ações sociais essenciais para famílias em situação de vulnerabilidade.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {features.map((f, i) => (
            <div key={i} className="group rounded-xl border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* About */}
    <section className="border-t bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Quem Somos</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              A ONG Mais que Social atua em Maceió – AL na promoção de ações sociais essenciais. Distribuímos cestas básicas, oferecemos atendimentos de fisioterapia e assistência social, e organizamos grupos de socialização para crianças e idosos.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Nossa missão é transformar vidas através do cuidado, do acolhimento e da promoção da dignidade humana nas comunidades mais vulneráveis de Maceió.
            </p>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-card-foreground">📍 Onde Atuamos</h3>
              <p className="mt-1 text-sm text-muted-foreground">Vergel do Lago, Benedito Bentes, Jacintinho, Tabuleiro do Martins e outras comunidades de Maceió.</p>
            </div>
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-card-foreground">📞 Contato</h3>
              <p className="mt-1 text-sm text-muted-foreground">contato@maisquesocial.org | (82) 3333-0000</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
        © 2024 Mais que Social. Todos os direitos reservados.
      </div>
    </footer>
  </div>
);

export default HomePage;
