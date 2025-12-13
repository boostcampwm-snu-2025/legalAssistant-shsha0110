import React, { useMemo } from 'react';
import { 
  Grid, Typography, Box, Button, ToggleButton, ToggleButtonGroup, 
  FormControl, InputLabel, Select, MenuItem, FormHelperText, Alert, Chip 
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security'; 

import { useContract } from '../../contexts/ContractContext';
import { calculateDurationMinutes, formatDuration, validateBreakTime } from '../../utils/timeUtils';
import { WEEKDAYS } from '../../constants/contractConstants';

export default function Step3WorkTime() {
    const { state, actions } = useContract();
    const { workSchedule, type } = state.contract;

    // --- 1. Event Handlers ---
    
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
    
    const isMinor = type === 'MINOR';

    const totalStayMinutes = useMemo(() => 
        calculateDurationMinutes(workSchedule.startTime, workSchedule.endTime),
        [workSchedule.startTime, workSchedule.endTime]
    );

    const breakMinutes = useMemo(() => 
        calculateDurationMinutes(workSchedule.breakStartTime, workSchedule.breakEndTime),
        [workSchedule.breakStartTime, workSchedule.breakEndTime]
    );

    const netWorkMinutes = Math.max(0, totalStayMinutes - breakMinutes);

    const weeklyTotalMinutes = useMemo(() => {
        const daysCount = workSchedule.workingDays.length;
        return netWorkMinutes * daysCount;
    }, [netWorkMinutes, workSchedule.workingDays]);

    const isHolidayRequired = weeklyTotalMinutes >= 900;

    const selectedHolidayLabel = useMemo(() => {
        const day = WEEKDAYS.find(d => d.value === workSchedule.weeklyHoliday);
        return day ? day.label : '';
    }, [workSchedule.weeklyHoliday]);

    const legalError = useMemo(() => {
        const breakError = validateBreakTime(totalStayMinutes, breakMinutes);
        if (breakError) return breakError;

        if (isMinor && netWorkMinutes > 420) {
        return "🚨 법정 근로 시간 초과! 18세 미만은 하루 7시간(420분)까지만 일할 수 있어요. (근로기준법 제69조)";
        }
        
        return null;
    }, [totalStayMinutes, breakMinutes, isMinor, netWorkMinutes]);

    const isValid = () => {
        const hasTime = netWorkMinutes > 0 && !legalError;
        const hasDays = workSchedule.workingDays.length > 0;
        const hasHoliday = isHolidayRequired ? !!workSchedule.weeklyHoliday : true;
        
        return hasTime && hasDays && hasHoliday;
    };

    return (
        <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
            근무시간 및 휴일을 입력해주세요!
            </Typography>
        </Box>

        <Grid container spacing={4}>
            {/* --- Item 4: Work Time --- */}
            <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
                4-1. 소정근로시간
            </Typography>
            <Box display="flex" gap={2} mb={2}>
                <TimePicker
                label="시업 시각"
                value={workSchedule.startTime}
                onChange={(val) => handleTimeChange('startTime', val)}
                ampm={false}
                format="HH:mm"
                slotProps={{ 
                    textField: { 
                    fullWidth: true,
                    error: !!legalError && legalError.includes("7시간"), 
                    } 
                }}
                />
                <TimePicker
                label="종업 시각"
                value={workSchedule.endTime}
                onChange={(val) => handleTimeChange('endTime', val)}
                ampm={false}
                format="HH:mm"
                slotProps={{ 
                    textField: { 
                    fullWidth: true,
                    error: !!legalError && legalError.includes("7시간"),
                    } 
                }}
                />
            </Box>
            </Grid>

            <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
                4-2. 휴게시간
            </Typography>
            <Box display="flex" gap={2} mb={2}>
                <TimePicker
                label="휴게 시작 시각"
                value={workSchedule.breakStartTime}
                onChange={(val) => handleTimeChange('breakStartTime', val)}
                ampm={false}
                format="HH:mm"
                // [Constraint] Cannot be earlier than Work Start
                minTime={workSchedule.startTime}
                // [Constraint] Cannot be later than Work End
                maxTime={workSchedule.endTime}
                slotProps={{ textField: { fullWidth: true } }}
                />
                <TimePicker
                label="휴게 종료 시각"
                value={workSchedule.breakEndTime}
                onChange={(val) => handleTimeChange('breakEndTime', val)}
                ampm={false}
                format="HH:mm"
                // [Constraint] Cannot be earlier than Break Start (or Work Start)
                minTime={workSchedule.breakStartTime || workSchedule.startTime}
                // [Constraint] Cannot be later than Work End
                maxTime={workSchedule.endTime}
                slotProps={{ textField: { fullWidth: true } }}
                />
            </Box>
            </Grid>

            {/* Validation Feedback */}
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
                {legalError ? (
                    <Typography variant="body2" color="error" fontWeight="bold">
                    {legalError}
                    </Typography>
                ) : (
                    <Typography variant="body2" color="text.primary">
                    하루 근로 시간: <strong>{formatDuration(netWorkMinutes)}</strong> 
                    {isMinor && <span style={{color: 'green'}}> (Safe: &lt; 7h)</span>} 
                    {' / '} 
                    일주일 총 근로 시간: <strong>{formatDuration(weeklyTotalMinutes)}</strong>
                    </Typography>
                )}
                </Box>
            </Box>
            </Grid>
        </Grid>

        <Grid>
            {/* --- Item 5: Working Days & Holiday --- */}
            <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
                5. 근무일 및 주휴일
            </Typography>
            
            {/* A. Working Days Selection */}
            <Box mb={2}>
                <Typography variant="caption" color="text.secondary">
                근무 요일을 선택하세요!
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
            <FormControl 
            fullWidth 
            size="small" 
            required={isHolidayRequired} 
            error={isHolidayRequired && !workSchedule.weeklyHoliday}
            >
            <InputLabel>주휴일(주휴수당 지급)</InputLabel>
            <Select
                value={workSchedule.weeklyHoliday}
                label="주휴일을 선택하세요!"
                onChange={handleHolidayChange}
            >
                {workSchedule.weeklyTotalMinutes < 900 && 
                    <MenuItem value="">
                    <em>주휴일 없음 (일주일 총 근로 시간이 15시간 미만인 경우 적용가능)</em>
                    </MenuItem>
                }
                
                {WEEKDAYS.map((day) => {
                // Check if the day is already selected as a working day
                const isWorkingDay = workSchedule.workingDays.includes(day.value);
                
                return (
                    <MenuItem 
                    key={day.value} 
                    value={day.value}
                    disabled={isWorkingDay} // Disable if it is a working day
                    >
                    매주 {day.label}
                    {/* Visual cue for the user */}
                    {isWorkingDay ? ' (근무일)' : ''}
                    </MenuItem>
                );
                })}
            </Select>
            <FormHelperText>
                {isHolidayRequired 
                ? "주간 근로 시간이 15시간 이상인 경우, 주휴일 지정이 필수입니다." 
                : "주간 근로 시간이 15시간 미만인 경우, 주휴일을 지정할 수 있습니다."}
            </FormHelperText>
            </FormControl>

            </Grid>
        </Grid>

        {/* Info Message Area (Dynamic Alerts) */}
            <Box mb={3}>
                {/* Case A: Under 15 hours (No Holiday Required) - Info (Blue) */}
                {!isHolidayRequired && weeklyTotalMinutes > 0 && (
                <Alert severity="info" sx={{ mb: 1 }}>
                    주 근로시간이 15시간 미만입니다({Math.floor(weeklyTotalMinutes/60)}h). 
                    <strong> 주휴수당 지급이 필수는 아닙니다.</strong>
                </Alert>
                )}

                {/* Case B & C: 15 hours or more (Holiday Required) */}
                {isHolidayRequired && (
                !workSchedule.weeklyHoliday ? (
                    // Case B: Not Selected yet -> Error (Red)
                    <Alert severity="error" sx={{ mb: 1 }}>
                        주 근로시간이 15시간 이상입니다({Math.floor(weeklyTotalMinutes/60)}h). 
                        <strong> 주휴일 지정 및 주휴수당 지급이 필수입니다.</strong>
                    </Alert>
                ) : (
                    // Case C: Selected -> Success (Green)
                    <Alert severity="success" sx={{ mb: 1 }}>
                    <strong>매주 {selectedHolidayLabel}요일에 주휴수당이 지급됩니다.</strong>.
                    </Alert>
                )
                )}
            </Box>


        {/* Navigation Buttons */}
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