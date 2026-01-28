import React, { useContext, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ThemeContext } from "@/context/ThemeContext";
import { Server, ShieldCheck, Globe, ArrowRight, Cpu } from "lucide-react";
import { Link } from "react-router-dom";

// --- SAAS DATA ---
const FEATURES = [
  {
    id: 1,
    title: "Enterprise Scale",
    description:
      "Built to handle millions of data points. Manage cohorts, equity, and cap tables without latency.",
    icon: Server,
    image:
      "https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Global Compliance",
    description:
      "GDPR, CCPA, and SOC2 Type II compliant. Your data resides in locally redundant, secure vaults.",
    icon: ShieldCheck,
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Ecosystem Connectivity",
    description:
      "Seamlessly integrate with Crunchbase, PitchBook, and government grant portals via our API.",
    icon: Globe,
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
  },
];

const STATS = [
  { label: "Startups Managed", value: "12k+" },
  { label: "Equity Tracked", value: "$4B+" },
  { label: "Institutions", value: "85+" },
];

export default function About() {
  const { theme } = useContext(ThemeContext);
  const containerRef = useRef(null);

  // Scroll Progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <div
      ref={containerRef}
      className="relative w-full -mt-[90px] overflow-hidden"
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
      }}
    >
      {/* --- SECTION 1: PARALLAX HERO --- */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1920&auto=format&fit=crop"
            alt="Tech Background"
            className="w-full h-full object-cover opacity-40 grayscale"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent, ${theme.bg})`,
            }}
          />
        </motion.div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 bg-black/5 dark:bg-white/10 backdrop-blur-md"
              style={{ borderColor: theme.navbar.border }}
            >
              <Cpu size={16} className="text-blue-500" />
              <span className="text-sm font-mono">
                System Architecture v2.0
              </span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6">
              The OS for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                Innovation.
              </span>
            </h1>
            <p className="text-xl md:text-2xl opacity-70 max-w-2xl mx-auto leading-relaxed">
              We build the digital infrastructure that empowers incubators to
              launch the next generation of unicorns.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 2: SCROLLING MARQUEE --- */}
      <div
        className="py-12 overflow-hidden bg-current opacity-5 whitespace-nowrap border-y"
        style={{ borderColor: theme.navbar.border }}
      >
        <motion.div
          initial={{ x: "0%" }}
          animate={{ x: "-100%" }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="flex gap-16 text-6xl md:text-8xl font-black uppercase select-none"
          style={{ color: theme.bg }}
        >
          <span>Venture Capital</span> • <span>Equity Management</span> •{" "}
          <span>Deal Flow</span> • <span>Due Diligence</span> •{" "}
          <span>Venture Capital</span> • <span>Equity Management</span>
        </motion.div>
      </div>

      {/* --- SECTION 3: CORE INFRASTRUCTURE (Bento Grid) --- */}
      <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Infrastructure
          </h2>
          <div className="h-1 w-24 bg-blue-600" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              style={{
                backgroundColor: theme.card?.bg || "rgba(255,255,255,0.03)",
                borderColor: theme.navbar.border,
              }}
              className="group relative h-[500px] rounded-2xl border overflow-hidden flex flex-col justify-end p-8"
            >
              {/* Image Reveal */}
              <div className="absolute inset-0 z-0">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-20 group-hover:opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="mb-6 p-4 bg-blue-600/20 w-fit rounded-xl backdrop-blur-md border border-blue-500/30">
                  <item.icon size={28} className="text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- SECTION 4: THE MISSION --- */}
      <section className="py-24 px-6 md:px-12 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-[1400px] mx-auto">
          <motion.div
            className="relative h-[600px] rounded-2xl overflow-hidden border"
            style={{ borderColor: theme.navbar.border }}
          >
            <img
              src="https://images.unsplash.com/photo-1504384308090-c54be3852f33?q=80&w=1000&auto=format&fit=crop"
              alt="Data Center"
              className="w-full h-full object-cover"
            />
            {/* Stats Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-black/80 backdrop-blur-xl flex justify-between border-t border-white/10">
              {STATS.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    {stat.value}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-8">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Data Driven <br />
              <span className="text-gray-500">Decisions.</span>
            </h2>
            <p className="text-lg opacity-70 leading-relaxed">
              In 2024, intuition isn't enough. We provide the analytics layer
              that helps institutions identify high-potential startups earlier.
              Our algorithms process thousands of signals to predict venture
              success probability.
            </p>

            <div className="flex gap-4 pt-4">
              <Link to="/contact">
                <button
                  className="px-8 py-4 border rounded-xl font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderColor: theme.navbar.border }}
                >
                  Contact Sales
                </button>
              </Link>
              <Link to="/demo">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                  Request Demo <ArrowRight size={20} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
