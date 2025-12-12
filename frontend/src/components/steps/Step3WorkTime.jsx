import React, { useMemo } from 'react';
import { 
  Grid, Typography, Box, Alert, TextField, Button 
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useContract } from '../../contexts/ContractContext.jsx';
import { calculateDurationMinutes, formatDuration, validateBreakTime } from '../../utils/timeUtils.js';
import dayjs from 'dayjs';

export default function Step3WorkTime() {
    const { state, actions } = useContract();
    const { workSchedule } = state.contract;

    // --- 1. Event Handlers ---
    
    // Generic handler for TimePicker changes
    const handleTimeChange = (field, newValue) => {
        // Validates that newValue is a valid Dayjs object
        actions.updateContractSection('workSchedule', { 
        [field]: newValue 
        });
    };

    // --- 2. Calculations & Validation ---
    
    // Total Stay Duration (Start ~ End)
    const totalStayMinutes = useMemo(() => 
        calculateDurationMinutes(workSchedule.startTime, workSchedule.endTime), 
        [workSchedule.startTime, workSchedule.endTime]
    );

    // Break Duration (BreakStart ~ BreakEnd)
    const breakMinutes = useMemo(() => 
        calculateDurationMinutes(workSchedule.breakStartTime, workSchedule.breakEndTime),
        [workSchedule.breakStartTime, workSchedule.breakEndTime]
    );

    // Net Working Time (Stay - Break)
    const netWorkMinutes = Math.max(0, totalStayMinutes - breakMinutes);

    // Legal Validation Message
    const legalError = useMemo(() =>
        validateBreakTime(totalStayMinutes, breakMinutes),
        [totalStayMinutes, breakMinutes]
    );

    // --- 3. Render Helper ---
    const isPartTime = state.contract.type === 'PART_TIME';

    return (
        <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Working Hours & Break Time (근무 및 휴게 시간)
            </Typography>

            {/* Part-Time Notice */}
            {isPartTime && (
                <Alert severity="info" sx={{ mb: 3 }}>
                Part-Time (알바) selected: Please set the standard schedule first. 
                (Advanced weekly grid will be added later!)
                </Alert>
            )}

            <Grid container spacing={4}>
                {/* --- A. Work Time Section --- */}
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        1. Work Duration (근무 시간)
                    </Typography>
                    <Box display="flex" gap={2} mb={2}>
                        <TimePicker
                        label="Start Time (출근)"
                        value={workSchedule.startTime}
                        onChange={(val) => handleTimeChange('startTime', val)}
                        slotProps={{ textField: { fullWidth: true } }}
                        />
                        <TimePicker
                        label="End Time (퇴근)"
                        value={workSchedule.endTime}
                        onChange={(val) => handleTimeChange('endTime', val)}
                        slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Box>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                        • Total Stay: {formatDuration(totalStayMinutes)}
                    </Typography>
                </Grid>

                {/* --- B. Break Time Section --- */}
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        2. Break Time (휴게 시간)
                    </Typography>
                    <Box display="flex" gap={2} mb={2}>
                        <TimePicker
                        label="Break Start"
                        value={workSchedule.breakStartTime}
                        onChange={(val) => handleTimeChange('breakStartTime', val)}
                        slotProps={{ textField: { fullWidth: true } }}
                        />
                        <TimePicker
                        label="Break End"
                        value={workSchedule.breakEndTime}
                        onChange={(val) => handleTimeChange('breakEndTime', val)}
                        slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        • Break Duration: {formatDuration(breakMinutes)}
                    </Typography>
                </Grid>

                {/* --- C. Validation Result --- */}
                <Grid item xs={12}>
                <Box 
                    p={3} 
                    bgcolor={legalError ? '#fff4f4' : '#f0f9ff'} 
                    borderRadius={2} 
                    border={legalError ? '1px solid #ffcdd2' : '1px solid #b3e5fc'}
                >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <AccessTimeIcon color={legalError ? 'error' : 'primary'} />
                        <Typography variant="subtitle1" fontWeight="bold" color={legalError ? 'error' : 'primary'}>
                            {legalError ? 'Legal Violation Detected' : 'Calculated Working Hours'}
                        </Typography>
                    </Box>
                    
                    {legalError ? (
                    <Typography color="error">{legalError}</Typography>
                    ) : (
                    <Typography variant="body1">
                        하루 실 근무 시간은 <strong>{formatDuration(netWorkMinutes)}</strong> 입니다.
                    </Typography>
                    )}
                </Box>
                </Grid>
            </Grid>

            {/* Navigation Buttons */}
            <Box mt={4} display="flex" justifyContent="space-between">
                <Button variant="outlined" onClick={actions.prevStep}>
                Back (Type)
                </Button>
                <Button 
                variant="contained" 
                onClick={actions.nextStep}
                disabled={!!legalError || netWorkMinutes <= 0} // Block if error
                >
                Next Step (Wage)
                </Button>
            </Box>
        </Box>
    );
}