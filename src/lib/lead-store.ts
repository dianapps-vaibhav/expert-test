import { create } from 'zustand';

export interface Lead {
  name: string;
  email: string;
  industry: string;
  submitted_at: string;
}

interface LeadStore {
  submitted: boolean;
  sessionLeads: Lead[];
  setSubmitted: (submitted: boolean) => void;
  addLead: (lead: Lead) => void;
}

export const useLeadStore = create<LeadStore>((set) => ({
  submitted: false,
  sessionLeads: [],

  setSubmitted: (submitted: boolean) => {
    set({ submitted });
  },

  addLead: (lead: Lead) => {
    set((state) => ({
      sessionLeads: [...state.sessionLeads, lead],
    }));
  },
}));