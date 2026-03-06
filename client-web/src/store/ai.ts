import { create } from "zustand";

export interface AIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  autoCompleteEnabled: boolean;
}

interface AIStore {
  config: AIConfig;
  chatOpen: boolean;
  settingsOpen: boolean;
  setConfig: (config: Partial<AIConfig>) => void;
  setChatOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
}

const STORAGE_KEY = "motion:ai-config";

function loadConfig(): AIConfig {
  const defaults: AIConfig = {
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    model: "gpt-4o",
    autoCompleteEnabled: false,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return defaults;
}

export const useAIStore = create<AIStore>((set, get) => ({
  config: loadConfig(),
  chatOpen: false,
  settingsOpen: false,
  setConfig: (partial) => {
    const config = { ...get().config, ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    set({ config });
  },
  setChatOpen: (chatOpen) => set({ chatOpen }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
}));
