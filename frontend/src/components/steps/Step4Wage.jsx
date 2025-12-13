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
    const { wage, startWorkDate, endWorkDate, jobCategory, jobCategoryReason } = state.contract;

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

    // Handle Reduction Rate Change (Max 10%)
    const handleReductionChange = (e) => {
        let val = Number(e.target.value);
        
        // Validation: 0 <= val <= 10
        if (val < 0) val = 0;
        if (val > 10) val = 10; // Enforce legal limit

        // Update state: probationWagePercent = 100 - reductionRate
        actions.updateContractSection('wage', { probationWagePercent: 100 - val });
    };

    // --- 3. Calculations & Logic ---

    // Check legality of probation wage reduction (Scenario 2)
    const probationRestriction = useMemo(() => {
        // 1. Check Job Category (Simple Labor cannot have wage reduction)
        if (jobCategory === 'SIMPLE_LABOR') {
        // [MODIFIED] Dynamic Reason Generation (Korean Message)
        // Use the specific job title from AI if available
        const detailText = jobCategoryReason 
            ? `입력하신 업무는 단순노무직군인 [${jobCategoryReason}]에 해당합니다.` 
            : "입력하신 업무는 단순노무직(편의점, 배달, 청소 등)에 해당합니다.";

        return { 
            isRestricted: true, 
            reason: `🚫 감액 불가: ${detailText} 고용노동부 장관이 고시한 단순노무직종은 수습 기간에도 최저임금 100%를 지급해야 합니다. (최저임금법 제5조)` 
        };
        }

        // 2. Check Contract Duration (Must be >= 1 year)
        if (startWorkDate && endWorkDate) {
        const durationYears = dayjs(endWorkDate).diff(dayjs(startWorkDate), 'year', true);
        if (durationYears < 1) {
            return { 
            isRestricted: true, 
            reason: "🚫 감액 불가: 근로계약 기간이 1년 미만인 경우, 수습 기간이라도 임금을 감액할 수 없습니다." 
            };
        }
        }

        return { isRestricted: false, reason: null };
    }, [jobCategory, jobCategoryReason, startWorkDate, endWorkDate]);
    
    // Force disable probation if restricted
    useEffect(() => {
        if (probationRestriction.isRestricted && wage.hasProbation) {
        actions.updateContractSection('wage', { hasProbation: false });
        }
    }, [probationRestriction, wage.hasProbation]);

    // Calculate wages
    const baseAmount = Number(wage.amount) || 0;
    const isBelowMinWage = baseAmount < MINIMUM_WAGE;
    
    // Calculate dynamically based on state
    // wage.probationWagePercent stores the PAYMENT rate (e.g., 90)
    // reductionRate is what user sees (e.g., 10)
    const currentReductionRate = 100 - wage.probationWagePercent;
    const probationAmount = Math.floor(baseAmount * (wage.probationWagePercent / 100));
    const probationAmountFormatted = formatCurrency(probationAmount);

    // Max Date for Probation (Max 3 months from start)
    const maxProbationDate = startWorkDate ? dayjs(startWorkDate).add(3, 'month').subtract(1, 'day') : null;


    // Validation for Next Button
    const isValid = () => {
        const metMinimumWage = baseAmount >= MINIMUM_WAGE
        const hasPaymentDate = !!wage.paymentDate;
        const hasPaymentMethod = !!wage.paymentMethod;
        return metMinimumWage && hasPaymentDate && hasPaymentMethod;
    };

    return (
        <Box>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            임금 관련 항목을 입력해주세요!
        </Typography>

        <Grid container spacing={3}>
            
            {/* --- 1. Wage Type & Amount --- */}
            <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
                6.1. 임금 유형
            </Typography>
            <FormControl fullWidth size="small">
                <Select
                value={wage.type}
                onChange={(e) => handleWageChange('type', e.target.value)}
                >
                <MenuItem value="HOURLY">시급</MenuItem>
                <MenuItem value="MONTHLY">월급</MenuItem>
                <MenuItem value="DAILY">일급</MenuItem>
                </Select>
            </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
                금액
            </Typography>
            <TextField
                fullWidth
                size="small"
                type="number"
                value={wage.amount}
                onChange={(e) => handleWageChange('amount', e.target.value)}
                InputProps={{
                endAdornment: <InputAdornment position="end">원</InputAdornment>,
                }}
                error={isBelowMinWage}
                helperText={isBelowMinWage ? `최저임금 ${formatCurrency(MINIMUM_WAGE)}원 이하입니다.` : "기본: 2025년도 최저임금"}
            />
            </Grid>

            {/* --- 2. Probation Period Settings (Key Feature) --- */}
            <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                    수습기간 설정
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    수습시간 최대 10% 감액 가능 (최대 3개월).
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

            {/* Probation Details Panel */}
            {wage.hasProbation && (
                <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#f8f9fa' }}>
                <Grid container spacing={2}>
                    
                    {/* A. Probation Duration */}
                    <Grid item xs={12} md={4}>
                    <Typography variant="body2" gutterBottom fontWeight="bold">
                        수습 종료일
                    </Typography>
                    <DatePicker
                        value={wage.probationEndDate}
                        onChange={(val) => handleWageChange('probationEndDate', val)}
                        minDate={startWorkDate}
                        maxDate={maxProbationDate} 
                        slotProps={{ 
                        textField: { 
                            fullWidth: true, 
                            size: 'small',
                            helperText: "최대 3개월간 임금 감액이 가능합니다."
                        } 
                        }}
                    />
                    </Grid>

                    {/* [NEW] B. Reduction Rate Input */}
                    <Grid item xs={12} md={4}>
                    <Typography variant="body2" gutterBottom fontWeight="bold">
                        감액률
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={currentReductionRate}
                        onChange={handleReductionChange}
                        InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        helperText={
                        <span style={{ color: currentReductionRate === 10 ? 'orange' : 'inherit' }}>
                            최대 10% (법정 상한)
                        </span>
                        }
                    />
                    </Grid>

                    {/* [MODIFIED] C. Calculated Wage Display */}
                    <Grid item xs={12} md={4}>
                    <Box height="100%" display="flex" flexDirection="column" justifyContent="flex-start">
                        <Typography variant="body2" gutterBottom fontWeight="bold" display="flex" alignItems="center">
                        <CalculateIcon fontSize="small" sx={{ mr: 0.5 }} /> 
                        감액된 임금
                        </Typography>
                        <Box 
                        bgcolor="#fff" p={1.5} borderRadius={1} border="1px dashed #ccc"
                        display="flex" flexDirection="column" gap={0.5}
                        >
                        <Typography variant="caption" color="text.secondary">
                            기존 임금의 {wage.probationWagePercent}%
                        </Typography>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                            {probationAmountFormatted} 원
                        </Typography>
                        </Box>
                    </Box>
                    </Grid>

                    {/* D. Legal Notice (Bottom) */}
                    <Grid item xs={12}>
                    <Alert severity="info" icon={<PaidIcon />}>
                        수습기간 ({dayjs(startWorkDate).format('YYYY-MM-DD')} ~ {dayjs(wage.probationEndDate).format('YYYY-MM-DD')}) 동안,
                        <strong> 기존 임금의 {wage.probationWagePercent}% </strong>가 지급됩니다. (그 이후로는 원상 지급)
                    </Alert>
                    </Grid>

                </Grid>
                </Paper>
            )}
            </Grid>

            {/* --- 3. Payment Day & Method (Standard) --- */}
            <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>6.2. 임금 지급일</Typography>
            <TextField 
                fullWidth size="small" placeholder="예) 매달 1일" 
                value={wage.paymentDate || ''}
                onChange={(e) => handleWageChange('paymentDate', e.target.value)}
            />
            </Grid>
            <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>6.3. 지급 방법</Typography>
            <TextField 
                fullWidth size="small" placeholder="예) 근로자 명의 통장으로 입금" 
                value={wage.paymentMethod || ''}
                onChange={(e) => handleWageChange('paymentMethod', e.target.value)}
            />
            </Grid>

        </Grid>

        {/* --- Navigation --- */}
        <Box mt={4} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={actions.prevStep}>
            이전
            </Button>
            <Button 
            variant="contained" 
            onClick={actions.nextStep}
            disabled={!isValid()}
            >
            다음
            </Button>
        </Box>
        </Box>
    );
}