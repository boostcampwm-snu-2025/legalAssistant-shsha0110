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
            기타 법적 의무 및 사회보험을 입력주세요!
        </Typography>

        <Grid container spacing={3}>

            {/* --- Item 8: Social Insurance (사회보험) --- */}
            <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                8. 사회보험 적용 여부
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    해당되는 보험을 모두 선택해주세요. (4대 사회보험 적용을 원칙으로 함.)
                </Typography>
                
                <FormGroup row sx={{ mt: 1 }}>
                <FormControlLabel
                    control={
                    <Checkbox 
                        checked={otherDetails.socialInsurance.employment} 
                        onChange={() => handleInsuranceChange('employment')} 
                    />
                    }
                    label="고용보험"
                />
                <FormControlLabel
                    control={
                    <Checkbox 
                        checked={otherDetails.socialInsurance.accident} 
                        onChange={() => handleInsuranceChange('accident')} 
                    />
                    }
                    label="산재보험"
                />
                <FormControlLabel
                    control={
                    <Checkbox 
                        checked={otherDetails.socialInsurance.pension} 
                        onChange={() => handleInsuranceChange('pension')} 
                    />
                    }
                    label="국민연금"
                />
                <FormControlLabel
                    control={
                    <Checkbox 
                        checked={otherDetails.socialInsurance.health} 
                        onChange={() => handleInsuranceChange('health')} 
                    />
                    }
                    label="건강보험"
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
                    표준 법률 조항 (자동 포함)
                </Typography>
                </Box>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem', color: '#555' }}>
                <li>
                    <strong>7. 연차유급휴가:</strong> 연차유급휴가는 근로기준법에서 정하는 바에 따라 부여함.
                </li>
                <li>
                    <strong>9. 근로계약서 교부:</strong> 사업주는 근로계약을 체결함과 동시에 본 계약서를 사본하여 근로자의 교부요구와 관계없이 근로자에게 교부함(근로기준법 제17조 이행).
                </li>
                <li>
                    <strong>10. 근로계약, 취업규칙 등의 성실한 이행의무:</strong> 사업주와 근로자는 각자가 근로계약, 취업규칙, 단체협약을 지키고 성실하게 이행하여야 함.
                </li>
                </ul>
            </Box>
            </Grid>

            {/* --- Item 11: Other Terms (Custom Input - AI Risk Analysis Target) --- */}
            <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                11. 기타 특약 사항
            </Typography>
            <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="기타 특약 사항을 입력해주세요!  예) 유니폼 착용, 수습 기간 관련 사항 등"
                value={otherDetails.otherTerms}
                onChange={handleOtherTermsChange}
                helperText="Warning: 근로기준법을 위반하는 조항은 다음 단계에서 AI에 의해 경고 표시가 됩니다."
            />
            </Grid>

        </Grid>

        {/* --- Navigation --- */}
        <Box mt={4} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={actions.prevStep}>
            이전
            </Button>
            <Button 
            variant="contained" 
            size="large"
            color="secondary" // Highlight "Finish" action
            onClick={actions.nextStep}
            >
            작성완료
            </Button>
        </Box>
        </Box>
    );
}