import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Fade 
} from '@mui/material';
import axios from 'axios';

// Context & Steps
import { ContractProvider, useContract } from './contexts/ContractContext';
import Step1TypeSelection from './components/steps/Step1TypeSelection';
import Step2BasicInfo from './components/steps/Step2BasicInfo';
import Step3WorkTime from './components/steps/Step3WorkTime';
import Step4Wage from './components/steps/Step4Wage';
import Step5Additional from './components/steps/Step5Additional';

import ContractPreview from './components/common/ContractPreview';

function MainContent() {
  const { state } = useContract();

  // Determine if we should show the preview (Show from Step 1 onwards)
  // Step 0 is Type Selection (Index 0)
  const showPreview = state.currentStep > 0;

  return (
    <Container maxWidth={showPreview ? "xl" : "md"} sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Box mb={4} textAlign="center">
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
          Standard Labor Contract Generator
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Step {state.currentStep + 1}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* --- Left Column: Input Forms --- */}
        <Grid item xs={5} sm={5} md={5} lg={5}>
          <Box>
            {state.currentStep === 0 && <Step1TypeSelection />}
            {state.currentStep === 1 && <Step2BasicInfo />}
            {state.currentStep === 2 && <Step3WorkTime />}
            {state.currentStep === 3 && <Step4Wage />}
            {state.currentStep === 4 && <Step5Additional />}
            {state.currentStep === 5 && <Typography variant="h5">✅ 작성이 완료되었습니다!</Typography>}
          </Box>
        </Grid>

        {/* Right Column (Preview) */}
        {showPreview && (
          <Grid item xs={7} sm={7} md={7} lg={7}>
            <Fade in={showPreview} timeout={800}>
              <Box sx={{ position: 'sticky', top: '24px', alignSelf: 'start' }}>
                <Box 
                  mb={2}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  bgcolor="#e3f2fd"
                  p={1}
                  borderRadius={1}
                >
                  <Typography variant="subtitle2" color="primary" fontWeight="bold">
                    👁️ Live Preview
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    * 입력 내용 자동 반영 중
                  </Typography>
                </Box>

                <ContractPreview />
              </Box>
            </Fade>
          </Grid>
        )}
      </Grid>
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