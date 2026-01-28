import React, { useContext, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ThemeContext } from "@/context/ThemeContext";
import {
  Send,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Building2,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function Contact() {
  const { theme } = useContext(ThemeContext);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [formStatus, setFormStatus] = useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus("submitting");
    setTimeout(() => setFormStatus("success"), 2000);
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full -mt-[90px] overflow-hidden"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      {/* --- 1. HERO SECTION --- */}
      <section className="relative h-[80vh] flex flex-col justify-center px-6 md:px-12 pt-20">
        <div className="max-w-[1400px] mx-auto w-full z-10">
          <motion.div style={{ y: yHero, opacity: opacityHero }}>
            <motion.h1
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl font-black tracking-tight leading-[0.95]"
            >
              Partner with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                Ihyaet.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-8 text-xl max-w-2xl leading-relaxed"
            >
              Ready to digitize your incubation center? Schedule a demo with our
              enterprise team or inquire about API access.
            </motion.p>
          </motion.div>
        </div>

        {/* Decorative Background */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to left, transparent, ${theme.bg})`,
            }}
          />
          {/* Abstract Tech Grid Image */}
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop"
            className="w-full h-full object-cover grayscale"
            alt="Global Network"
          />
        </div>
      </section>

      {/* --- 2. CONTACT INFO --- */}
      <section className="py-24 px-6 md:px-12">
        <motion.div
          className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Card 1: Sales */}
          <motion.div
            variants={fadeInUp}
            className="p-8 rounded-2xl border flex flex-col justify-between h-[280px] group hover:border-blue-500/50 transition-colors"
            style={{
              borderColor: theme.navbar?.border,
              backgroundColor: theme.bg === "#000000" ? "#111" : "#fafafa",
            }}
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                <Building2 size={28} />
              </div>
              <ArrowRight className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-500" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">
                Enterprise Sales
              </h3>
              <a
                href="mailto:sales@ihyaet.com"
                className="text-2xl font-bold hover:text-blue-500 transition-colors"
              >
                sales@ihyaet.com
              </a>
            </div>
          </motion.div>

          {/* Card 2: HQ */}
          <motion.div
            variants={fadeInUp}
            className="p-8 rounded-2xl border flex flex-col justify-between h-[280px] group hover:border-blue-500/50 transition-colors"
            style={{
              borderColor: theme.navbar?.border,
              backgroundColor: theme.bg === "#000000" ? "#111" : "#fafafa",
            }}
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
                <MapPin size={28} />
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">
                Global HQ
              </h3>
              <p className="text-xl font-medium">
                42 Innovation Dr,
                <br />
                Silicon Valley, CA 94025
              </p>
            </div>
          </motion.div>

          {/* Card 3: Support */}
          <motion.div
            variants={fadeInUp}
            className="p-8 rounded-2xl border flex flex-col justify-between h-[280px] group hover:border-blue-500/50 transition-colors"
            style={{
              borderColor: theme.navbar?.border,
              backgroundColor: theme.bg === "#000000" ? "#111" : "#fafafa",
            }}
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
                <ShieldCheck size={28} />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />{" "}
                System Normal
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">
                Technical Support
              </h3>
              <p className="text-2xl font-bold">+1 (888) 420-0099</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* --- 3. B2B FORM --- */}
      <section
        className="py-24 px-6 md:px-12 border-t"
        style={{ borderColor: theme.navbar?.border }}
      >
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">
              Accelerate your <br />
              Growth.
            </h2>
            <p className="text-lg opacity-60 leading-relaxed mb-10 max-w-md">
              Fill out the form to speak with an implementation specialist. We
              can have your institution onboarded in less than 48 hours.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 opacity-70">
                <MessageSquare className="text-blue-500" />
                <span>Priority Enterprise Support Included</span>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-50">
                  Work Email
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-transparent border-b py-3 focus:outline-none focus:border-blue-500 transition-colors"
                  style={{ borderColor: theme.navbar?.border }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-50">
                  Company / Institution
                </label>
                <input
                  type="text"
                  placeholder="Acme Inc."
                  className="w-full bg-transparent border-b py-3 focus:outline-none focus:border-blue-500 transition-colors"
                  style={{ borderColor: theme.navbar?.border }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-50">
                I am interested in...
              </label>
              <select
                className="w-full bg-transparent border-b py-3 focus:outline-none focus:border-blue-500 transition-colors"
                style={{ borderColor: theme.navbar?.border, color: theme.text }}
              >
                <option className="bg-black text-white">Platform Demo</option>
                <option className="bg-black text-white">API Access</option>
                <option className="bg-black text-white">
                  Investment Partnership
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-50">
                Message
              </label>
              <textarea
                rows="3"
                placeholder="Tell us about your cohort size..."
                className="w-full bg-transparent border-b py-3 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                style={{ borderColor: theme.navbar?.border }}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={formStatus !== "idle"}
                className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {formStatus === "idle" ? (
                  <>
                    Send Request <Send size={18} />
                  </>
                ) : (
                  "Submitting..."
                )}
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* --- 4. MAP --- */}
      <section className="h-[50vh] w-full relative grayscale invert overflow-hidden">
        <iframe
          src="https://maps.google.com/maps?q=San+Francisco&t=&z=13&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0, opacity: 0.6 }}
          allowFullScreen=""
          loading="lazy"
          title="Map"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
      </section>
    </div>
  );
}
