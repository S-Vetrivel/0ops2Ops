import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { ShieldAlert, Activity, Clock, Server } from "lucide-react";
import { motion } from "framer-motion";

export default function LogsWidget({ theme }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get("/logs");
      if (res.data.success) {
        setLogs(res.data.logs.slice(0, 50)); // Keep top 50 in memory for dashboard
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && logs.length === 0) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />)}
      </div>
    );
  }

  const getLogIcon = (type) => {
    if (type === "attack") return <ShieldAlert className="text-red-500" size={18} />;
    if (type === "user") return <Activity className="text-blue-500" size={18} />;
    return <Server className="text-emerald-500" size={18} />;
  };

  const getLogStyle = (type) => {
    if (type === "attack") return "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30";
    return "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800";
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold opacity-50 uppercase tracking-wider mb-2">Live Application Logs</h2>
      
      {logs.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl" style={{ borderColor: theme.navbar?.border || '#ccc' }}>
          <p className="opacity-50">No logs captured yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border flex flex-col gap-2 transition-colors ${getLogStyle(log.type)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getLogIcon(log.type)}
                  <span className="font-semibold text-sm capitalize">{log.type} Event</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono">
                    {log.method} {log.path}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs opacity-60">
                  <Clock size={12} />
                  <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm opacity-80 font-medium">{log.message}</p>
                <div className="text-xs font-mono px-2 py-1 bg-black/10 dark:bg-white/10 rounded-md">
                  {log.ip}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
