import React, { useEffect, useState, useMemo } from 'react';
import { 
  Grid, Typography, Box, TextField, Button, Alert, Chip, Stack 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

// Extend dayjs with duration plugin
dayjs.extend(duration);

// Import global state and utilities
import { useContract } from '../../contexts/ContractContext';

export default function Step2BasicInfo() {
    const { state, actions } = useContract();
    const { contract } = state;

    // --- 1. Auto-set Default Start Date ---
    useEffect(() => {
        // If Start Date is empty, set it to Today
        if (!contract.startWorkDate) {
        actions.setContractField('startWorkDate', dayjs());
        }
    }, []); // Run only once on mount

    // --- 2. Determine Contract Type Logic ---
    const isIndefinite = contract.type === 'STANDARD';

    // --- 3. Handlers ---

    const handleChange = (field, value) => {
        actions.setContractField(field, value);
    };

    const handleDateChange = (field, newValue) => {
        actions.setContractField(field, newValue);
    };

    /**
     * Helper to set End Date automatically based on duration
     * @param {number} amount - Number of units (e.g., 3, 6, 1)
     * @param {string} unit - 'month' or 'year'
     */
    const handleDurationPreset = (amount, unit) => {
        if (!contract.startWorkDate) return;

        // Calculate new end date: Start + Duration - 1 day
        let newEndDate;
        if (amount === 0) {
            newEndDate = null
        } else if (amount > 0) {
            newEndDate = !!contract.endWorkDate? contract.endWorkDate.add(amount, unit).subtract(1, 'day') : contract.startWorkDate.add(amount, unit).subtract(1, 'day');
        } else {
            newEndDate = !!contract.endWorkDate? contract.endWorkDate.add(amount, unit).add(1, 'day') : contract.startWorkDate.add(amount, unit).add(1, 'day');
        }
        
        actions.setContractField('endWorkDate', newEndDate);
    };

    // --- 4. Duration Calculation Helper ---
    const durationText = useMemo(() => {
        if (!contract.startWorkDate || !contract.endWorkDate) return null;
        if (isIndefinite) return "기간의 정함이 없음 (Indefinite)";

        const start = contract.startWorkDate;
        const end = contract.endWorkDate;

        // Calculate difference
        // Note: We add 1 day because contract period is inclusive (Start ~ End)
        const diffTime = end.diff(start) + (24 * 60 * 60 * 1000); 
        if (diffTime < 0) return "Invalid Period (종료일이 시작일보다 빠릅니다)";

        const dur = dayjs.duration(diffTime);
        const years = dur.years();
        const months = dur.months();
        const days = dur.days();

        // Format: "X년 Y개월 Z일"
        const parts = [];
        if (years > 0) parts.push(`${years}년`);
        if (months > 0) parts.push(`${months}개월`);
        if (days > 0) parts.push(`${days}일`);

        return parts.length > 0 ? `총 계약 기간: ${parts.join(' ')}` : "1일";
    }, [contract.startWorkDate, contract.endWorkDate, isIndefinite]);


    // Validation
    const isValid = () => {
        const hasStart = !!contract.startWorkDate;
        const hasLocation = !!contract.workplace?.trim();
        const hasJob = !!contract.jobDescription?.trim();
        const hasEnd = isIndefinite ? true : !!contract.endWorkDate;

        return hasStart && hasLocation && hasJob && hasEnd;
    };

    return (
        <Box>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Basic Information (기본 근로 조건)
        </Typography>

        <Grid container spacing={3}>
            
            {/* --- 1. Contract Period (근로계약기간) --- */}
            <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
                1. Contract Period (근로계약기간)
            </Typography>
            
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <DatePicker
                label="Start Date (부터)"
                value={contract.startWorkDate}
                onChange={(val) => handleDateChange('startWorkDate', val)}
                slotProps={{ textField: { fullWidth: false, sx: { width: 180 } } }}
                />
                
                <Typography variant="body1">~</Typography>
                
                <DatePicker
                label="End Date (까지)"
                value={contract.endWorkDate}
                onChange={(val) => handleDateChange('endWorkDate', val)}
                disabled={isIndefinite} 
                />
            </Box>

            {/* Preset Duration Buttons (Only for Fixed-Term/Part-Time) */}
            {!isIndefinite && (
                <Box mt={1} display="flex" alignItems="center" gap={1}>
                <Chip 
                    label="- 1년" 
                    onClick={() => handleDurationPreset(-1, 'year')} 
                    color="primary" variant="outlined" clickable 
                />
                <Chip 
                    label="- 1개월" 
                    onClick={() => handleDurationPreset(-1, 'month')} 
                    color="primary" variant="outlined" clickable 
                />
                <Chip 
                    label="초기화" 
                    onClick={() => handleDurationPreset(0, 'month')} 
                    color="primary" variant="outlined" clickable 
                />
                <Chip 
                    label="+ 1개월" 
                    onClick={() => handleDurationPreset(1, 'month')} 
                    color="primary" variant="outlined" clickable 
                />
                <Chip 
                    label="+ 1년" 
                    onClick={() => handleDurationPreset(1, 'year')} 
                    color="primary" variant="outlined" clickable 
                />
                </Box>
            )}

            {/* Display Calculated Duration */}
            {durationText && (
                <Alert severity="info" sx={{ mt: 2, py: 0 }}>
                <strong>{durationText}</strong>
                </Alert>
            )}
            </Grid>

            {/* --- 2. Workplace (근무 장소) --- */}
            <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
                2. Workplace (근무 장소)
            </Typography>
            <TextField
                fullWidth
                placeholder="예) GS25 강남점"
                value={contract.workplace}
                onChange={(e) => handleChange('workplace', e.target.value)}
            />
            </Grid>

            {/* --- 3. Job Description (업무의 내용) --- */}
            <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
                3. Job Description (업무의 내용)
            </Typography>
            <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="예) 고객 응대, 매장 청소, 재고 관리"
                value={contract.jobDescription}
                onChange={(e) => handleChange('jobDescription', e.target.value)}
            />
            <Alert severity="warning" sx={{ mt: 1, fontSize: '0.85rem' }}>
                Tip: 구체적으로 적을수록 분쟁을 예방할 수 있습니다.
            </Alert>
            </Grid>

        </Grid>

        {/* --- Navigation Buttons --- */}
        <Box mt={4} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={actions.prevStep}>
            Back (Type Selection)
            </Button>
            <Button 
            variant="contained" 
            onClick={actions.nextStep}
            disabled={!isValid()}
            >
            Next Step (Work Time)
            </Button>
        </Box>
        </Box>
    );
}