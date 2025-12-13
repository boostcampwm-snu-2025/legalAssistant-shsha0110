import React, { useEffect, useState, useMemo } from 'react';
import { 
  Grid, Typography, Box, TextField, Button, Alert, Chip, CircularProgress, IconButton, Tooltip 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Extend dayjs with duration plugin
dayjs.extend(duration);

// Import global state and utilities
import { useContract } from '../../contexts/ContractContext';
import { classifyJob } from '../../api/contractApi';

export default function Step2BasicInfo() {
    const { state, actions } = useContract();
    const { contract } = state;
    
    // Local state for AI analysis loading
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    // --- 1. Auto-set Default Start Date ---
    useEffect(() => {
        if (!contract.startWorkDate) {
        actions.setContractField('startWorkDate', dayjs());
        }
    }, []);

    const isIndefinite = contract.type === 'STANDARD';

    // --- 2. Handlers ---

    const handleChange = (field, value) => {
        actions.setContractField(field, value);
        // Reset analysis result if user changes text manually
        if (field === 'jobDescription') {
        setAnalysisResult(null); 
        }
    };

    const handleDateChange = (field, newValue) => {
        actions.setContractField(field, newValue);
    };

    const handleDurationPreset = (amount, unit) => {
        if (!contract.startWorkDate) return;
        const newEndDate = contract.startWorkDate.add(amount, unit).subtract(1, 'day');
        actions.setContractField('endWorkDate', newEndDate);
    };

    /**
     * Handle AI Job Analysis
     * Triggered by button click or onBlur
     */
    const handleAnalyzeJob = async () => {
        // validation: Minimum length required
        if (!contract.jobDescription || contract.jobDescription.length < 2) return;
        // Prevent duplicate calls if result exists and text hasn't changed
        if (analysisResult) return;

        setAnalyzing(true);
        try {
        // Call API
        const result = await classifyJob(contract.jobDescription);
        
        if (result.isSimpleLabor) {
            // Case: Simple Labor (Restrictions apply)
            actions.setContractField('jobCategory', 'SIMPLE_LABOR');
            setAnalysisResult({
            type: 'SIMPLE_LABOR',
            message: `AI Classified as 'Simple Labor' (${result.categoryName}). Probation wage reduction will be disabled.`
            });
        } else {
            // Case: Standard Office/Other
            actions.setContractField('jobCategory', 'OFFICE');
            setAnalysisResult({
            type: 'OFFICE',
            message: "AI Classified as 'Standard/Office Job'. No special restrictions."
            });
        }
        } catch (error) {
        console.error("Analysis failed", error);
        } finally {
        setAnalyzing(false);
        }
    };

    // --- 3. Duration Calculation Helper ---
    const durationText = useMemo(() => {
        if (!contract.startWorkDate || !contract.endWorkDate) return null;
        if (isIndefinite) return "Period: Indefinite (기간의 정함이 없음)";

        const start = contract.startWorkDate;
        const end = contract.endWorkDate;
        const diffTime = end.diff(start) + (24 * 60 * 60 * 1000); 
        
        if (diffTime < 0) return "Invalid Period (종료일이 시작일보다 빠릅니다)";

        const dur = dayjs.duration(diffTime);
        const years = dur.years();
        const months = dur.months();
        const days = dur.days();

        const parts = [];
        if (years > 0) parts.push(`${years}년`);
        if (months > 0) parts.push(`${months}개월`);
        if (days > 0) parts.push(`${days}일`);

        return parts.length > 0 ? `Total Period: ${parts.join(' ')}` : "1 Day";
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
            
            {/* --- 1. Contract Period --- */}
            <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
                1. Contract Period (근로계약기간)
            </Typography>
            
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <DatePicker
                label="Start Date"
                value={contract.startWorkDate}
                onChange={(val) => handleDateChange('startWorkDate', val)}
                slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
                />
                <Typography>~</Typography>
                <DatePicker
                label="End Date"
                value={contract.endWorkDate}
                onChange={(val) => handleDateChange('endWorkDate', val)}
                disabled={isIndefinite} 
                slotProps={{ 
                    textField: { 
                    size: 'small',
                    sx: { width: 160 },
                    helperText: isIndefinite ? "Indefinite Contract" : ""
                    } 
                }}
                />
            </Box>

            {!isIndefinite && (
                <Box mt={1} display="flex" alignItems="center" gap={1}>
                <Chip label="+ 3 Months" onClick={() => handleDurationPreset(3, 'month')} color="primary" variant="outlined" clickable size="small" />
                <Chip label="+ 6 Months" onClick={() => handleDurationPreset(6, 'month')} color="primary" variant="outlined" clickable size="small" />
                <Chip label="+ 1 Year" onClick={() => handleDurationPreset(1, 'year')} color="primary" variant="outlined" clickable size="small" />
                </Box>
            )}

            {durationText && (
                <Alert severity="info" sx={{ mt: 2, py: 0, alignItems: 'center' }}>
                <strong>{durationText}</strong>
                </Alert>
            )}
            </Grid>

            {/* --- 2. Workplace --- */}
            <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
                2. Workplace (근무 장소)
            </Typography>
            <TextField
                fullWidth
                size="small"
                placeholder="e.g., GS25 Gangnam Branch (GS25 강남점)"
                value={contract.workplace}
                onChange={(e) => handleChange('workplace', e.target.value)}
            />
            </Grid>

            {/* --- 3. Job Description with AI Check --- */}
            <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
                3. Job Description (업무의 내용)
            </Typography>
            
            <Box display="flex" gap={1} alignItems="flex-start">
                <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="e.g., Cleaning the store, stocking shelves, washing dishes (매장 청소, 진열, 설거지)"
                value={contract.jobDescription}
                onChange={(e) => handleChange('jobDescription', e.target.value)}
                // Trigger analysis when user leaves the field
                onBlur={handleAnalyzeJob}
                helperText="Tip: Specific descriptions help AI protect your rights."
                />
                
                {/* AI Analysis Button */}
                <Tooltip title="AI Check for Simple Labor Classification">
                <Button 
                    variant="contained" 
                    color="secondary" 
                    sx={{ height: '56px', minWidth: '80px', borderRadius: 2 }}
                    onClick={handleAnalyzeJob}
                    disabled={analyzing || !contract.jobDescription}
                >
                    {analyzing ? <CircularProgress size={24} color="inherit" /> : (
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <AutoAwesomeIcon fontSize="small" />
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.5 }}>AI Check</Typography>
                    </Box>
                    )}
                </Button>
                </Tooltip>
            </Box>
            
            {/* Analysis Result Feedback */}
            {analysisResult && (
                <Alert 
                severity={analysisResult.type === 'SIMPLE_LABOR' ? 'warning' : 'success'} 
                icon={analysisResult.type === 'SIMPLE_LABOR' ? <AutoAwesomeIcon /> : <CheckCircleIcon />}
                sx={{ mt: 1 }}
                >
                <Typography variant="body2" fontWeight="bold">
                    {analysisResult.message}
                </Typography>
                </Alert>
            )}
            </Grid>

        </Grid>

        {/* --- Navigation --- */}
        <Box mt={4} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={actions.prevStep}>
            Back
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