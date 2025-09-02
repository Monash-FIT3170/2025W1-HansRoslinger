import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  IconButton,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import * as MuiIcons from "@mui/icons-material";
import Modal from "../Modal/Modal";

const ICONS = [
  "InsertChart",
  "Timeline",
  "PieChart",
  "Collections",
  "Settings",
];

export interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; icon: string; files: File[] }) => void;
}

export default function CreateAssetModal({
  isOpen,
  onClose,
  onCreate,
}: CreateAssetModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxwidth="500px">
      <Typography variant="h6" mb={2}>
        Create Collection
      </Typography>
      <TextField
        label="Collection Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        select
        label="Icon"
        value={icon}
        onChange={(e) => setIcon(e.target.value)}
        fullWidth
        margin="normal"
      >
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
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography>Drop the images here ...</Typography>
        ) : (
          <Typography>
            {files.length === 0
              ? "Drag & drop images here, or click to select"
              : `${files.length} image(s) selected`}
          </Typography>
        )}
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreate}
        disabled={!name || files.length === 0}
        fullWidth
      >
        Create
      </Button>
    </Modal>
  );
}
