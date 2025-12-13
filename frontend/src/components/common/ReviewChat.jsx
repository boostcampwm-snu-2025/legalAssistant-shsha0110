import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, TextField, IconButton, Paper, Typography, Avatar, CircularProgress 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

import { sendChat } from '../../api/contractApi';

export default function ReviewChat({ context }) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', text: '안녕하세요! 계약서 검토 결과에 대해 궁금한 점이 있으신가요? 편하게 물어보세요.' }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
        const response = await sendChat(input, context);
        
        const aiMsg = { role: 'assistant', text: response.reply };
        setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
        console.error("Chat Error:", error);
        setMessages(prev => [...prev, { role: 'assistant', text: "죄송합니다. 오류가 발생하여 답변할 수 없습니다." }]);
        } finally {
        setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
        }
    };

    return (
        <Paper variant="outlined" sx={{ height: 400, display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
        {/* Messages Area */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {messages.map((msg, index) => (
            <Box 
                key={index} 
                display="flex" 
                justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                mb={2}
            >
                {/* AI Avatar */}
                {msg.role === 'assistant' && (
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, mr: 1 }}>
                    <SmartToyIcon fontSize="small" />
                </Avatar>
                )}
                
                {/* Message Bubble */}
                <Paper 
                sx={{ 
                    p: 1.5, 
                    maxWidth: '75%', 
                    bgcolor: msg.role === 'user' ? 'primary.main' : '#f5f5f5',
                    color: msg.role === 'user' ? '#fff' : 'text.primary',
                    borderRadius: 2
                }}
                >
                <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                    {msg.text}
                </Typography>
                </Paper>

                {/* User Avatar */}
                {msg.role === 'user' && (
                <Avatar sx={{ bgcolor: 'grey.400', width: 32, height: 32, ml: 1 }}>
                    <PersonIcon fontSize="small" />
                </Avatar>
                )}
            </Box>
            ))}
            
            {/* Loading Indicator */}
            {loading && (
            <Box display="flex" justifyContent="flex-start" mb={2}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, mr: 1 }}>
                    <SmartToyIcon fontSize="small" />
                </Avatar>
                <Paper sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <CircularProgress size={20} />
                </Paper>
            </Box>
            )}
            <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box sx={{ p: 2, borderTop: '1px solid #eee', display: 'flex', gap: 1 }}>
            <TextField 
            fullWidth
            size="small"
            placeholder="계약 내용에 대해 질문하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            multiline
            maxRows={2}
            />
            <IconButton 
            color="primary" 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            >
            <SendIcon />
            </IconButton>
        </Box>
        </Paper>
    );
}