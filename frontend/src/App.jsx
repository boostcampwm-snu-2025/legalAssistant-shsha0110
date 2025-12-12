import { useState, useEffect } from 'react';
import axios from 'axios';
// MUI Imports
import { Container, Paper, Typography, Button, Box, Chip, CircularProgress } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

function App() {
  // State to track backend connection status
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking' | 'connected' | 'error'

  /**
   * Check connection to the backend server on component mount.
   */
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        // Attempt to reach the backend health check endpoint
        const response = await axios.get('http://localhost:3000/');
        console.log('Backend response:', response.data);
        setServerStatus('connected');
      } catch (error) {
        console.error('Failed to connect to backend:', error);
        setServerStatus('error');
      }
    };

    checkServerConnection();
  }, []);

  /**
   * Handler for the "Start" button.
   */
  const handleStart = () => {
    // TODO: Navigate to Step 1 (Contract Type Selection)
    alert('Navigation to Step 1 will be implemented here.');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* --- Header Section --- */}
        <Box display="flex" alignItems="center" mb={2}>
          <DescriptionIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
          <Typography variant="h5" component="h1" fontWeight="bold">
            표준근로계약서 (Standard Labor Contract)
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          This is the starting point of the project. 
          The UI uses Material UI, and the logic is connected to a Node.js backend.
        </Typography>

        {/* --- Server Status Indicator --- */}
        <Box mb={4} display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" fontWeight="medium">
            Server Status:
          </Typography>
          
          {serverStatus === 'checking' && (
            <Chip 
              icon={<CircularProgress size={16} />} 
              label="Checking..." 
              variant="outlined" 
            />
          )}
          
          {serverStatus === 'connected' && (
            <Chip 
              icon={<CheckCircleIcon />} 
              label="Online" 
              color="success" 
              variant="outlined" 
            />
          )}

          {serverStatus === 'error' && (
            <Chip 
              icon={<ErrorIcon />} 
              label="Offline" 
              color="error" 
              variant="outlined" 
            />
          )}
        </Box>

        {/* --- Action Area --- */}
        <Box>
           <Button 
             variant="contained" 
             color="primary" 
             fullWidth 
             size="large" 
             onClick={handleStart}
             disabled={serverStatus === 'checking'}
           >
             계약서 작성 시작하기 (Start)
           </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default App;