import React from 'react';
import { 
  Grid, Typography, Box, Button, FormGroup, FormControlLabel, Checkbox, 
  TextField, Paper, Alert 
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import { useContract } from '../../contexts/ContractContext';

export default function Step5Additional() {
    const { state, actions } = useContract();
    const { otherDetails } = state.contract;

    // --- Handlers ---

    /**
     * Handles Social Insurance checkboxes.
     * Toggles the specific insurance boolean value.
     */
    const handleInsuranceChange = (key) => {
        actions.updateContractSection('otherDetails', {
        socialInsurance: {
            ...otherDetails.socialInsurance,
            [key]: !otherDetails.socialInsurance[key]
        }
        });
    };

    /**
     * Handles text input for 'Other Terms'.
     */
    const handleOtherTermsChange = (e) => {
        actions.updateContractSection('otherDetails', { otherTerms: e.target.value });
    };

    return (
        <Box>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Additional Legal Requirements (기타 법적 의무 및 사회보험)
        </Typography>

        <Grid container spacing={3}>

            {/* --- Item 8: Social Insurance (사회보험) --- */}
            <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                8. Social Insurance Application (사회보험 적용 여부)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                Select applicable insurances (Check all for standard employment).
                </Typography>
                
                <FormGroup row sx={{ mt: 1 }}>
                <FormControlLabel
                    control={
                    <Checkbox 
                        checked={otherDetails.socialInsurance.employment} 
                        onChange={() => handleInsuranceChange('employment')} 
                    />
                    }
                    label="Employment (고용보험)"
                />
                <FormControlLabel
                    control={
                    <Checkbox 
                        checked={otherDetails.socialInsurance.accident} 
                        onChange={() => handleInsuranceChange('accident')} 
                    />
                    }
                    label="Accident (산재보험)"
                />
                <FormControlLabel
                    control={
                    <Checkbox 
                        checked={otherDetails.socialInsurance.pension} 
                        onChange={() => handleInsuranceChange('pension')} 
                    />
                    }
                    label="Pension (국민연금)"
                />
                <FormControlLabel
                    control={
                    <Checkbox 
                        checked={otherDetails.socialInsurance.health} 
                        onChange={() => handleInsuranceChange('health')} 
                    />
                    }
                    label="Health (건강보험)"
                />
                </FormGroup>
            </Paper>
            </Grid>

            {/* --- Item 7, 9, 10: Standard Clauses (Read-only Confirmation) --- */}
            <Grid item xs={12}>
            <Box p={2} bgcolor="#f5f5f5" borderRadius={2}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                <VerifiedUserIcon color="success" fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold">
                    Standard Legal Clauses (Included Automatically)
                </Typography>
                </Box>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem', color: '#555' }}>
                <li>
                    <strong>7. Annual Paid Leave:</strong> Granted according to the Labor Standards Act.
                </li>
                <li>
                    <strong>9. Contract Delivery:</strong> The employer must provide a copy of this contract to the worker immediately upon signing.
                </li>
                <li>
                    <strong>10. Duty of Good Faith:</strong> Both parties shall fulfill the contract and employment rules faithfully.
                </li>
                </ul>
            </Box>
            </Grid>

            {/* --- Item 11: Other Terms (Custom Input - AI Risk Analysis Target) --- */}
            <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                11. Other Terms & Conditions (기타 특약 사항)
            </Typography>
            <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter any specific agreements here. (e.g., Uniform provided, Probation details, etc.)"
                value={otherDetails.otherTerms}
                onChange={handleOtherTermsChange}
                helperText="WARNING: Clauses violating labor laws (e.g., 'penalty for quitting') will be flagged by AI in the next step."
            />
            </Grid>

        </Grid>

        {/* --- Navigation --- */}
        <Box mt={4} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={actions.prevStep}>
            Back (Wage)
            </Button>
            <Button 
            variant="contained" 
            size="large"
            color="secondary" // Highlight "Finish" action
            onClick={actions.nextStep}
            >
            Review & Create (작성 완료)
            </Button>
        </Box>
        </Box>
    );
}