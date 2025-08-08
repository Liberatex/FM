import { create } from 'zustand';

export const useInterventionStore = create((set, get) => ({
  interventions: [],
  unreadCount: 0,

  addIntervention: (intervention) => {
    set((state) => ({
      interventions: [intervention, ...state.interventions],
      unreadCount: state.unreadCount + 1,
    }));
  },

  updateIntervention: (interventionId, updates) => {
    set((state) => ({
      interventions: state.interventions.map((intervention) =>
        intervention.id === interventionId
          ? { ...intervention, ...updates }
          : intervention
      ),
    }));
  },

  markAsRead: (interventionId) => {
    set((state) => ({
      interventions: state.interventions.map((intervention) =>
        intervention.id === interventionId
          ? { ...intervention, isRead: true }
          : intervention
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  clearInterventions: () => {
    set({ interventions: [], unreadCount: 0 });
  },

  getUnreadInterventions: () => {
    return get().interventions.filter((intervention) => !intervention.isRead);
  },
})); 