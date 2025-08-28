import React from "react";
import { Box, IconButton } from "@mui/material";

export default function Modal({
  isOpen,
  onClose,
  children, 
  maxwidth
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxwidth: string;
}) {
  if (!isOpen) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        boxShadow: 24,
        padding: 4,
        borderRadius: 2,
        zIndex: 1300,
        width: "100%",
        maxWidth: maxwidth,
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
        }}
      >
        ×
      </IconButton>
      {children}
    </Box>
  );
}
