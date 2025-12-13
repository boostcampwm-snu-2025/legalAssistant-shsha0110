import React, { useEffect, useMemo } from 'react';
import { 
  Grid, Typography, Box, TextField, Button, InputAdornment, 
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, 
  Switch, Alert, Chip, Divider, Paper 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PaidIcon from '@mui/icons-material/Paid';
import WarningIcon from '@mui/icons-material/Warning';
import CalculateIcon from '@mui/icons-material/Calculate';
import dayjs from 'dayjs';

import { useContract } from '../../contexts/ContractContext';
import { formatCurrency } from '../../utils/formatUtils'; // Assuming you have this helper

// 2025 Minimum Wage Constant
const MINIMUM_WAGE = 10030;

export default function Step4Wage() {
    const { state, actions } = useContract();
    const { wage, startWorkDate, endWorkDate, jobCategory } = state.contract;

    // --- 1. Auto-set Default Wage (Minimum Wage) ---
    useEffect(() => {
        // If amount is empty, set default to Minimum Wage
        if (!wage.amount) {
        actions.updateContractSection('wage', { amount: MINIMUM_WAGE });
        }
    }, []); // Run once on mount

    // --- 2. Handlers ---

    const handleWageChange = (field, value) => {
        actions.updateContractSection('wage', { [field]: value });
    };

    const handleProbationToggle = (event) => {
        const isChecked = event.target.checked;
        
        if (isChecked) {
        // When turning ON: Set default probation end date to (Start + 3 months - 1 day)
        const defaultProbationEnd = startWorkDate 
            ? dayjs(startWorkDate).add(3, 'month').subtract(1, 'day') 
            : null;
            
        actions.updateContractSection('wage', { 
            hasProbation: true,
            probationEndDate: defaultProbationEnd,
            probationWagePercent: 90 
        });
        } else {
        // When turning OFF
        actions.updateContractSection('wage', { 
            hasProbation: false,
            probationEndDate: null,
            probationWagePercent: 100 
        });
        }
    };

    // --- 3. Calculations & Logic ---

    // Check legality of probation reduction (Scenario 2)
    const probationRestriction = useMemo(() => {
        // 1. Check Job Category (Simple Labor cannot have wage reduction)
        if (jobCategory === 'SIMPLE_LABOR') {
        return { 
            isRestricted: true, 
            reason: "🚫 Wage reduction is NOT allowed for Simple Labor jobs (e.g., Convenience Store, Delivery). (Minimum Wage Act Art. 5)" 
        };
        }

        // 2. Check Contract Duration (Must be >= 1 year)
        if (startWorkDate && endWorkDate) {
        const durationYears = dayjs(endWorkDate).diff(dayjs(startWorkDate), 'year', true);
        if (durationYears < 1) {
            return { 
            isRestricted: true, 
            reason: "🚫 Wage reduction is ONLY allowed for contracts of 1 year or longer." 
            };
        }
        }

        return { isRestricted: false, reason: null };
    }, [jobCategory, startWorkDate, endWorkDate]);

    // Force disable probation if restricted
    useEffect(() => {
        if (probationRestriction.isRestricted && wage.hasProbation) {
        actions.updateContractSection('wage', { hasProbation: false });
        }
    }, [probationRestriction, wage.hasProbation]);

    // Calculate wages
    const baseAmount = Number(wage.amount) || 0;
    const isBelowMinWage = baseAmount < MINIMUM_WAGE;
    
    // Probation Wage Calculation (90%)
    const probationAmount = Math.floor(baseAmount * 0.9);
    const probationAmountFormatted = formatCurrency(probationAmount);

    // Max Date for Probation (Max 3 months from start)
    const maxProbationDate = startWorkDate ? dayjs(startWorkDate).add(3, 'month').subtract(1, 'day') : null;


    // Validation for Next Button
    const isValid = () => {
        return baseAmount >= MINIMUM_WAGE; // Must meet minimum wage
    };

    return (
        <Box>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Wage & Benefits (임금 및 복리후생)
        </Typography>

        <Grid container spacing={3}>
            
            {/* --- 1. Wage Type & Amount --- */}
            <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
                Wage Type (임금 유형)
            </Typography>
            <FormControl fullWidth size="small">
                <Select
                value={wage.type}
                onChange={(e) => handleWageChange('type', e.target.value)}
                >
                <MenuItem value="HOURLY">Hourly (시급)</MenuItem>
                <MenuItem value="MONTHLY">Monthly (월급)</MenuItem>
                <MenuItem value="DAILY">Daily (일급)</MenuItem>
                </Select>
            </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
                Amount (금액)
            </Typography>
            <TextField
                fullWidth
                size="small"
                type="number"
                value={wage.amount}
                onChange={(e) => handleWageChange('amount', e.target.value)}
                InputProps={{
                endAdornment: <InputAdornment position="end">KRW</InputAdornment>,
                }}
                error={isBelowMinWage}
                helperText={isBelowMinWage ? `Must be at least ${formatCurrency(MINIMUM_WAGE)} KRW` : "Default: 2025 Minimum Wage"}
            />
            </Grid>

            {/* --- 2. Probation Period Settings (Key Feature) --- */}
            <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                    Probation Period (수습기간 설정)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Apply 90% wage during probation (Max 3 months).
                </Typography>
                </Box>
                <FormControlLabel
                control={
                    <Switch 
                    checked={wage.hasProbation} 
                    onChange={handleProbationToggle} 
                    color="primary"
                    disabled={probationRestriction.isRestricted} // Block if illegal
                    />
                }
                label={wage.hasProbation ? "Active" : "None"}
                />
            </Box>

            {/* Warning if Probation is Restricted (Scenario 2) */}
            {probationRestriction.isRestricted && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                {probationRestriction.reason}
                </Alert>
            )}

            {/* Probation Details Panel (Visible only when Active) */}
            {wage.hasProbation && (
                <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#f8f9fa' }}>
                <Grid container spacing={2}>
                    
                    {/* A. Probation Duration (Max 3 Months) */}
                    <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom fontWeight="bold">
                        Probation End Date (수습 종료일)
                    </Typography>
                    <DatePicker
                        value={wage.probationEndDate}
                        onChange={(val) => handleWageChange('probationEndDate', val)}
                        minDate={startWorkDate}
                        maxDate={maxProbationDate} // Constraint: Max 3 months
                        slotProps={{ 
                        textField: { 
                            fullWidth: true, 
                            size: 'small',
                            helperText: "Max 3 months allowed by law."
                        } 
                        }}
                    />
                    </Grid>

                    {/* B. Calculated Wage Display */}
                    <Grid item xs={12} md={6}>
                    <Box height="100%" display="flex" flexDirection="column" justifyContent="center">
                        <Typography variant="body2" gutterBottom fontWeight="bold" display="flex" alignItems="center">
                        <CalculateIcon fontSize="small" sx={{ mr: 0.5 }} /> 
                        Actual Wage during Probation
                        </Typography>
                        <Box 
                        bgcolor="#fff" p={1.5} borderRadius={1} border="1px dashed #ccc"
                        display="flex" justifyContent="space-between" alignItems="center"
                        >
                        <Typography variant="body2" color="text.secondary">
                            90% of {formatCurrency(baseAmount)}
                        </Typography>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                            {probationAmountFormatted} KRW
                        </Typography>
                        </Box>
                    </Box>
                    </Grid>

                    {/* C. Legal Notice */}
                    <Grid item xs={12}>
                    <Alert severity="info" icon={<PaidIcon />}>
                        During this period ({dayjs(startWorkDate).format('YYYY-MM-DD')} ~ {dayjs(wage.probationEndDate).format('YYYY-MM-DD')}), 
                        <strong> 90% of the wage</strong> will be paid. After this date, 100% will be paid automatically.
                    </Alert>
                    </Grid>

                </Grid>
                </Paper>
            )}
            </Grid>

            {/* --- 3. Payment Day & Method (Standard) --- */}
            <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>Payment Day (임금 지급일)</Typography>
            <TextField 
                fullWidth size="small" placeholder="e.g., 10th of every month" 
                value={wage.paymentDate || ''}
                onChange={(e) => handleWageChange('paymentDate', e.target.value)}
            />
            </Grid>
            <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>Payment Method (지급 방법)</Typography>
            <TextField 
                fullWidth size="small" placeholder="e.g., Bank Transfer to Employee's Account" 
                value={wage.paymentMethod || ''}
                onChange={(e) => handleWageChange('paymentMethod', e.target.value)}
            />
            </Grid>

        </Grid>

        {/* --- Navigation --- */}
        <Box mt={4} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={actions.prevStep}>
            Back (Work Time)
            </Button>
            <Button 
            variant="contained" 
            onClick={actions.nextStep}
            disabled={!isValid()}
            >
            Next Step (Additional Info)
            </Button>
        </Box>
        </Box>
    );
}