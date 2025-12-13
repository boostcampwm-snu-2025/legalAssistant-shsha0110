import React, { useState } from 'react';
import { 
  Container, Typography, Box, Paper, Fab, Tooltip, 
  Dialog, DialogContent, DialogActions, Button, IconButton,
  Stepper, Step, StepLabel, Chip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility'; 
import CloseIcon from '@mui/icons-material/Close';
import SecurityIcon from '@mui/icons-material/Security'; // Protection Icon

// Context
import { ContractProvider, useContract } from './contexts/ContractContext';

// Steps Components
import Step1TypeSelection from './components/steps/Step1TypeSelection';
import Step2BasicInfo from './components/steps/Step2BasicInfo';
import Step3WorkTime from './components/steps/Step3WorkTime';
import Step4Wage from './components/steps/Step4Wage';
import Step5Additional from './components/steps/Step5Additional';
import Step6Review from './components/steps/Step6Review';

// Preview Component
import ContractPreview from './components/common/ContractPreview';

// --- Define Step Labels ---
const STEPS = [
  '유형 선택',   // Type Selection
  '기본 정보',   // Basic Info
  '근로 시간',   // Work Time
  '임금 설정',   // Wage
  '기타/보험',   // Additional
  'AI 검토'      // Review
];

function MainContent() {
  const { state } = useContract();
  
  // State for Preview Modal
  const [openPreview, setOpenPreview] = useState(false);

  // Show Preview Button after Step 1
  const showPreviewButton = state.currentStep > 0;

  // Check if Minor Protection Mode is active
  const isMinor = state.contract.type === 'MINOR';

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      
      {/* --- Header Area --- */}
      <Box mb={4} textAlign="center">
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
          표준근로계약서 작성 도우미
        </Typography>
        
        {/* [NEW] Minor Protection Badge (Global Status) */}
        {isMinor && (
          <Box mb={2}>
            <Chip 
              icon={<SecurityIcon />} 
              label="연소자(18세 미만) 안심 보호 모드 작동 중" 
              color="success" 
              variant="outlined" 
              sx={{ fontWeight: 'bold', bgcolor: '#e8f5e9' }}
            />
          </Box>
        )}

        {/* [NEW] Visual Stepper */}
        <Stepper activeStep={state.currentStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* --- Main Form Content --- */}
      <Box>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            {state.currentStep === 0 && <Step1TypeSelection />}
            {state.currentStep === 1 && <Step2BasicInfo />}
            {state.currentStep === 2 && <Step3WorkTime />}
            {state.currentStep === 3 && <Step4Wage />}
            {state.currentStep === 4 && <Step5Additional />}
            {state.currentStep === 5 && <Step6Review />}
        </Paper>
      </Box>

      {/* --- Floating Preview Button --- */}
      {showPreviewButton && (
        <Tooltip title="계약서 미리보기">
          <Fab 
            color="primary" 
            aria-label="preview"
            sx={{ 
              position: 'fixed', 
              bottom: 32, 
              right: 32, 
              zIndex: 1000 
            }}
            onClick={() => setOpenPreview(true)}
          >
            <VisibilityIcon />
          </Fab>
        </Tooltip>
      )}

      {/* --- Preview Modal --- */}
      <Dialog 
        open={openPreview} 
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2} borderBottom="1px solid #eee">
          <Typography variant="h6" fontWeight="bold">
            📄 계약서 미리보기
          </Typography>
          <IconButton onClick={() => setOpenPreview(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent dividers sx={{ bgcolor: '#f5f5f5', p: 4 }}>
          <ContractPreview />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPreview(false)} variant="contained" color="primary">
            Close Preview
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}

function App() {
  return (
    <ContractProvider>
      <MainContent />
    </ContractProvider>
  );
}

export default App;