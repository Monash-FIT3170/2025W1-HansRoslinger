import React, { useState } from "react";
import { Box, Button, TextField, Typography, MenuItem, IconButton } from "@mui/material";
import { useDropzone } from "react-dropzone";
import * as MuiIcons from "@mui/icons-material";
import Modal from "../Modal/Modal";

const ICONS = ["InsertChart", "Timeline", "PieChart", "Collections", "Settings"];

export interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; icon: string; files: File[] }) => void;
}

export default function CreateAssetModal({ isOpen, onClose, onCreate }: CreateAssetModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    console.log("Files dropped/selected:", acceptedFiles);
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"],
      "application/pdf": [".pdf"],
    },
    multiple: true,
  });

  const handleCreate = () => {
    if (name && files.length > 0) {
      onCreate({ name, icon, files });
      setName("");
      setFiles([]);
      setIcon(ICONS[0]);
      onClose();
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxwidth="500px">
      <Typography variant="h6" mb={2}>
        Create Collection
      </Typography>
      <TextField label="Collection Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin="normal" />
      <TextField select label="Icon" value={icon} onChange={(e) => setIcon(e.target.value)} fullWidth margin="normal">
        {ICONS.map((iconName) => (
          <MenuItem key={iconName} value={iconName}>
            {React.createElement((MuiIcons as any)[iconName])}
          </MenuItem>
        ))}
      </TextField>

      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed #aaa",
          p: 2,
          textAlign: "center",
          my: 2,
          cursor: "pointer",
          backgroundColor: isDragActive ? "#f0f0f0" : "transparent",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography>Drop the files here ...</Typography>
        ) : (
          <Typography>{files.length === 0 ? "Drag & drop images or PDFs here, or click to select" : `${files.length} file(s) selected`}</Typography>
        )}
      </Box>

      {files.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Files:
          </Typography>
          {files.map((file, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1,
                border: "1px solid #eee",
                borderRadius: 1,
                mb: 1,
                backgroundColor: "#f9f9f9",
              }}
            >
              <Typography variant="body2">{file.name}</Typography>
              <IconButton size="small" onClick={() => removeFile(index)} sx={{ ml: 1 }}>
                <MuiIcons.Delete />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      <Button variant="contained" color="primary" onClick={handleCreate} disabled={!name || files.length === 0} fullWidth>
        Create
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        Supported files: Images (JPEG, PNG, GIF, BMP, WebP) and PDF documents
      </Typography>
    </Modal>
  );
}
