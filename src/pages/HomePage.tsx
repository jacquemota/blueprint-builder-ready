import { Link } from "react-router-dom";
import {
  Heart,
  Users,
  HeartHandshake,
  Package,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5 },
  }),
};

const features = [
  {
    icon: Users,
    title: "Gestão de Famílias",
    desc: "Cadastro completo e prontuário digital unificado para cada família atendida.",
  },
  {
    icon: HeartHandshake,
    title: "Atendimentos",
    desc: "Registro de fisioterapia, assistência social e orientações com histórico completo.",
  },
  {
    icon: Package,
    title: "Cestas Básicas",
    desc: "Controle de distribuição com alerta de duplicidade para garantir equidade.",
  },
];

const stats = [
  { value: "500+", label: "Famílias atendidas" },
  { value: "2.000+", label: "Atendimentos realizados" },
  { value: "1.500+", label: "Cestas distribuídas" },
];

const HomePage = () => (
  <div className="min-h-screen bg-background">
    {/* Header */}
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Mais que Social
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a
            href="#quem-somos"
            className="hover:text-foreground transition-colors"
          >
            Quem Somos
          </a>
          <a href="#missao" className="hover:text-foreground transition-colors">
            Missão
          </a>
          <a
            href="#contato"
            className="hover:text-foreground transition-colors"
          >
            Contato
          </a>
        </nav>
        <Link to="/login">
          <Button>Entrar no Sistema</Button>
        </Link>
      </div>
    </header>

    {/* Hero */}
    <section className="relative overflow-hidden gradient-hero py-24 md:py-32">
      <div className="relative mx-auto max-w-6xl px-4 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium text-primary-foreground/80 mb-6"
        >
          <MapPin className="h-4 w-4" /> Maceió — AL
        </motion.div>
        <motion.h1
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary-foreground"
        >
          Transformando vidas com{" "}
          <span className="text-secondary">gestão social</span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/70"
        >
          Sistema de gestão digital da ONG Mais que Social. Cadastro de
          famílias, controle de atendimentos, distribuição de cestas básicas e
          grupos de socialização.
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          custom={3}
          variants={fadeUp}
          className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link to="/login">
            <Button
              size="lg"
              className="gradient-warm border-0 text-secondary-foreground shadow-lg hover:opacity-90 gap-2"
            >
              Acessar o Sistema <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#quem-somos">
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10"
            >
              Saiba Mais
            </Button>
          </a>
        </motion.div>
      </div>
    </section>

    {/* Stats */}
    <section className="py-16 border-b">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 sm:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="text-center"
            >
              <div className="text-3xl font-bold text-primary">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Quem Somos */}
    <section id="quem-somos" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold text-foreground">
          Quem Somos
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Atuamos na promoção de ações sociais essenciais para famílias em
          situação de vulnerabilidade.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="group glass-elevated p-6 hover:shadow-lg transition-all"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Missão */}
    <section id="missao" className="bg-muted/50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Nossa Missão</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              A ONG Mais que Social atua em Maceió – AL na promoção de ações
              sociais essenciais. Distribuímos cestas básicas, oferecemos
              atendimentos de fisioterapia e assistência social, e organizamos
              grupos de socialização para crianças e idosos.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Nossa missão é transformar vidas através do cuidado, do
              acolhimento e da promoção da dignidade humana nas comunidades mais
              vulneráveis de Maceió.
            </p>
          </div>
          <div className="space-y-4">
            <div className="glass-elevated p-5">
              <h3 className="font-semibold text-card-foreground">
                📍 Onde Atuamos
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Vergel do Lago, Benedito Bentes, Jacintinho, Tabuleiro do
                Martins e outras comunidades de Maceió.
              </p>
            </div>
            <div className="glass-elevated p-5">
              <h3 className="font-semibold text-card-foreground">
                🤝 Nossos Serviços
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Fisioterapia, assistência social, distribuição de cestas
                básicas, grupos de socialização para idosos e crianças.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Contato */}
    <section id="contato" className="py-20">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-3xl font-bold text-foreground">Contato</h2>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-sm">Maceió — AL</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Phone className="h-5 w-5 text-primary" />
            <span className="text-sm">(82) 3333-0000</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="h-5 w-5 text-primary" />
            <span className="text-sm">contato@maisquesocial.org</span>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Mais que Social. Todos os direitos
        reservados.
      </div>
    </footer>
  </div>
);

export default HomePage;
