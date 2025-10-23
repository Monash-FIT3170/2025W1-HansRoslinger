import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import { cyan } from "@mui/material/colors"; // Import cyan color scale

interface ToolbarProps {
  title: string;
  actions: React.ReactNode;
  className?: string;
}

/**
 * Toolbar at the top of the page
 * @param title
 * @param actions
 * @param className
 * @return HTML
 */
const Toolbar: React.FC<ToolbarProps> = ({ title, actions, className }) => (
  <Box
    className={className}
    sx={{
      width: "100%",
      backgroundColor: cyan[500],
      p: 2,
      display: "flex",
      alignItems: "center",
      boxShadow: 3,
      position: "relative",
    }}
  >
    <Typography
      variant="h5"
      sx={{
        color: "white",
        fontWeight: "bold",
        flex: 1,
      }}
    >
      {title}
    </Typography>

    <Stack direction="row" spacing={2}>
      {actions}
    </Stack>
  </Box>
);

export default Toolbar;
