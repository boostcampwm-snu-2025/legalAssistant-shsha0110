import { Container, Paper, Box, Typography } from '@mui/material';
import { ContractProvider, useContract } from './contexts/ContractContext';
import Step1TypeSelection from './components/steps/Step1TypeSelection'; 
import Step2WorkTime from './components/steps/Step2WorkTime';
import Step3Wage from './components/steps/Step3Wage';

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
        {state.currentStep === 0 && <Step1TypeSelection />}
        {state.currentStep === 1 && <Step2WorkTime />}
        {state.currentStep === 2 && <Step3Wage />}
        {state.currentStep === 3 && <Typography>Step 4: AI Review (Coming Soon)</Typography>} 
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