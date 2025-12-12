import React, { createContext, useReducer, useContext } from 'react';

// --- 1. Initial State Definition ---
// This serves as the single source of truth for the contract data.
const INITIAL_STATE = {
    // Navigation State
    currentStep: 0, 

    // Contract Data
    contract: {
        type: '', // 'STANDARD', 'PART_TIME', 'MINOR', etc.
        jobCategory: 'OFFICE',
        
        // Parties
        employerName: '',
        workerName: '',
        
        // Dates
        startWorkDate: null,
        endWorkDate: null,

        // Step 2: Time
        workSchedule: {
        startTime: null,
        endTime: null,
        breakStartTime: null,
        breakEndTime: null,
        workingDays: [], 
        },

        // Step 3: Wage
        wage: {
        type: 'HOURLY',
        amount: '',
        hasBonus: false,
        otherAllowances: [], 
        },
    }
};

// --- 2. Action Types ---
// Define constants to prevent typos in dispatch
const ACTIONS = {
    SET_FIELD: 'SET_FIELD',       // Update a simple top-level field
    UPDATE_SECTION: 'UPDATE_SECTION', // Update a nested object (e.g., wage)
    NEXT_STEP: 'NEXT_STEP',
    PREV_STEP: 'PREV_STEP',
    RESET: 'RESET'
};

// --- 3. Reducer Function ---
// Pure function that takes current state and action, returns new state
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
        // Merges updates into a specific section (e.g., contract.wage)
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
        return INITIAL_STATE;

        default:
        throw new Error(`Unhandled action type: ${action.type}`);
    }
}

// --- 4. Context Creation ---
const ContractContext = createContext();

// --- 5. Provider Component ---
export function ContractProvider({ children }) {
    const [state, dispatch] = useReducer(contractReducer, INITIAL_STATE);

    // Helper functions to simplify dispatching in components
    const updateContractSection = (section, payload) => {
        dispatch({ type: ACTIONS.UPDATE_SECTION, section, payload });
    };

    const setContractField = (field, value) => {
        dispatch({ type: ACTIONS.SET_FIELD, field, value });
    };

    const nextStep = () => dispatch({ type: ACTIONS.NEXT_STEP });
    const prevStep = () => dispatch({ type: ACTIONS.PREV_STEP });

    const value = {
        state,
        dispatch,
        actions: { 
            updateContractSection, 
            setContractField, 
            nextStep, prevStep 
        }
    };

    return (
        <ContractContext.Provider value={value}>
            {children}
        </ContractContext.Provider>
    );
}

// --- 6. Custom Hook for easy access ---
export function useContract() {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
}