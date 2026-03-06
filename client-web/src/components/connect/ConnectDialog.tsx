"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { Octokit } from "@octokit/rest";
import { useMotionStore } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Github, Search, Loader2, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

interface GitHubRepo {
  full_name: string;
  owner: { login: string; avatar_url: string };
  name: string;
  private: boolean;
  description: string | null;
  default_branch: string;
  updated_at: string | null;
}

export function ConnectDialog() {
  const { connectDialogOpen, setConnectDialogOpen, connectRepo } =
    useMotionStore();
  const { data: session } = useSession();

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [branch, setBranch] = useState("main");
  const [basePath, setBasePath] = useState("");
  const [status, setStatus] = useState<"idle" | "connecting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!connectDialogOpen || !session?.accessToken) return;
    let cancelled = false;

    async function fetchRepos() {
      setLoading(true);
      try {
        const octokit = new Octokit({ auth: session!.accessToken });
        const allRepos: GitHubRepo[] = [];
        let page = 1;
        while (true) {
          const { data } = await octokit.repos.listForAuthenticatedUser({
            sort: "updated",
            per_page: 100,
            page,
          });
          if (cancelled) return;
          allRepos.push(...(data as unknown as GitHubRepo[]));
          if (data.length < 100) break;
          page++;
        }
        setRepos(allRepos);
        setFilteredRepos(allRepos);
      } catch {
        // Token might be expired
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRepos();
    return () => {
      cancelled = true;
    };
  }, [connectDialogOpen, session?.accessToken]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredRepos(repos);
    } else {
      const q = search.toLowerCase();
      setFilteredRepos(
        repos.filter(
          (r) =>
            r.full_name.toLowerCase().includes(q) ||
            r.description?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, repos]);

  const handleSelectRepo = useCallback((repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setBranch(repo.default_branch);
    setBasePath("");
    setStatus("idle");
    setErrorMsg("");
  }, []);

  const handleConnect = useCallback(async () => {
    if (!selectedRepo || !session?.accessToken) return;
    setStatus("connecting");
    setErrorMsg("");
    try {
      await connectRepo(
        {
          owner: selectedRepo.owner.login,
          repo: selectedRepo.name,
          branch: branch || selectedRepo.default_branch,
          basePath: basePath || undefined,
        },
        session.accessToken
      );
      setConnectDialogOpen(false);
      setSelectedRepo(null);
      setSearch("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Connection failed");
    }
  }, [selectedRepo, session?.accessToken, branch, basePath, connectRepo, setConnectDialogOpen]);

  if (!session) {
    return (
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to GitHub</DialogTitle>
            <DialogDescription>
              Sign in with GitHub to connect your knowledge base repository.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex flex-col items-center gap-4">
            <Button
              onClick={() => signIn("github")}
              className="gap-2"
            >
              <Github className="h-4 w-4" />
              Sign in with GitHub
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Repository</DialogTitle>
          <DialogDescription>
            Choose a repository to sync your knowledge base.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 flex items-center gap-2">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt=""
              className="h-6 w-6 rounded-full"
            />
          )}
          <span className="text-sm text-[var(--neutral-600)]">
            {session.user?.name ?? session.user?.email}
          </span>
        </div>

        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--neutral-400)]" />
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="mt-2 max-h-52 overflow-y-auto rounded-md border border-[var(--neutral-200)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--neutral-400)]" />
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--neutral-400)]">
              No repositories found.
            </div>
          ) : (
            filteredRepos.map((repo) => (
              <button
                key={repo.full_name}
                onClick={() => handleSelectRepo(repo)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--neutral-100)] transition-colors",
                  selectedRepo?.full_name === repo.full_name &&
                    "bg-[var(--neutral-100)]"
                )}
              >
                <BookMarked className="h-4 w-4 shrink-0 text-[var(--neutral-400)]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-medium text-[var(--neutral-800)]">
                      {repo.full_name}
                    </span>
                    {repo.private && (
                      <span className="shrink-0 rounded bg-[var(--neutral-100)] px-1.5 py-0.5 text-[10px] text-[var(--neutral-500)]">
                        private
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="truncate text-xs text-[var(--neutral-400)]">
                      {repo.description}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {selectedRepo && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--neutral-700)]">
                Branch
              </span>
              <Input
                placeholder="main"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--neutral-700)]">
                Base Path
              </span>
              <Input
                placeholder="docs/ (optional)"
                value={basePath}
                onChange={(e) => setBasePath(e.target.value)}
              />
            </label>
          </div>
        )}

        {status === "error" && (
          <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
        )}

        <Button
          onClick={handleConnect}
          disabled={!selectedRepo || status === "connecting"}
          className="mt-3"
        >
          {status === "connecting" ? "Connecting..." : "Connect"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
