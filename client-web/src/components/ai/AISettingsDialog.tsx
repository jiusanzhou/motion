"use client";

import { useAIStore, type AuthMode } from "@/store/ai";

const AUTH_OPTIONS: { value: AuthMode; label: string; desc: string }[] = [
  { value: "bearer", label: "Bearer Token", desc: "Authorization: Bearer sk-..." },
  { value: "x-api-key", label: "x-api-key", desc: "x-api-key: sk-..." },
  { value: "custom", label: "Custom Header", desc: "Your own header name" },
];

export function AISettingsDialog() {
  const { config, setConfig, settingsOpen, setSettingsOpen } = useAIStore();

  if (!settingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSettingsOpen(false)}>
      <div
        className="w-full max-w-md rounded-lg border border-[var(--neutral-200)] bg-[var(--background)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">AI Settings</h2>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--neutral-500)]">API Base URL</span>
            <input
              type="url"
              value={config.baseUrl}
              onChange={(e) => setConfig({ baseUrl: e.target.value })}
              placeholder="https://api.openai.com/v1"
              className="rounded-md border border-[var(--neutral-200)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--neutral-400)]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--neutral-500)]">API Key</span>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ apiKey: e.target.value })}
              placeholder="sk-..."
              className="rounded-md border border-[var(--neutral-200)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--neutral-400)]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--neutral-500)]">Model</span>
            <input
              type="text"
              value={config.model}
              onChange={(e) => setConfig({ model: e.target.value })}
              placeholder="gpt-4o"
              className="rounded-md border border-[var(--neutral-200)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--neutral-400)]"
            />
          </label>

          {/* Auth Mode */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[var(--neutral-500)]">Authentication</span>
            <div className="flex flex-col gap-1.5">
              {AUTH_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                    config.authMode === opt.value
                      ? "border-[var(--foreground)] bg-[var(--neutral-50)]"
                      : "border-[var(--neutral-200)] hover:border-[var(--neutral-300)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="authMode"
                    value={opt.value}
                    checked={config.authMode === opt.value}
                    onChange={() => setConfig({ authMode: opt.value })}
                    className="accent-[var(--foreground)]"
                  />
                  <div className="flex flex-col">
                    <span className="text-[var(--foreground)]">{opt.label}</span>
                    <span className="text-[10px] text-[var(--neutral-400)]">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Custom header name - only show when custom is selected */}
          {config.authMode === "custom" && (
            <label className="flex flex-col gap-1">
              <span className="text-xs text-[var(--neutral-500)]">Custom Header Name</span>
              <input
                type="text"
                value={config.customHeaderName}
                onChange={(e) => setConfig({ customHeaderName: e.target.value })}
                placeholder="X-Custom-Key"
                className="rounded-md border border-[var(--neutral-200)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--neutral-400)]"
              />
            </label>
          )}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.autoCompleteEnabled}
              onChange={(e) => setConfig({ autoCompleteEnabled: e.target.checked })}
              className="accent-[var(--foreground)]"
            />
            <span className="text-sm text-[var(--foreground)]">Enable AI auto-complete</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.autoTaggingEnabled}
              onChange={(e) => setConfig({ autoTaggingEnabled: e.target.checked })}
              className="accent-[var(--foreground)]"
            />
            <span className="text-sm text-[var(--foreground)]">Auto-generate tags &amp; summary on save</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => setSettingsOpen(false)}
            className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm text-[var(--background)] hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
