import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Star, Eye, ExternalLink, Github, Terminal, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export default function ReposTab({ theme }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deployingRepoId, setDeployingRepoId] = useState(null);
  const [deployedApps, setDeployedApps] = useState({}); // Map repoId -> appUrl

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/repos");
      setRepos(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch repos", err);
      if (err.response?.status === 401 && err.response?.data?.code === "GITHUB_TOKEN_INVALID") {
        setError("GitHub token expired. Please re-login with GitHub.");
      } else if (err.response?.status === 400 && err.response?.data?.code === "GITHUB_NOT_CONNECTED") {
        setError("GitHub not connected. Please login with GitHub to see your repositories.");
      } else {
        setError("Failed to load repositories.");
      }
    } finally {
      setLoading(false);
    }
  };

  const [streamLogs, setStreamLogs] = useState([]);
  const [showTerminal, setShowTerminal] = useState(false);
  const streamEndRef = React.useRef(null);

  useEffect(() => {
    if (streamEndRef.current) {
      streamEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamLogs]);

  const handleDeploy = (repo) => {
    setDeployingRepoId(repo.id);
    setStreamLogs([]);
    setShowTerminal(true);

    const eventSource = new EventSource(
      `${API_BASE}/deploy?repoUrl=${encodeURIComponent(repo.clone_url)}&repoName=${encodeURIComponent(repo.name)}`,
      { withCredentials: true } // Crucial for passing the authentication cookie if any
    );

    eventSource.addEventListener("log", (e) => {
      setStreamLogs((prev) => [...prev, e.data]);
    });

    eventSource.addEventListener("success", (e) => {
      toast.success(`Successfully deployed ${repo.name}!`);
      setDeployedApps((prev) => ({ ...prev, [repo.id]: e.data }));
      setStreamLogs((prev) => [...prev, "\n✨ Deployment Successful! => " + e.data]);
      setDeployingRepoId(null);
      eventSource.close();
    });

    eventSource.addEventListener("error", (e) => {
      toast.error(`Deployment failed: ${e.data}`);
      setStreamLogs((prev) => [...prev, "\n❌ Error: " + e.data]);
      setDeployingRepoId(null);
      eventSource.close();
    });

    eventSource.onerror = (err) => {
      // EventSource closes and reconnects on error by default. Let's close it.
      if (err.eventPhase === EventSource.CLOSED) {
         setDeployingRepoId(null);
         eventSource.close();
      }
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]" style={{ color: theme.text }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.primary }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6 rounded-xl border border-dashed"
        style={{ borderColor: theme.border, color: theme.textSecondary }}>
        <Github size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">{error}</p>
        <button
          onClick={() => window.location.href = `${API_BASE}/auth/github`}
          className="mt-4 px-6 py-2 rounded-lg bg-[#24292e] text-white font-medium hover:bg-[#2f363d] transition-colors flex items-center gap-2"
        >
          <Github size={18} />
          Connect GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: theme.text }}>
          My Repositories
        </h2>
        <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {repos.length} Repositories
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repos.map((repo) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl border transition-all hover:shadow-md group relative overflow-hidden flex flex-col"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border
            }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 block text-gray-500 hover:text-blue-500"
              >
                <ExternalLink size={18} />
              </a>
            </div>

            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <GitBranch size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate pr-8" style={{ color: theme.text }}>
                  {repo.name}
                </h3>
                <p className="text-sm truncate" style={{ color: theme.textSecondary }}>
                  {repo.full_name}
                </p>
              </div>
            </div>

            <p className="text-sm mb-4 line-clamp-2 min-h-[2.5em]" style={{ color: theme.textSecondary }}>
              {repo.description || "No description available"}
            </p>

            <div className="flex items-center gap-4 text-xs font-medium mb-4" style={{ color: theme.textSecondary }}>
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`}></span>
                {repo.language || "Unknown"}
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} />
                {repo.stargazers_count}
              </div>
              <div className="flex items-center gap-1">
                <Eye size={14} />
                {repo.watchers_count}
              </div>
              <div className="ml-auto text-xs opacity-70">
                Updated {new Date(repo.updated_at).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-3">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 text-center rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-current"
                style={{
                  backgroundColor: theme.buttonGhostBg,
                  color: theme.primary,
                }}
              >
                View Code
              </a>

              {deployedApps[repo.id] ? (
                <a
                  href={deployedApps[repo.id]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 text-center rounded-lg text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
                >
                  Open App 🚀
                </a>
              ) : (
                <button
                  onClick={() => handleDeploy(repo)}
                  disabled={deployingRepoId === repo.id}
                  className={`py-2 text-center rounded-lg text-sm font-medium transition-colors ${deployingRepoId === repo.id
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                >
                  {deployingRepoId === repo.id ? "Deploying..." : "Deploy Now"}
                </button>
              )}
            </div>

          </motion.div>
        ))}
      </div>

      {repos.length === 0 && (
        <div className="text-center py-12" style={{ color: theme.textSecondary }}>
          <p>No repositories found.</p>
        </div>
      )}

      {/* TERMINAL MODAL FOR SSE */}
      <AnimatePresence>
        {showTerminal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl overflow-hidden rounded-xl shadow-2xl flex flex-col"
              style={{ backgroundColor: "#1e1e1e", border: "1px solid #333" }}
            >
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-[#333]">
                <div className="flex items-center gap-3">
                  <Terminal size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-200 font-mono">
                    AI Auto-Deployment Stream {deployingRepoId ? <Loader2 size={14} className="inline animate-spin ml-2" /> : null}
                  </span>
                </div>
                <button
                  onClick={() => setShowTerminal(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Terminal Logs */}
              <div className="p-4 h-[400px] overflow-y-auto text-sm font-mono custom-scrollbar">
                {streamLogs.length === 0 ? (
                  <p className="text-gray-500 italic">Connecting to deployment engine...</p>
                ) : (
                  streamLogs.map((log, i) => (
                    <div
                      key={i}
                      className={`break-words mb-1 ${
                        log.includes("ERROR") || log.includes("Error:") || log.includes("Failed")
                          ? "text-red-400"
                          : log.includes("Success") || log.includes("🪄")
                          ? "text-green-400"
                          : "text-gray-300"
                      }`}
                    >
                      <span className="opacity-50 mr-2 text-xs">
                        {new Date().toLocaleTimeString()}
                      </span>
                      {log}
                    </div>
                  ))
                )}
                <div ref={streamEndRef} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getLanguageColor(lang) {
  const colors = {
    JavaScript: "bg-yellow-400",
    TypeScript: "bg-blue-600",
    Go: "bg-cyan-500",
    HTML: "bg-orange-500",
    CSS: "bg-blue-500",
    Python: "bg-green-500",
    Java: "bg-red-500",
  };
  return colors[lang] || "bg-gray-400";
}
