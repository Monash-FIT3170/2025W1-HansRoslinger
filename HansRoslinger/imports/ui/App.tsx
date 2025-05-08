import React, { useState } from 'react';
import { Button } from './Input'; // Custom button
import { D3LineChart } from './Charts/D3LineChart';
import { D3BarChart } from './Charts/D3BarChart';
import { WebcamComponent } from './Video/webcam';

// Material UI
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MuiButton from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

export const App = () => {
  const [grayscale, setGrayscale] = useState(false);
  const [showWebcam, setShowWebcam] = useState(true);
  const [showLineChart, setShowLineChart] = useState(true);

  const data = [
    { label: 'Jan', value: 50 },
    { label: 'Feb', value: 70 },
    { label: 'Mar', value: 40 },
    { label: 'Apr', value: 90 },
    { label: 'May', value: 60 },
    { label: 'Jun', value: 80 },
    { label: 'Jul', value: 30 },
    { label: 'Aug', value: 100 },
    { label: 'Sep', value: 20 },
    { label: 'Oct', value: 50 },
    { label: 'Nov', value: 70 },
    { label: 'Dec', value: 30 },
  ];

  return (
    <div className="app-container flex flex-col items-center min-h-screen bg-transparent">
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              HansRoslinger
            </Typography>

            {/* Use children for MuiButton text */}
            <MuiButton 
              onClick={() => setGrayscale(!grayscale)} 
              color="secondary"
              variant="contained"
              sx={{ mx: 1, bgcolor: '#6A5ACD', '&:hover': { bgcolor: '#483D8B' } }}
            >
              Toggle Grayscale
            </MuiButton>

            <MuiButton 
              onClick={() => setShowLineChart(!showLineChart)} 
              color="primary"
              variant="contained"
              sx={{ mx: 1, bgcolor: '#20B2AA', '&:hover': { bgcolor: '#008B8B' } }}
            >
              {`Switch to ${showLineChart ? 'BarChart' : 'LineChart'}`}
            </MuiButton>
          </Toolbar>
        </AppBar>
      </Box>

      <div className="flex-grow flex items-center justify-center w-full mt-4">
        {showWebcam && <WebcamComponent grayscale={grayscale} />}
      </div>

      <div className="w-full flex justify-center mb-4">
        {showLineChart ? <D3LineChart data={data} /> : <D3BarChart data={data} />}
      </div>
    </div>
  );
};
