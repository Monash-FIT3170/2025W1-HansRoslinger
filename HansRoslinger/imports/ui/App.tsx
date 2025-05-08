import React, { useState } from 'react';
import { Button } from './Input'; // Custom Button (if still used)
import { D3LineChart } from './Charts/D3LineChart';
import { D3BarChart } from './Charts/D3BarChart';
import { WebcamComponent } from './Video/webcam';

// Material UI
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MuiButton from '@mui/material/Button';
import Stack from '@mui/material/Stack';

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
        <AppBar
          position="static"
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#fff',
            boxShadow: 'none',
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              HansRoslinger
            </Typography>

            <Stack direction="row" spacing={2}>
              <MuiButton
                onClick={() => setGrayscale(!grayscale)}
                variant="outlined"
                sx={{
                  border: '1px solid #fff',
                  color: '#fff',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Toggle Grayscale
              </MuiButton>

              <MuiButton
                onClick={() => setShowLineChart(!showLineChart)}
                variant="outlined"
                sx={{
                  border: '1px solid #fff',
                  color: '#fff',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {`Switch to ${showLineChart ? 'BarChart' : 'LineChart'}`}
              </MuiButton>
            </Stack>
          </Toolbar>
        </AppBar>
      </Box>

      <div className="flex-grow flex items-center justify-center w-full mt-4">
        {showWebcam && <WebcamComponent grayscale={grayscale} />}
      </div>

      <div className="w-full max-w-3xl h-32 flex justify-center items-center mb-4">
        {showLineChart ? (
          <D3LineChart data={data} width={600} height={150} />
        ) : (
          <D3BarChart data={data} width={600} height={150} />
        )}
      </div>
    </div>
  );
};
