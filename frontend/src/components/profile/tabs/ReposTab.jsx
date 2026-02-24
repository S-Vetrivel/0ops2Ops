import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { GitBranch, Star, Eye, ExternalLink, Github } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

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
      const res = await axios.get(`${API_BASE}/repos`, {
        withCredentials: true,
      });
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

  const handleDeploy = async (repo) => {
    setDeployingRepoId(repo.id);
    const toastId = toast.loading(`Deploying ${repo.name}... This may take a while.`);

    try {
      const res = await axios.post(`${API_BASE}/deploy`, {
        repoUrl: repo.clone_url,
        repoName: repo.name
      }, {
        withCredentials: true
      });

      if (res.data.success) {
        toast.success(`Successfully deployed ${repo.name}!`, { id: toastId });
        setDeployedApps(prev => ({ ...prev, [repo.id]: res.data.appUrl }));
      } else {
        toast.error(`Deployment failed: ${res.data.error || "Unknown error"}`, { id: toastId });
      }
    } catch (err) {
      console.error("Deployment error", err);
      toast.error(`Deployment failed: ${err.response?.data?.error || err.message}`, { id: toastId });
    } finally {
      setDeployingRepoId(null);
    }
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
