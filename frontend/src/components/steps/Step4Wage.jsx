import React, { useMemo } from 'react';
import { 
  Grid, Typography, Box, TextField, MenuItem, 
  InputAdornment, FormControlLabel, Switch, Button 
} from '@mui/material';
import { useContract } from '../../contexts/ContractContext';
import { formatCurrency, parseCurrency } from '../../utils/formatUtils';

// Constants for validation
// 2025 Minimum Wage in KRW
const MIN_WAGE_2025 = 10030; 

export default function Step4Wage() {
    const { state, actions } = useContract();
    const { wage, jobCategory } = state.contract;

    // --- 1. Event Handlers ---

    /**
     * Handles changes for currency input fields.
     * Parses the comma-separated string back to a raw number before saving.
     */
    const handleAmountChange = (e) => {
        const rawValue = parseCurrency(e.target.value);
        
        // If input is not a number (e.g., empty), set it to empty string
        if (isNaN(rawValue)) {
            actions.updateContractSection('wage', { amount: '' });
            return;
        }
        actions.updateContractSection('wage', { amount: rawValue });
    };

    /**
     * Handles generic changes for wage fields.
     */
    const handleChange = (field, value) => {
        actions.updateContractSection('wage', { [field]: value });
    };

    /**
     * Handles changes for the Job Category (Top-level field).
     * This affects the probation logic.
     */
    const handleJobChange = (e) => {
        actions.setContractField('jobCategory', e.target.value);
    };

    // --- 2. Validation & Logic ---

    /**
     * Checks if the entered wage is below the legal minimum.
     * Only checks if the wage type is 'HOURLY'.
     */
    const isWageLow = useMemo(() => {
        if (!wage.amount) return false;
        if (wage.type === 'HOURLY' && wage.amount < MIN_WAGE_2025) {
            return true;
        }
        return false;
    }, [wage.amount, wage.type]);

    /**
     * Logic for Probation Period Restriction (Scenario 5).
     * Blocks 90% payment if:
     * 1. Job is 'SIMPLE_LABOR' (Simple Labor) OR
     * 2. Contract term is short (Fixed Term / Part Time) - Simplified logic
     */
    const isProbationRestricted = useMemo(() => {
        const isSimpleLabor = jobCategory === 'SIMPLE_LABOR';
        const isShortTerm = state.contract.type === 'FIXED_TERM' || state.contract.type === 'PART_TIME';
        
        return isSimpleLabor || isShortTerm;
    }, [jobCategory, state.contract.type]);

    /**
     * Handles the toggle switch for Probation.
     * Alerts the user if they try to enable probation for restricted jobs.
     */
    const handleProbationChange = (e) => {
        const isChecked = e.target.checked;
        
        // If user tries to check 'Probation' but it's restricted, we can show a warning
        // However, usually having probation itself is legal, but wage reduction (90%) is restricted.
        // Here we just toggle the flag. The restriction applies to the 90% option below.
        actions.updateContractSection('wage', { hasProbation: isChecked });
        
        // If restricted, force wage percent to 100% just in case
        if (isChecked && isProbationRestricted) {
        actions.updateContractSection('wage', { probationWagePercent: 100 });
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Wage & Allowances (임금 및 수당 설정)
            </Typography>

            <Grid container spacing={3}>
                
                {/* --- Section A: Job Category (Affects Logic) --- */}
                <Grid item xs={12}>
                    <Box p={2} mb={1} bgcolor="#f9f9f9" borderRadius={2} border="1px dashed #ccc">
                        <Typography variant="caption" color="text.secondary">
                        * Setup for Validation Logic (Job Category affects probation rules)
                        </Typography>
                        <TextField
                        select
                        fullWidth
                        size="small"
                        label="Job Category (직종)"
                        value={jobCategory}
                        onChange={handleJobChange}
                        sx={{ mt: 1 }}
                        >
                        <MenuItem value="OFFICE">Office (사무직)</MenuItem>
                        <MenuItem value="SERVICE">Service (서비스직)</MenuItem>
                        <MenuItem value="SIMPLE_LABOR">Simple Labor (단순노무직 - 편의점 등)</MenuItem>
                        </TextField>
                    </Box>
                </Grid>

                {/* --- Section B: Wage Details --- */}
                <Grid item xs={12} sm={4}>
                    <TextField
                        select
                        fullWidth
                        label="Wage Type"
                        value={wage.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                    >
                        <MenuItem value="HOURLY">Hourly (시급)</MenuItem>
                        <MenuItem value="MONTHLY">Monthly (월급)</MenuItem>
                        <MenuItem value="DAILY">Daily (일급)</MenuItem>
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={8}>
                    <TextField
                        fullWidth
                        label="Amount (KRW)"
                        value={formatCurrency(wage.amount)} // Display formatted value
                        onChange={handleAmountChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">₩</InputAdornment>,
                        }}
                        error={isWageLow}
                        helperText={isWageLow ? `Below Minimum Wage (Min: ${formatCurrency(MIN_WAGE_2025)})` : ''}
                    />
                </Grid>

                {/* --- Section C: Payment Details --- */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Payment Date (지급일)"
                        placeholder="e.g., 25th of every month"
                        value={wage.paymentDate}
                        onChange={(e) => handleChange('paymentDate', e.target.value)}
                    />
                </Grid>

                {/* --- Section D: Probation Period  --- */}
                <Grid item xs={12}>
                    <Box 
                        p={2} 
                        borderRadius={2}
                        bgcolor={wage.hasProbation ? '#e3f2fd' : '#f5f5f5'} 
                        border={wage.hasProbation ? '1px solid #2196f3' : '1px solid #ddd'}
                    >
                        <FormControlLabel
                            control={
                            <Switch 
                                checked={wage.hasProbation}
                                onChange={handleProbationChange}
                            />
                            }
                            label="Apply Probation Period (수습기간 적용)"
                        />

                        {/* Conditional Rendering: Show details only if enabled */}
                        {wage.hasProbation && (
                            <Box mt={2} display="flex" flexDirection="column" gap={2}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Typography variant="body2">Pay during probation:</Typography>
                                    <TextField 
                                    select 
                                    size="small" 
                                    value={wage.probationWagePercent}
                                    onChange={(e) => handleChange('probationWagePercent', e.target.value)}
                                    sx={{ width: 200 }}
                                    >
                                        <MenuItem value={100}>100% of Wage</MenuItem>
                                        {/* Disable 90% option if restricted */}
                                        <MenuItem value={90} disabled={isProbationRestricted}>
                                            90% of Wage {isProbationRestricted && '(Restricted)'}
                                        </MenuItem>
                                    </TextField>
                                </Box>
                            
                            {isProbationRestricted && (
                                <Typography variant="caption" color="error">
                                * 90% payment is not allowed for Simple Labor or contracts under 1 year.
                                </Typography>
                            )}
                            </Box>
                        )}
                    </Box>
                </Grid>

            </Grid>

            {/* --- Navigation Buttons --- */}
            <Box mt={4} display="flex" justifyContent="space-between">
                <Button variant="outlined" onClick={actions.prevStep}>
                Back
                </Button>
                <Button 
                variant="contained" 
                onClick={actions.nextStep}
                // Disable next if wage amount is empty or illegal
                disabled={!wage.amount || isWageLow}
                >
                Next Step (Review)
                </Button>
            </Box>
        </Box>
    );
}