import React from 'react';
import { 
  Grid, Card, CardContent, Typography, CardActionArea, Box, Button 
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChildCareIcon from '@mui/icons-material/ChildCare'; // For Minor
import EventNoteIcon from '@mui/icons-material/EventNote'; // For Fixed-Term
import { useContract } from '../../contexts/ContractContext';

// Definition of contract types for rendering
const CONTRACT_TYPES = [
    { 
        id: 'STANDARD', 
        label: '정규직', 
        desc: '기간의 정함이 없는 경우입니다.', 
        icon: <PersonIcon fontSize="large" /> 
    },
    { 
        id: 'FIXED_TERM', 
        label: '계약직', 
        desc: '기간의 정함이 있는 경우입니다.', 
        icon: <EventNoteIcon fontSize="large" /> 
    },
    { 
        id: 'PART_TIME', 
        label: '파트타임(아르바이트)', 
        desc: '단시간 근로계획이 이루어지는 계약입니다.', 
        icon: <AccessTimeIcon fontSize="large" /> 
    },
    { 
        id: 'MINOR', 
        label: '연소자', 
        desc: '18세 미만의 청소년이 근로자인 계약입니다.', 
        icon: <ChildCareIcon fontSize="large" /> 
    },
];

export default function Step1TypeSelection() {
    // Access global state and actions
    const { state, actions } = useContract();
    
    // Handle card selection
    const handleSelect = (typeId) => {
        actions.setContractField('type', typeId);
    };

    // Check if valid to proceed
    const isSelected = !!state.contract.type;

    return (
        <Box>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            근로 유형을 선택하세요!
        </Typography>

        <Grid container spacing={3}>
            {CONTRACT_TYPES.map((type) => (
            <Grid item xs={12} sm={6} key={type.id}>
                <Card 
                variant="outlined"
                sx={{ 
                    border: state.contract.type === type.id ? '2px solid #1976d2' : '1px solid #ddd',
                    backgroundColor: state.contract.type === type.id ? '#e3f2fd' : 'white',
                    transition: 'all 0.2s',
                }}
                >
                <CardActionArea 
                    onClick={() => handleSelect(type.id)}
                    sx={{ height: '100%', p: 2 }}
                >
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <Box color={state.contract.type === type.id ? 'primary.main' : 'text.secondary'}>
                        {type.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                        {type.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {type.desc}
                    </Typography>
                    </Box>
                </CardActionArea>
                </Card>
            </Grid>
            ))}
        </Grid>

        {/* Navigation Button */}
        <Box mt={4} display="flex" justifyContent="flex-end">
            <Button 
            variant="contained" 
            size="large"
            disabled={!isSelected} // Disable if nothing selected
            onClick={actions.nextStep}
            >
            다음
            </Button>
        </Box>

        </Box>
    );
}