import React from 'react';
import { 
  Grid, Typography, Box, TextField, Button, Alert 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useContract } from '../../contexts/ContractContext';

export default function Step2BasicInfo() {
    const { state, actions } = useContract();
    const { contract } = state;

    // --- 1. Determine Contract Type Logic ---
    // According to the standard form:
    // - Standard (Indefinite): Only Start Date is required[cite: 2].
    // - Fixed-Term / Part-Time: Start & End Dates are required[cite: 8, 29].
    const isIndefinite = contract.type === 'STANDARD';

    // --- 2. Handlers ---

    /**
     * Handles text field changes (Location, Job Description).
     */
    const handleChange = (field, value) => {
        actions.setContractField(field, value);
    };

    /**
     * Handles date picker changes.
     * @param {string} field - 'startWorkDate' or 'endWorkDate'
     * @param {object} newValue - Dayjs object
     */
    const handleDateChange = (field, newValue) => {
        actions.setContractField(field, newValue);
    };

    /**
     * Validation check for the "Next" button.
     * Requires: Start Date, Workplace, and Job Description.
     * If not indefinite, End Date is also required.
     */
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
                
                {/* --- 1. Contract Period (근로계약기간) --- */}
                <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                        1. Contract Period (근로계약기간)
                    </Typography>
                    <Box display="flex" gap={2} alignItems="center">
                        <DatePicker
                        label="Start Date (부터)"
                        value={contract.startWorkDate}
                        onChange={(val) => handleDateChange('startWorkDate', val)}
                        slotProps={{ textField: { fullWidth: true } }}
                        />
                        
                        <Typography variant="body1">~</Typography>
                        
                        <DatePicker
                        label="End Date (까지)"
                        value={contract.endWorkDate}
                        onChange={(val) => handleDateChange('endWorkDate', val)}
                        disabled={isIndefinite} // Disable for Standard employees
                        slotProps={{ 
                            textField: { 
                            fullWidth: true,
                            helperText: isIndefinite ? "Not required for Standard (Indefinite) contracts" : "Required"
                            } 
                        }}
                        />
                    </Box>
                </Grid>

                {/* --- 2. Workplace (근무 장소) --- */}
                <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                        2. Workplace (근무 장소)
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="e.g., GS25 Gangnam Branch (GS25 강남점)"
                        value={contract.workplace}
                        onChange={(e) => handleChange('workplace', e.target.value)}
                    />
                </Grid>

                {/* --- 3. Job Description (업무의 내용) --- */}
                <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                        3. Job Description (업무의 내용)
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="e.g., Customer service, cleaning, inventory management (고객 응대, 매장 청소, 재고 관리)"
                        value={contract.jobDescription}
                        onChange={(e) => handleChange('jobDescription', e.target.value)}
                    />
                    <Alert severity="info" sx={{ mt: 1 }}>
                        Tip: Be specific to avoid legal ambiguity. (구체적으로 적을수록 분쟁을 예방할 수 있습니다.)
                    </Alert>
                </Grid>

            </Grid>

            {/* --- Navigation Buttons --- */}
            <Box mt={4} display="flex" justifyContent="space-between">
                <Button variant="outlined" onClick={actions.prevStep}>
                Back (Type Selection)
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