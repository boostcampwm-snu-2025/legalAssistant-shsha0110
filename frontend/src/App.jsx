import { Container, Paper, Box, Typography } from '@mui/material';
import { ContractProvider, useContract } from './contexts/ContractContext';
import Step1TypeSelection from './components/steps/Step1TypeSelection'; 
import Step2BasicInfo from './components/steps/Step2BasicInfo';
import Step3WorkTime from './components/steps/Step3WorkTime';
import Step4Wage from './components/steps/Step4Wage';
import Step5Additional from './components/steps/Step5Additional';

// A wrapper component to consume the context
function MainContent() {
  const { state } = useContract();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>

        {/* Header */}
        <Box mb={4} textAlign="center">
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            Standard Labor Contract
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Step {state.currentStep + 1}: Select Contract Type
          </Typography>
        </Box>

        {/* Step Content Switcher */}
          
        {/* Step 1: Type Selection */}
        {state.currentStep === 0 && <Step1TypeSelection />}

        {/* Step 2: Basic Info (Period, Place, Job) - NEW */}
        {state.currentStep === 1 && <Step2BasicInfo />}
        
        {/* Step 3: Work Time (Formerly Step 2) */}
        {state.currentStep === 2 && <Step3WorkTime />}
        
        {/* Step 4: Wage (Formerly Step 3) */}
        {state.currentStep === 3 && <Step4Wage />}

        {/* Step 5: Additional Info - NEW */}
        {state.currentStep === 4 && <Step5Additional />}

        {/* Step 6: AI Review (Next Task) */}
        {state.currentStep === 5 && <Typography>Step 6: AI Legal Review & PDF Generation</Typography>}

      </Paper>
    </Container>
  );
}

// Root App Component
function App() {
  return (
    // Wrap the entire app with the Data Provider
    <ContractProvider>
      <MainContent />
    </ContractProvider>
  );
}

export default App;