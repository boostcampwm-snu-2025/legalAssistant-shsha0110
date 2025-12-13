import React, { useState } from 'react';
import { 
  Container, Typography, Box, Grid, Fade, Paper, Fab, Tooltip, 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';

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

function MainContent() {
  const { state } = useContract();
  
  // State for controlling the Preview Modal
  const [openPreview, setOpenPreview] = useState(false);

  // Show Preview Button only after Step 1 (Contract Type Selection)
  const showPreviewButton = state.currentStep > 0;

  return (
    // Set maxWidth to 'md' for a focused, centered form layout
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      
      {/* --- Header --- */}
      <Box mb={4} textAlign="center">
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
          Standard Labor Contract Generator
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Step {state.currentStep + 1}
        </Typography>
      </Box>

      {/* --- Main Content (Single Column) --- */}
      <Box>
        {/* Render Steps based on currentStep */}
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            {state.currentStep === 0 && <Step1TypeSelection />}
            {state.currentStep === 1 && <Step2BasicInfo />}
            {state.currentStep === 2 && <Step3WorkTime />}
            {state.currentStep === 3 && <Step4Wage />}
            {state.currentStep === 4 && <Step5Additional />}
            {state.currentStep === 5 && <Step6Review />}
        </Paper>
      </Box>

      {/* --- Floating Action Button (Preview Trigger) --- */}
      {showPreviewButton && (
        <Tooltip title="View Contract Preview (계약서 미리보기)">
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

      {/* --- Preview Modal (Dialog) --- */}
      <Dialog 
        open={openPreview} 
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        {/* Modal Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2} borderBottom="1px solid #eee">
          <Typography variant="h6" fontWeight="bold">
            📄 Contract Live Preview
          </Typography>
          <IconButton onClick={() => setOpenPreview(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Modal Content (The Contract) */}
        <DialogContent dividers sx={{ bgcolor: '#f5f5f5', p: 4 }}>
          {/* Reusing the existing ContractPreview component */}
          <ContractPreview />
        </DialogContent>

        {/* Modal Footer */}
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