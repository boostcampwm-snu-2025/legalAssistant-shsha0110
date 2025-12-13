import React, { useEffect, useState, useMemo } from 'react';
import { 
  Grid, Typography, Box, TextField, Button, Alert, Chip, CircularProgress, Tooltip 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Extend dayjs with duration plugin
dayjs.extend(duration);

import { useContract } from '../../contexts/ContractContext';
import { classifyJob } from '../../api/contractApi'; 

export default function Step2BasicInfo() {
  const { state, actions } = useContract();
  const { contract } = state;
  
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
    if (field === 'jobDescription') {
      setAnalysisResult(null); 
    }
  };

  const handleDateChange = (field, newValue) => {
    actions.setContractField(field, newValue);
  };

  const handleDurationPreset = (amount, unit) => {
    if (!contract.startWorkDate) return;

    let newEndDate;
    if (amount === 0) {
      newEndDate = null;
    } else if (amount > 0) {
      newEndDate = contract.endWorkDate ? contract.endWorkDate.add(amount, unit).subtract(1, 'day') : contract.startWorkDate.add(amount, unit).subtract(1, 'day');
    } else {
      newEndDate = contract.endWorkDate? contract.endWorkDate.add(amount, unit).subtract(-1, 'day') : contract.startWorkDate.add(amount, unit).add(1, 'day');
    } 
    actions.setContractField('endWorkDate', newEndDate);
  };

  const handleAnalyzeJob = async () => {
    if (!contract.jobDescription || contract.jobDescription.length < 2) return;
    if (analysisResult) return;

    setAnalyzing(true);
    try {
      const result = await classifyJob(contract.jobDescription);
      
      if (result.isSimpleLabor) {
        actions.setContractField('jobCategory', 'SIMPLE_LABOR');
        const reasonDetail = result.categoryName || "Elementary Worker";
        actions.setContractField('jobCategoryReason', reasonDetail);

        setAnalysisResult({
          type: 'SIMPLE_LABOR',
          message: `AI 직업분석 결과: '${reasonDetail}'(단순노무직)으로 분류되었습니다. 수습기간이라도 임금 감액이 불가합니다.`
        });
      } else {
        actions.setContractField('jobCategory', 'OFFICE');
        actions.setContractField('jobCategoryReason', ''); 

        setAnalysisResult({
          type: 'OFFICE',
          message: "AI 직업분석 결과: 단순노무직이 아닌 것으로 분류되었습니다. 수습기간 임금 감액이 가능합니다."
        });
      }
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  // --- 3. Duration Calculation ---
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

    return parts.length > 0 ? `총 계약 기간: ${parts.join(' ')}` : "1 Day";
  }, [contract.startWorkDate, contract.endWorkDate, isIndefinite]);


  // Validation
  const isValid = () => {
    const hasStart = !!contract.startWorkDate;
    const hasLocation = !!contract.workplace?.trim();
    const hasJob = !!contract.jobDescription?.trim();
    const hasEnd = isIndefinite ? true : !!contract.endWorkDate;
    const hasAnalysisResult = !!analysisResult;

    return hasStart && hasLocation && hasJob && hasEnd && hasAnalysisResult;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        기본 근로 조건을 입력하세요!
      </Typography>

      <Grid container spacing={3}>
        
        {/* --- 1. Contract Period (Modified Layout) --- */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            1. 근로계약기간
          </Typography>
          
          {/* Use Grid container instead of Box(flex) to handle wrapping gracefully */}
          <Grid container spacing={2} alignItems="center">
            {/* Start Date */}
            <Grid item xs={12} sm={5}>
              <DatePicker
                label="시작일"
                value={contract.startWorkDate}
                onChange={(val) => handleDateChange('startWorkDate', val)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            
            {/* Tilde (~) */}
            <Grid item xs={12} sm={1} sx={{ textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>
              <Typography>~</Typography>
            </Grid>
            
            {/* End Date */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="종료일"
                value={contract.endWorkDate}
                onChange={(val) => handleDateChange('endWorkDate', val)}
                disabled={isIndefinite} 
                slotProps={{ 
                  textField: { 
                    size: 'small',
                    fullWidth: true,
                  } 
                }}
              />
            </Grid>
          </Grid>

          {/* Preset Buttons */}
          {!isIndefinite && (
            <Box mt={1} display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Chip label="- 1년" onClick={() => handleDurationPreset(-1, 'year')} color="primary" variant="outlined" clickable size="small" />
              <Chip label="- 1개월" onClick={() => handleDurationPreset(-1, 'month')} color="primary" variant="outlined" clickable size="small" />
              <Chip label="초기화" onClick={() => handleDurationPreset(0, 'year')} color="primary" variant="outlined" clickable size="small" />
              <Chip label="+ 1개월" onClick={() => handleDurationPreset(1, 'month')} color="primary" variant="outlined" clickable size="small" />
              <Chip label="+ 1년" onClick={() => handleDurationPreset(1, 'year')} color="primary" variant="outlined" clickable size="small" />
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
            2. 근무 장소
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="예) GS25 강남점"
            value={contract.workplace}
            onChange={(e) => handleChange('workplace', e.target.value)}
          />
        </Grid>

        {/* --- 3. Job Description with AI Check --- */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            3. 업무 내용
          </Typography>
          
          <Grid container spacing={1} alignItems="flex-start">
            <Grid item xs>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="예) 편의점 아르바이트: 매장 청소, 진열, 재고 관리"
                value={contract.jobDescription}
                onChange={(e) => handleChange('jobDescription', e.target.value)}
                onBlur={handleAnalyzeJob}
                helperText="Tip: 구체적으로 작성할수록 분쟁을 피할 수 있으며, AI가 당신의 권리를 보호하는데 더 많은 도움을 줄 수 있습니다."
              />
            </Grid>
            <Grid item>
              <Tooltip title="AI를 통한 표준직업분류">
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ height: '80px', minWidth: '80px', borderRadius: 2 }}
                  onClick={handleAnalyzeJob}
                  disabled={analyzing || !contract.jobDescription}
                >
                  {analyzing ? <CircularProgress size={24} color="inherit" /> : (
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <AutoAwesomeIcon fontSize="small" />
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.5 }}>저장 및 직업분류</Typography>
                    </Box>
                  )}
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
          
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