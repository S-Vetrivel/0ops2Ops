import React, { useContext, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Users,
  Layers,
  ShieldCheck,
  Globe,
  Zap,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { ThemeContext } from "@/context/ThemeContext";

// --- ASSETS & DATA ---
const PARTNERS = [
  "MIT Innovation",
  "TechStars",
  "Y Combinator",
  "Stanford Startups",
  "500 Global",
  "Sequoia Capital",
];

const FEATURES = [
  {
    title: "Portfolio Management",
    desc: "Track equity, cap tables, and valuation across your entire cohort in real-time.",
    icon: BarChart3,
    colSpan: "col-span-12 md:col-span-8",
    bg: "bg-blue-600/5",
  },
  {
    title: "Mentor Matching",
    desc: "AI-driven matching connecting founders with the right industry experts.",
    icon: Users,
    colSpan: "col-span-12 md:col-span-4",
    bg: "bg-purple-600/5",
  },
  {
    title: "Grant & Funding Pipelines",
    desc: "Streamline application workflows, due diligence, and fund disbursement tracking.",
    icon: Layers,
    colSpan: "col-span-12 md:col-span-4",
    bg: "bg-emerald-600/5",
  },
  {
    title: "Impact Reporting",
    desc: "Generate ISO-compliant impact reports for stakeholders and government bodies.",
    icon: Globe,
    colSpan: "col-span-12 md:col-span-8",
    bg: "bg-orange-600/5",
  },
];

// --- COMPONENTS ---

const AnimatedGridBackground = ({ theme }) => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(${theme.text} 1px, transparent 1px), linear-gradient(90deg, ${theme.text} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}
    />
    {/* Glowing Orb */}
    <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
    <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
  </div>
);

const FeatureCard = ({ feature, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    whileHover={{ y: -5 }}
    className={`${feature.colSpan} relative overflow-hidden rounded-3xl border p-8 transition-all group`}
    style={{
      borderColor: theme.navbar.border,
      backgroundColor: theme.bg === "#000000" ? "#111" : "#fff", // Subtle contrast
    }}
  >
    <div
      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${feature.bg}`}
    />

    <div className="relative z-10 flex flex-col h-full">
      <div className="mb-6 p-3 w-fit rounded-xl bg-black/5 dark:bg-white/10">
        <feature.icon size={24} style={{ color: theme.text }} />
      </div>
      <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
      <p
        style={{ color: theme.navbar.textIdle }}
        className="leading-relaxed mb-8"
      >
        {feature.desc}
      </p>

      <div className="mt-auto flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 text-blue-500">
        Explore Module <ArrowRight size={14} />
      </div>
    </div>
  </motion.div>
);

export default function Home() {
  const { theme } = useContext(ThemeContext);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen font-sans selection:bg-blue-500/30"
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
      }}
    >
      <AnimatedGridBackground theme={theme} />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto min-h-[90vh] flex flex-col justify-center items-center text-center">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 text-sm font-medium backdrop-blur-md"
            style={{
              borderColor: theme.navbar.border,
              backgroundColor: "rgba(120,120,120,0.1)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>v2.4 Now Live: Enhanced Equity Tracking</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
            Manage the next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-500 to-purple-600">
              Unicorn Generation.
            </span>
          </h1>

          <p
            className="text-lg md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: theme.navbar.textIdle }}
          >
            The operating system for incubators, accelerators, and venture labs.
            Streamline deal flow, monitor portfolio health, and automate
            reporting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/demo"
              className="px-8 py-4 rounded-xl font-bold text-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 group"
            >
              Request Demo
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-4 rounded-xl font-bold text-lg border hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              style={{ borderColor: theme.navbar.border }}
            >
              View Pricing
            </Link>
          </div>
        </motion.div>

        {/* --- HERO DASHBOARD PREVIEW --- */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "circOut" }}
          className="relative mt-20 w-full max-w-6xl aspect-[16/9] rounded-t-2xl border-t border-l border-r overflow-hidden shadow-2xl"
          style={{
            borderColor: theme.navbar.border,
            background: `linear-gradient(180deg, ${
              theme.bg === "#000000" ? "#1a1a1a" : "#f5f5f5"
            } 0%, ${theme.bg} 100%)`,
          }}
        >
          {/* Mock UI Header */}
          <div
            className="h-12 border-b flex items-center px-4 gap-2"
            style={{ borderColor: theme.navbar.border }}
          >
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/20" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
              <div className="w-3 h-3 rounded-full bg-green-500/20" />
            </div>
            <div className="ml-4 px-3 py-1 rounded bg-black/5 dark:bg-white/5 text-xs font-mono opacity-50">
              ihyaet-dashboard-v2.tsx
            </div>
          </div>

          {/* Mock Content Area */}
          <div className="p-8 grid grid-cols-3 gap-6 opacity-80 pointer-events-none select-none">
            {/* Simple Skeleton UI for effect */}
            <div className="col-span-2 space-y-4">
              <div className="h-40 rounded-xl bg-blue-500/10 border border-blue-500/20" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 rounded-xl bg-black/5 dark:bg-white/5" />
                <div className="h-32 rounded-xl bg-black/5 dark:bg-white/5" />
              </div>
            </div>
            <div className="col-span-1 space-y-4">
              <div className="h-full rounded-xl bg-purple-500/5 border border-purple-500/10" />
            </div>
          </div>

          {/* Overlay Gradient for Fade */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] to-transparent"
            style={{ "--bg": theme.bg }}
          />
        </motion.div>
      </section>

      {/* --- TRUSTED BY TICKER --- */}
      <section
        className="py-12 border-y overflow-hidden"
        style={{ borderColor: theme.navbar.border }}
      >
        <div className="text-center mb-6 text-sm font-bold uppercase tracking-widest opacity-40">
          Trusted by World-Class Institutions
        </div>
        <div className="flex w-full overflow-hidden mask-gradient-x">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            className="flex items-center gap-16 whitespace-nowrap pr-16"
          >
            {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, idx) => (
              <span
                key={idx}
                className="text-2xl md:text-3xl font-bold opacity-30 select-none"
              >
                {partner}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- BENTO GRID FEATURES --- */}
      <section className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="mb-20 max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything you need to <br />
            <span className="text-blue-500">Accelerate Growth.</span>
          </h2>
          <p className="text-lg opacity-60">
            Replace fragmented spreadsheets with a unified operating system
            designed for the unique needs of incubation centers and venture
            firms.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {FEATURES.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} theme={theme} />
          ))}
        </div>
      </section>

      {/* --- METRICS / STATS --- */}
      <section
        className="py-24 bg-black/5 dark:bg-white/5 border-y"
        style={{ borderColor: theme.navbar.border }}
      >
        <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { value: "$1.2B+", label: "Assets Under Management" },
            { value: "4,500+", label: "Startups Tracked" },
            { value: "120+", label: "Global Institutions" },
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-5xl md:text-6xl font-black mb-2 tracking-tighter">
                {stat.value}
              </span>
              <span className="text-sm font-bold uppercase tracking-widest opacity-50">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-40 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            Ready to digitize your <br /> ecosystem?
          </h2>
          <p className="text-xl opacity-60 mb-12 max-w-2xl mx-auto">
            Join the network of forward-thinking institutions using Ihyaet to
            power the next generation of founders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-5 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors">
              Start Free Trial
            </button>
            <button
              className="px-10 py-5 rounded-xl border font-bold text-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ borderColor: theme.navbar.border }}
            >
              Talk to Sales
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 opacity-50 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} /> SOC2 Compliant
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} /> No credit card required
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
