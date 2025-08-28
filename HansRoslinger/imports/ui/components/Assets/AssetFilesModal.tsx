import React from "react";
import { Box, Typography, List, ListItemButton, ListItemText, Link } from "@mui/material";

export interface AssetFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: { fileName: string; url: string }[];
  assetName: string;
}

export default function AssetFilesModal({ isOpen, onClose, files, assetName }: AssetFilesModalProps) {
  if (!isOpen) return null;
  return (
    <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 24, zIndex: 1300, minWidth: 350 }}>
      <Typography variant="h6" mb={2}>{assetName} Files</Typography>
      <List>
        {files.map(f => (
          <ListItemButton key={f.url} component={Link} href={f.url} target="_blank">
            <ListItemText primary={f.fileName} />
          </ListItemButton>
        ))}
      </List>
      <Box mt={2} textAlign="right">
        <button onClick={onClose}>Close</button>
      </Box>
    </Box>
  );
}
