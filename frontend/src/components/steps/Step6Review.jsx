import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Button, Paper, CircularProgress, 
  Chip, List, ListItem, ListItemIcon, ListItemText, Alert,
  TextField, IconButton, Divider, Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy'; // AI Icon
import PersonIcon from '@mui/icons-material/Person'; // User Icon

import { useContract } from '../../contexts/ContractContext';
import { reviewContract, sendChat } from '../../api/contractApi';

export default function Step6Review() {
    const { state, actions } = useContract();
    
    // State for Analysis
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    
    // State for Chat
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null); // For auto-scrolling

    // --- 1. Initial Analysis (Mount) ---
    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                setLoading(true);
                const data = await reviewContract(state.contract);
                setResult(data);
                // Add initial greeting to chat
                setChatHistory([{
                    role: 'ai',
                    text: "I have finished analyzing your contract. Do you have any questions about the results?"
                }]);
            } catch (err) {
                console.error("Analysis failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, []);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);


    // --- 2. Chat Handlers ---
    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatInput(''); // Clear input

        // Add User Message
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatLoading(true);

        try {
            // API Call
            const data = await sendChat(userMsg, state.contract);
            // Add AI Response
            setChatHistory(prev => [...prev, { role: 'ai', text: data.reply }]);
        } catch (err) {
            setChatHistory(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't process that. Please try again." }]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };


    // --- Render Helpers ---
    const getRiskColor = (level) => {
        if (level === 'SAFE') return 'success';
        if (level === 'DANGER') return 'error';
        return 'warning';
    };

    // --- Loading View ---
    if (loading) {
        return (
        <Box display="flex" flexDirection="column" alignItems="center" py={10}>
            <CircularProgress size={60} />
            <Typography variant="h6" mt={3}>AI Legal Advisor is reviewing...</Typography>
            <Typography variant="body2" color="text.secondary">Checking Labor Standards Act compliance</Typography>
        </Box>
        );
    }

    // --- Main View ---
    return (
        <Box>
        <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            📊 AI Legal Review Report
        </Typography>

        {/* --- Section A: Analysis Report --- */}
        <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#fff' }}>
            
            {/* Score Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box>
                <Typography variant="subtitle2" color="text.secondary">Legal Safety Score</Typography>
                <Typography variant="h3" fontWeight="bold" color={getRiskColor(result.riskLevel) + '.main'}>
                {result.riskScore} <Typography component="span" variant="h6" color="text.secondary">/ 100</Typography>
                </Typography>
            </Box>
            <Chip 
                label={result.riskLevel} 
                color={getRiskColor(result.riskLevel)} 
                sx={{ fontSize: '1.2rem', py: 3, px: 2, fontWeight: 'bold' }} 
            />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 3-Line Summary */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>📝 Easy Summary</Typography>
            <List dense sx={{ bgcolor: '#f9f9f9', borderRadius: 2 }}>
            <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Wage" secondary={result.plainLanguageSummary.wage} />
            </ListItem>
            <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Work Time" secondary={result.plainLanguageSummary.workTime} />
            </ListItem>
            <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Key Rights" secondary={result.plainLanguageSummary.rights} />
            </ListItem>
            </List>

            {/* Issues List */}
            {result.issues.length > 0 && (
            <Box mt={3}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="error.main">
                ⚠️ Action Items ({result.issues.length})
                </Typography>
                {result.issues.map((issue, idx) => (
                <Alert severity={issue.type === 'ILLEGAL' ? 'error' : 'warning'} key={idx} sx={{ mb: 1 }}>
                    <strong>{issue.message}</strong><br/>
                    Suggestion: {issue.suggestion}
                </Alert>
                ))}
            </Box>
            )}
        </Paper>

        {/* --- Section B: AI Chat (Q&A) --- */}
        <Typography variant="h6" gutterBottom fontWeight="bold" mt={4}>
            💬 Ask AI Lawyer (Q&A)
        </Typography>
        
        <Paper variant="outlined" sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            
            {/* Chat History Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: '#f8f9fa' }}>
            {chatHistory.map((msg, idx) => (
                <Box 
                key={idx} 
                display="flex" 
                justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                mb={2}
                >
                {msg.role === 'ai' && <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 32, height: 32 }}><SmartToyIcon fontSize="small" /></Avatar>}
                
                <Paper sx={{ 
                    p: 1.5, 
                    maxWidth: '70%', 
                    bgcolor: msg.role === 'user' ? 'primary.main' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#000',
                    borderRadius: 2
                }}>
                    <Typography variant="body2">{msg.text}</Typography>
                </Paper>
                </Box>
            ))}
            {chatLoading && (
                <Box display="flex" justifyContent="flex-start" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 32, height: 32 }}><SmartToyIcon fontSize="small" /></Avatar>
                <Paper sx={{ p: 1.5, bgcolor: '#fff' }}>
                    <Typography variant="body2" color="text.secondary">Typing...</Typography>
                </Paper>
                </Box>
            )}
            <div ref={chatEndRef} />
            </Box>

            {/* Input Area */}
            <Box p={2} bgcolor="#fff" borderTop="1px solid #ddd" display="flex" gap={1}>
            <TextField
                fullWidth
                size="small"
                placeholder="Ask about your contract (e.g., 'Is the probation period legal?')"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={chatLoading}
            />
            <IconButton color="primary" onClick={handleSendMessage} disabled={chatLoading || !chatInput.trim()}>
                <SendIcon />
            </IconButton>
            </Box>
        </Paper>

        {/* Final Action */}
        <Box mt={4} textAlign="center">
            <Button variant="contained" size="large" color="success" sx={{ px: 5, py: 1.5 }}>
            Download Signed PDF (Final)
            </Button>
        </Box>

        </Box>
    );
}