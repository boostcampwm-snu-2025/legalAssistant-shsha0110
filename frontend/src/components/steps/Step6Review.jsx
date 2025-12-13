import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, Paper, CircularProgress, Alert, Divider,
  Chip, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useContract } from '../../contexts/ContractContext';
import { reviewContract } from '../../api/contractApi';
import ReviewChat from '../common/ReviewChat'; 

// Helper function to determine color based on risk level
const getRiskColor = (level) => {
    if (level === 'SAFE') return 'success';
    if (level === 'MODERATE') return 'warning'; 
    if (level === 'RISKY' || level === 'DANGER') return 'error';
    return 'info'; 
};

export default function Step6Review() {
    const { state, actions } = useContract();
    
    // State for API calls
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);

    // --- 1. Fetch AI Analysis ---
    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            // Call the backend API to review the contract
            const result = await reviewContract(state.contract);
            setAnalysis(result);
        } catch (err) {
            console.error("Analysis Error:", err);
            setError("AI 분석 서버와 통신에 실패했습니다. (Network Error)");
        } finally {
            setLoading(false);
        }
    };

    // Trigger analysis on component mount
    useEffect(() => {
        fetchAnalysis();
    }, []);

    // --- 2. Handlers ---
    
    // Retry the API call if it fails
    const handleRetry = () => fetchAnalysis();
    
    // Go back to the previous step (Step 5) to modify data
    const handleEdit = () => actions.prevStep();

    // --- 3. Render Views ---

    // View A: Loading State
    if (loading) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" py={10}>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" mt={3} color="text.secondary">
                    AI Legal Advisor is reviewing...
                </Typography>
            </Box>
        );
    }

    // View B: Error State
    if (error) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" py={8}>
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                <Button 
                    variant="contained" 
                    startIcon={<RefreshIcon />} 
                    onClick={handleRetry}
                >
                    Retry Analysis
                </Button>
                <Button sx={{ mt: 2 }} onClick={handleEdit}>
                    Go Back
                </Button>
            </Box>
        );
    }

    // View C: Success State (Analysis Report)
    return (
        <Box height="100%">
            
            {/* --- Section A: Analysis Report --- */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#fff' }}>
                
                {/* 1. Score Header */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                            Legal Safety Score
                        </Typography>
                        <Typography 
                            variant="h3" 
                            fontWeight="bold" 
                            color={getRiskColor(analysis?.riskLevel) + '.main'}
                        >
                            {analysis?.riskScore || 0} 
                            <Typography component="span" variant="h6" color="text.secondary">
                                / 100
                            </Typography>
                        </Typography>
                    </Box>
                    <Chip 
                        label={analysis?.riskLevel || 'UNKNOWN'} 
                        color={getRiskColor(analysis?.riskLevel)} 
                        sx={{ fontSize: '1.2rem', py: 3, px: 2, fontWeight: 'bold' }} 
                    />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* 2. 3-Line Summary */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    📝 Easy Summary
                </Typography>
                <List dense sx={{ bgcolor: '#f9f9f9', borderRadius: 2 }}>
                    <ListItem>
                        <ListItemIcon>
                            <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Wage (임금)" 
                            secondary={analysis?.plainLanguageSummary?.wage || "No information"} 
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Work Time (근로시간)" 
                            secondary={analysis?.plainLanguageSummary?.workTime || "No information"} 
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Key Rights (주요 권리)" 
                            secondary={analysis?.plainLanguageSummary?.rights || "No information"} 
                        />
                    </ListItem>
                </List>

                {/* 3. Issues List (Action Items) */}
                {analysis?.issues?.length > 0 ? (
                    <Box mt={3}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="error.main">
                            ⚠️ Action Items ({analysis.issues.length})
                        </Typography>
                        {analysis.issues.map((issue, idx) => (
                            <Alert 
                                severity={
                                    typeof issue === 'object' && issue.type === 'ILLEGAL' 
                                    ? 'error' 
                                    : 'warning'
                                } 
                                key={idx} 
                                sx={{ mb: 1 }}
                            >
                                {/* Safely handle Object vs String issue formats */}
                                {typeof issue === 'object' ? (
                                    <Box>
                                        <strong>{issue.message}</strong>
                                        {issue.suggestion && (
                                            <div style={{ marginTop: '4px', fontSize: '0.9em' }}>
                                                💡 {issue.suggestion}
                                            </div>
                                        )}
                                    </Box>
                                ) : (
                                    <strong>{issue}</strong>
                                )}
                            </Alert>
                        ))}
                    </Box>
                ) : (
                    <Alert severity="success" sx={{ mt: 3 }}>
                        <strong>Perfect!</strong> No legal risks detected.
                    </Alert>
                )}
            </Paper>

            {/* --- Section B: Chat Interface --- */}
            <Box mb={4}>
                <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={1}>
                    <AutoAwesomeIcon fontSize="small" color="primary"/> Ask AI Lawyer
                </Typography>
                {/* Pass analysis context to the chat component */}
                <ReviewChat context={analysis} /> 
            </Box>

            {/* --- Section C: Action Buttons --- */}
            <Box mt={4} display="flex" justifyContent="flex-start">
                <Button 
                    variant="outlined" 
                    size="large"
                    startIcon={<EditIcon />} 
                    onClick={handleEdit}
                >
                    수정하기
                </Button>
            </Box>

        </Box>
    );
}