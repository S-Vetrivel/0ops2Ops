import React, { useContext } from "react";
import { motion } from "framer-motion";
import {
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Send,
  MapPin,
  Mail,
  Phone,
  Server, // Added server icon for SaaS vibe
} from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";

// --- SaaS / Entrepreneurship Data Structure ---
const FOOTER_LINKS = [
  {
    title: "Platform",
    links: [
      "Dashboard",
      "Venture Analytics",
      "Equity Management",
      "Team Collaboration",
      "API Access",
      "System Status",
    ],
  },
  {
    title: "Resources",
    links: [
      "Documentation",
      "Startup Guides",
      "Funding Database",
      "Community Forum",
      "Developer Blog",
    ],
  },
  {
    title: "Company",
    links: [
      "About Ihyaet",
      "Our Partners",
      "Security & Compliance",
      "Careers",
      "Contact Sales",
    ],
  },
];

const CONTACT_DETAILS = [
  { icon: MapPin, text: "Tech Park, Sector 5, Cyber Hub" },
  { icon: Mail, text: "enterprise@ihyaet.com" },
  { icon: Phone, text: "+1 (800) 420-6969" },
];

const SOCIALS = [
  { icon: Twitter, href: "#" },
  { icon: Linkedin, href: "#" },
  { icon: Github, href: "#" },
  { icon: Instagram, href: "#" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const Footer = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <footer
      className="relative pt-24 pb-8 overflow-hidden transition-colors duration-500"
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
        borderTop: `1px solid ${theme.navbar.border}`,
      }}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-24"
        >
          {/* --- 1. Brand & Newsletter Section (Cols 1-5) --- */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 flex flex-col gap-8"
          >
            <div>
              <h2 className="text-3xl font-black tracking-tighter mb-4">
                BUILD THE FUTURE.
              </h2>
              <p
                className="text-sm mb-6 max-w-md leading-relaxed"
                style={{ color: theme.navbar.textIdle }}
              >
                The all-in-one operating system for modern entrepreneurs. Manage
                equity, track metrics, and scale your venture with
                enterprise-grade tools.
              </p>

              <div className="relative max-w-sm group">
                <input
                  type="email"
                  placeholder="work-email@company.com"
                  className="w-full bg-transparent border-b py-3 pr-12 text-sm outline-none transition-all focus:border-current"
                  style={{
                    borderColor: theme.navbar.border,
                    color: theme.text,
                  }}
                />
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 opacity-50 group-hover:opacity-100 transition-opacity"
                  aria-label="Subscribe"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              {SOCIALS.map((Social, idx) => (
                <motion.a
                  key={idx}
                  href={Social.href}
                  whileHover={{ y: -4, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-full border transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                  style={{ borderColor: theme.navbar.border }}
                >
                  <Social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* --- 2. Links Section (Cols 6-12) --- */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Dynamic Links Columns */}
            {FOOTER_LINKS.map((section, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <h3 className="font-bold mb-6 text-sm uppercase tracking-wider opacity-80">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <motion.a
                        href="#"
                        className="text-sm block w-fit"
                        style={{ color: theme.navbar.textIdle }}
                        whileHover={{ x: 4, color: theme.text }}
                        transition={{ duration: 0.2 }}
                      >
                        {link}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Static Contact Column */}
            <motion.div variants={itemVariants}>
              <h3 className="font-bold mb-6 text-sm uppercase tracking-wider opacity-80">
                Support
              </h3>
              <ul className="space-y-6">
                {CONTACT_DETAILS.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <detail.icon
                      size={18}
                      className="mt-0.5 opacity-70 shrink-0"
                    />
                    <span style={{ color: theme.navbar.textIdle }}>
                      {detail.text}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* --- Bottom Section & Status --- */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs"
          style={{
            borderColor: theme.navbar.border,
            color: theme.navbar.textIdle,
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <p>© 2024 Ihyaet Inc. All rights reserved.</p>
          </div>

          <div className="flex gap-6">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline">
              Terms of Service
            </a>
            <a href="#" className="hover:underline">
              Sitemap
            </a>
          </div>
        </motion.div>

        {/* --- Big Background Text Effect --- */}
        <div className="relative mt-12 select-none pointer-events-none overflow-hidden h-[12vw] md:h-[10vw]">
          <motion.h1
            initial={{ y: "100%" }}
            whileInView={{ y: "15%" }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="text-[18vw] md:text-[14vw] font-black leading-none text-center absolute left-1/2 -translate-x-1/2 bottom-0 w-full"
            style={{
              color: theme.text,
              opacity: 0.03, // Subtle opacity for the watermark
            }}
          >
            ihyaet
          </motion.h1>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
