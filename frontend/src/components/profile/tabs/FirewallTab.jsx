import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plus, X, Server, Network } from "lucide-react";
import toast from "react-hot-toast";

export default function FirewallTab({ theme }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIp, setNewIp] = useState("");
  const [newPort, setNewPort] = useState("");

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.get("/firewall");
      if (res.data.success) {
        setRules(res.data.rules || []);
      }
    } catch (err) {
      console.error("Failed to fetch firewall rules", err);
      // Let the interceptor show toast
    } finally {
      setLoading(false);
    }
  };

  const handleBlockIp = async (e) => {
    e.preventDefault();
    if (!newIp.trim()) return;

    try {
      const res = await api.post("/firewall", { action: "block", ip: newIp });
      if (res.data.success) {
        toast.success(`Success`);
        setNewIp("");
        fetchRules();
      }
    } catch (err) {}
  };

  const handleOpenPort = async (e) => {
    e.preventDefault();
    if (!newPort.trim()) return;

    try {
      const res = await api.post("/firewall", { action: "allow_port", port: newPort });
      if (res.data.success) {
        toast.success(`Port opened successfully`);
        setNewPort("");
        fetchRules();
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: theme.text }}>
          Firewall Management
        </h2>
        <p className="text-sm opacity-60">Manage iptables for the host OS to allow or restrict traffic.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Block IP Form */}
        <div className="p-6 rounded-xl border flex flex-col h-full" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <Shield size={20} />
            </div>
            <h3 className="font-semibold text-lg" style={{ color: theme.text }}>Block IP Address</h3>
          </div>
          <form onSubmit={handleBlockIp} className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="e.g. 192.168.1.50"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg bg-transparent outline-none focus:ring-1 transition-all"
              style={{ borderColor: theme.border, color: theme.text }}
            />
            <button
              disabled={!newIp.trim()}
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> Block
            </button>
          </form>
        </div>

        {/* Open Port Form */}
        <div className="p-6 rounded-xl border flex flex-col h-full" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
              <Network size={20} />
            </div>
            <h3 className="font-semibold text-lg" style={{ color: theme.text }}>Open Port</h3>
          </div>
          <form onSubmit={handleOpenPort} className="flex gap-2 mb-6">
            <input
              type="number"
              placeholder="e.g. 8080"
              value={newPort}
              onChange={(e) => setNewPort(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg bg-transparent outline-none focus:ring-1 transition-all"
              style={{ borderColor: theme.border, color: theme.text }}
            />
            <button
              disabled={!newPort.trim()}
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> Open
            </button>
          </form>
        </div>
      </div>

      {/* Rules List */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>Active Rules Snapshot</h3>
        {loading ? (
          <div className="animate-pulse flex flex-col gap-2">
            {[1, 2, 3].map(i => <div key={i} className="h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800" />)}
          </div>
        ) : rules.length > 0 ? (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: theme.border }}>
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-b" style={{ borderColor: theme.border }}>
                <tr>
                  <th className="px-4 py-3 font-medium opacity-70">Target</th>
                  <th className="px-4 py-3 font-medium opacity-70">Prot</th>
                  <th className="px-4 py-3 font-medium opacity-70">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: theme.border }}>
                {rules.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        rule.target === "DROP" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        rule.target === "ACCEPT" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}>
                        {rule.target}
                      </span>
                    </td>
                    <td className="px-4 py-3 opacity-80">{rule.prot}</td>
                    <td className="px-4 py-3 font-mono text-xs opacity-70">{rule.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl border border-dashed" style={{ borderColor: theme.border }}>
            <Server className="mx-auto mb-3 opacity-30" size={32} />
            <p className="opacity-60">No custom iptables rules detected.</p>
          </div>
        )}
      </div>
    </div>
  );
}
