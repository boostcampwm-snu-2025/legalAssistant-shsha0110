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
        label: 'Standard (정규직)', 
        desc: 'No fixed contract period.', 
        icon: <PersonIcon fontSize="large" /> 
    },
    { 
        id: 'FIXED_TERM', 
        label: 'Fixed-Term (계약직)', 
        desc: 'Contract with an end date.', 
        icon: <EventNoteIcon fontSize="large" /> 
    },
    { 
        id: 'PART_TIME', 
        label: 'Part-Time (아르바이트)', 
        desc: 'Short hours, weekly schedule.', 
        icon: <AccessTimeIcon fontSize="large" /> 
    },
    { 
        id: 'MINOR', 
        label: 'Minor (연소자)', 
        desc: 'Under 18, requires consent.', 
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
            Who are you hiring? (근로 형태를 선택하세요)
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
            Next Step (Time)
            </Button>
        </Box>

        {/* Debug: Show current selection */}
        <Box mt={4} p={2} bgcolor="#f5f5f5" borderRadius={1}>
            <Typography variant="caption" fontFamily="monospace">
            Current Selection: {JSON.stringify(state.contract.type || 'None')}
            </Typography>
        </Box>
        </Box>
    );
}