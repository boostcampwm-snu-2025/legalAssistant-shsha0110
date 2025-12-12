// 1. Initial State
export const INITIAL_CONTRACT_STATE = {
    // Navigation
    currentStep: 0, 

    // Contract Data
    contract: {
        type: '', // 'STANDARD', 'PART_TIME', 'MINOR', etc.
        jobCategory: 'OFFICE',
        
        // 1. Parties
        employerName: '',
        workerName: '',

        // 2. Basic Info
        workplace: '',         
        jobDescription: '',
        startWorkDate: null,
        endWorkDate: null,

        // 3. Time & Schedule
        workSchedule: {
            startTime: null,      
            endTime: null,        
            breakStartTime: null, 
            breakEndTime: null,   
            workingDays: [],      // e.g., ['Mon', 'Tue']
            weeklyHoliday: '',    // e.g., 'Sun'
        },

        // 4. Wage
        wage: {
            type: 'HOURLY',
            amount: '',
            hasBonus: false,
            bonusAmount: '',      // Added for bonus value
            otherAllowances: [], 
            paymentDate: '',      // Added
            paymentMethod: '',    // Added
            hasProbation: false,  // Added
            probationWagePercent: 100, // Added
        },

        // 5. Additional Info (New Fields for Standard Contract Items 7~11)
        otherDetails: {
            annualLeave: true,        // Item 7: Annual Paid Leave (Default: Follow Labor Law)
            socialInsurance: {        // Item 8: Social Insurance
                employment: true,       // 고용
                accident: true,         // 산재
                pension: true,          // 국민
                health: true,           // 건강
            },
            contractDelivery: true,   // Item 9: Delivery of contract (Mandatory)
            otherTerms: '',           // Item 11: Other specific terms
        },
    }
};

// 2. Constants
export const WEEKDAYS = [
    { value: 'Mon', label: '월(Mon)' },
    { value: 'Tue', label: '화(Tue)' },
    { value: 'Wed', label: '수(Wed)' },
    { value: 'Thu', label: '목(Thu)' },
    { value: 'Fri', label: '금(Fri)' },
    { value: 'Sat', label: '토(Sat)' },
    { value: 'Sun', label: '일(Sun)' },
];

export const CONTRACT_TYPES = [
    { value: 'STANDARD', label: '정규직 (Standard)' },
    { value: 'FIXED_TERM', label: '계약직 (Fixed-Term)' },
    { value: 'PART_TIME', label: '아르바이트 (Part-Time)' },
    { value: 'MINOR', label: '연소자 (Minor)' },
];