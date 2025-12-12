import React, { useMemo } from 'react';
import { 
  Grid, Typography, Box, Button, ToggleButton, ToggleButtonGroup, 
  FormControl, InputLabel, Select, MenuItem, FormHelperText, Alert 
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { useContract } from '../../contexts/ContractContext';
import { calculateDurationMinutes, formatDuration, validateBreakTime } from '../../utils/timeUtils';
import { WEEKDAYS } from '../../constants/contractConstants';

export default function Step3WorkTime() {
    const { state, actions } = useContract();
    const { workSchedule } = state.contract;

    // --- 1. Handlers ---
    
    const handleTimeChange = (field, newValue) => {
        actions.updateContractSection('workSchedule', { [field]: newValue });
    };

    const handleDaysChange = (event, newDays) => {
        actions.updateContractSection('workSchedule', { workingDays: newDays });
    };

    const handleHolidayChange = (event) => {
        actions.updateContractSection('workSchedule', { weeklyHoliday: event.target.value });
    };

    // --- 2. Calculations & Validation ---
    
    // 일일 체류 시간
    const totalStayMinutes = useMemo(() => 
        calculateDurationMinutes(workSchedule.startTime, workSchedule.endTime),
        [workSchedule.startTime, workSchedule.endTime]
    );

    // 일일 휴게 시간
    const breakMinutes = useMemo(() => 
        calculateDurationMinutes(workSchedule.breakStartTime, workSchedule.breakEndTime),
        [workSchedule.breakStartTime, workSchedule.breakEndTime]
    );

    // 일일 실 근무 시간
    const netWorkMinutes = Math.max(0, totalStayMinutes - breakMinutes);

    // 법적 휴게 시간 준수 여부
    const legalError = useMemo(() => 
        validateBreakTime(totalStayMinutes, breakMinutes),
        [totalStayMinutes, breakMinutes]
    );

    // [NEW] 주간 총 근로 시간 계산 (주 15시간 체크용)
    const weeklyTotalMinutes = useMemo(() => {
        const daysCount = workSchedule.workingDays.length;
        return netWorkMinutes * daysCount;
    }, [netWorkMinutes, workSchedule.workingDays]);

    // [NEW] 주휴일 필수 여부 판단 (주 15시간 = 900분 이상일 때만 필수)
    const isHolidayRequired = weeklyTotalMinutes >= 900;

    // Next Button Validation
    const isValid = () => {
        const hasTime = netWorkMinutes > 0 && !legalError;
        const hasDays = workSchedule.workingDays.length > 0;
        
        // [MODIFIED] 주 15시간 미만이면 주휴일 선택 안 해도 통과 (Optional)
        const hasHoliday = isHolidayRequired ? !!workSchedule.weeklyHoliday : true;
        
        return hasTime && hasDays && hasHoliday;
    };

    return (
        <Box>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Working Hours & Days (근무시간 및 휴일)
        </Typography>

        {/* 주 15시간 미만 안내 메시지 (조건부 렌더링) */}
        {!isHolidayRequired && weeklyTotalMinutes > 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
            주 소정근로시간이 15시간 미만({Math.floor(weeklyTotalMinutes/60)}시간)이므로, 
            <strong>주휴일 및 주휴수당 부여 의무가 없습니다.</strong>
            </Alert>
        )}

        <Grid container spacing={4}>
            {/* --- Item 4: Work Time --- */}
            <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
                4-1. Work Duration (소정근로시간)
            </Typography>
            <Box display="flex" gap={2} mb={2}>
                <TimePicker
                label="Start Time"
                value={workSchedule.startTime}
                onChange={(val) => handleTimeChange('startTime', val)}
                slotProps={{ textField: { fullWidth: true } }}
                />
                <TimePicker
                label="End Time"
                value={workSchedule.endTime}
                onChange={(val) => handleTimeChange('endTime', val)}
                slotProps={{ textField: { fullWidth: true } }}
                />
            </Box>
            </Grid>

            <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
                4-2. Break Time (휴게시간)
            </Typography>
            <Box display="flex" gap={2} mb={2}>
                <TimePicker
                label="Start"
                value={workSchedule.breakStartTime}
                onChange={(val) => handleTimeChange('breakStartTime', val)}
                slotProps={{ textField: { fullWidth: true } }}
                />
                <TimePicker
                label="End"
                value={workSchedule.breakEndTime}
                onChange={(val) => handleTimeChange('breakEndTime', val)}
                slotProps={{ textField: { fullWidth: true } }}
                />
            </Box>
            </Grid>

            {/* Time Validation Feedback */}
            <Grid item xs={12}>
            <Box 
                p={2} 
                bgcolor={legalError ? '#fff4f4' : '#f0f9ff'} 
                borderRadius={2} 
                border={legalError ? '1px solid #ffcdd2' : '1px solid #b3e5fc'}
                display="flex"
                alignItems="center"
                gap={1}
            >
                <AccessTimeIcon color={legalError ? 'error' : 'primary'} fontSize="small" />
                <Box>
                <Typography variant="body2" color={legalError ? 'error' : 'text.primary'} fontWeight="bold">
                    {legalError || `Daily Work: ${formatDuration(netWorkMinutes)} / Weekly Total: ${formatDuration(weeklyTotalMinutes)}`}
                </Typography>
                </Box>
            </Box>
            </Grid>

            {/* --- Item 5: Working Days & Holiday --- */}
            <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
                5. Working Days & Weekly Holiday (근무일 및 주휴일)
            </Typography>
            
            {/* A. Working Days Selection */}
            <Box mb={2}>
                <Typography variant="caption" color="text.secondary">
                Select Working Days (근무 요일)
                </Typography>
                <ToggleButtonGroup
                value={workSchedule.workingDays}
                onChange={handleDaysChange}
                aria-label="working days"
                fullWidth
                sx={{ mt: 1 }}
                >
                {WEEKDAYS.map((day) => (
                    <ToggleButton key={day.value} value={day.value} color="primary">
                    {day.label}
                    </ToggleButton>
                ))}
                </ToggleButtonGroup>
            </Box>

            {/* B. Weekly Holiday Selection */}
            <FormControl fullWidth size="small" required={isHolidayRequired}>
                <InputLabel>Weekly Paid Holiday (주휴일)</InputLabel>
                <Select
                value={workSchedule.weeklyHoliday}
                label="Weekly Paid Holiday (주휴일)"
                onChange={handleHolidayChange}
                >
                <MenuItem value="">
                    <em>None (해당 없음 - 15시간 미만)</em>
                </MenuItem>
                {WEEKDAYS.map((day) => (
                    <MenuItem key={day.value} value={day.value}>
                    Every {day.label}
                    </MenuItem>
                ))}
                </Select>
                <FormHelperText>
                {isHolidayRequired 
                    ? "Mandatory for > 15 hours/week (주 15시간 이상 시 필수)" 
                    : "Optional for < 15 hours/week (주 15시간 미만은 선택 사항)"}
                </FormHelperText>
            </FormControl>
            </Grid>
        </Grid>

        {/* Navigation */}
        <Box mt={4} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={actions.prevStep}>
            Back
            </Button>
            <Button 
            variant="contained" 
            onClick={actions.nextStep}
            disabled={!isValid()}
            >
            Next Step (Wage)
            </Button>
        </Box>
        </Box>
    );
}