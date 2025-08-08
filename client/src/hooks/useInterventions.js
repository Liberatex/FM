import { useState, useEffect } from 'react';
import { useInterventionStore } from '../store/interventionStore';

export const useInterventions = () => {
  const { interventions, addIntervention, updateIntervention, markAsRead } = useInterventionStore();
  
  return {
    interventions,
    addIntervention,
    updateIntervention,
    markAsRead
  };
}; 