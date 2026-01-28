import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Link } from "react-router-dom";
import {
  Activity,
  Box,
  CheckCircle2,
  Clock,
  ExternalLink,
  GitBranch,
  Globe,
  MoreHorizontal,
  Plus,
  Search,
  Server,
  AlertCircle,
  Play,
  Square
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";

const StatusBadge = ({ state }) => {
  let colors = "";
  let dot = "";

  // Docker States: running, exited, dead, paused, restarting, created, removing
  switch (state) {
    case "running":
      colors = "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
      dot = "bg-emerald-500";
      break;
    case "restarting":
      colors = "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
      dot = "bg-amber-500 animate-pulse";
      break;
    case "exited":
      colors = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700";
      dot = "bg-zinc-400";
      break;
    default:
      colors = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700";
      dot = "bg-zinc-400";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {state?.toUpperCase()}
    </span>
  );
};

export default function Home() {
  const { theme } = useContext(ThemeContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/services", { withCredentials: true });
      if (res.data.success) {
        setServices(res.data.services);
      }
    } catch (err) {
      console.error("Failed to fetch services", err);
      // toast.error("Could not load services"); // Commented to avoid init spam if auth fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 5000); // Polling every 5s
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, action) => {
    try {
      await axios.post(`http://localhost:3000/api/services/${id}/${action}`, {}, { withCredentials: true });
      toast.success(`Container ${action}ed successfully`);
      fetchServices();
    } catch (err) {
      toast.error(`Failed to ${action} container`);
    }
  };

  const filteredServices = services.filter(s => {
    const name = s.Names?.[0] || s.Id;
    return name.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h1>
          <p className="text-sm opacity-60">Real-time overview of your local Docker containers.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus size={16} />
            New Deployment
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Containers", value: services.length, icon: Server },
          { label: "Running", value: services.filter(s => s.State === "running").length, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Stopped", value: services.filter(s => s.State !== "running").length, icon: AlertCircle, color: "text-zinc-500" },
        ].map((m, i) => (
          <div key={i} className="p-4 border rounded-xl flex items-center justify-between" style={{ borderColor: theme.navbar.border, backgroundColor: theme.card.bg }}>
            <div>
              <p className="text-sm opacity-60 font-medium">{m.label}</p>
              <p className="text-2xl font-bold mt-1">{m.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 ${m.color || ''}`}>
              <m.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search containers..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg bg-transparent focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all"
            style={{ borderColor: theme.navbar.border }}
          />
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold opacity-50 uppercase tracking-wider">Active Containers</h2>

        <div className="grid gap-3">
          {filteredServices.map((service) => {
            const name = service.Names?.[0].replace("/", "") || service.Id.substring(0, 12);
            const isRunning = service.State === "running";

            return (
              <motion.div
                key={service.Id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ borderColor: theme.navbar.border, backgroundColor: theme.card.bg }}
                className="group border rounded-xl p-4 md:p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-lg border bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: theme.navbar.border }}>
                      <Box size={20} className="opacity-70" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base flex items-center gap-2" title={service.Image}>
                          {name}
                          <span className="text-xs font-normal opacity-50 p-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                            {service.Image.split(":")[0]}
                          </span>
                        </h3>
                        <StatusBadge state={service.State} />
                      </div>
                      <div className="flex items-center gap-4 text-xs opacity-60 mt-1.5 font-medium">
                        <span className="flex items-center gap-1">
                          ID: {service.Id.substring(0, 8)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {service.Status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isRunning ? (
                      <button
                        onClick={() => handleAction(service.Id, "stop")}
                        className="p-2 hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Stop">
                        <Square size={16} fill="currentColor" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(service.Id, "start")}
                        className="p-2 hover:bg-emerald-50 text-emerald-600 dark:hover:bg-emerald-900/20 rounded-md transition-colors" title="Start">
                        <Play size={16} fill="currentColor" />
                      </button>
                    )}

                    <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-500">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {filteredServices.length === 0 && !loading && (
            <div className="text-center py-12 border border-dashed rounded-xl" style={{ borderColor: theme.navbar.border }}>
              <p className="opacity-50">No containers found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
