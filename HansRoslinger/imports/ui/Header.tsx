import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface HeaderProps {
  grayscale: boolean;
  onToggleGrayscale: () => void;
  showLineChart: boolean;
  onToggleChart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  grayscale,
  onToggleGrayscale,
  showLineChart,
  onToggleChart,
}) => {
  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '56px',
        bgcolor: '#1E1E1E',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        py: 2,
        zIndex: 1200,
      }}
    >
      {/* Toggle grayscale button */}
      <Button
        onClick={onToggleGrayscale}
        variant="contained"
        sx={{
          mb: 2,
          p: 1,
          minWidth: 0,
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          bgcolor: '#00D1FF',
          color: '#000',
          '&:hover': { bgcolor: '#00B4CC' },
        }}
      >
        GS
      </Button>

      {/* Toggle chart type button */}
      <Button
        onClick={onToggleChart}
        variant="contained"
        sx={{
          p: 1,
          minWidth: 0,
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          bgcolor: '#00D1FF',
          color: '#000',
          '&:hover': { bgcolor: '#00B4CC' },
        }}
      >
        {showLineChart ? 'Bar' : 'Line'}
      </Button>
    </Box>
  );
};
