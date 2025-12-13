import React, { createContext, useReducer, useContext, useMemo } from 'react';
import { INITIAL_CONTRACT_STATE } from '../constants/contractConstants';

// --- Action Types ---
const ACTIONS = {
    SET_FIELD: 'SET_FIELD',       
    UPDATE_SECTION: 'UPDATE_SECTION', 
    NEXT_STEP: 'NEXT_STEP',
    PREV_STEP: 'PREV_STEP',
    RESET: 'RESET'
};

// --- Reducer Function ---
function contractReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_FIELD:
        return {
            ...state,
            contract: {
            ...state.contract,
            [action.field]: action.value
            }
        };

        case ACTIONS.UPDATE_SECTION:
        return {
            ...state,
            contract: {
            ...state.contract,
            [action.section]: {
                ...state.contract[action.section],
                ...action.payload
            }
            }
        };

        case ACTIONS.NEXT_STEP:
        return { ...state, currentStep: state.currentStep + 1 };

        case ACTIONS.PREV_STEP:
        return { ...state, currentStep: Math.max(0, state.currentStep - 1) };

        case ACTIONS.RESET:
        return INITIAL_CONTRACT_STATE;

        default:
        throw new Error(`Unhandled action type: ${action.type}`);
    }
}

// --- Context Creation ---
const ContractContext = createContext();

// --- Provider Component ---
export function ContractProvider({ children }) {
    const [state, dispatch] = useReducer(contractReducer, INITIAL_CONTRACT_STATE);

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(() => {
        const updateContractSection = (section, payload) => {
            dispatch({ type: ACTIONS.UPDATE_SECTION, section, payload });
        };
    
        const setContractField = (field, value) => {
            dispatch({ type: ACTIONS.SET_FIELD, field, value });
        };
    
        const nextStep = () => dispatch({ type: ACTIONS.NEXT_STEP });
        const prevStep = () => dispatch({ type: ACTIONS.PREV_STEP });

        return {
            state,
            dispatch,
            actions: { 
                updateContractSection, 
                setContractField, 
                nextStep, 
                prevStep 
            }
        };
    }, [state]); // Re-create only when state changes

    return (
        <ContractContext.Provider value={value}>
            {children}
        </ContractContext.Provider>
    );
}

// --- Custom Hook ---
export function useContract() {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
}