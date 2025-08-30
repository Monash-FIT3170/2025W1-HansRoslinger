import React, { useState } from "react";
import CreateAssetModal from "./components/Assets/CreateAssetModal";
import AssetList from "./components/Assets/AssetList";
import { useAssetsWithImageCount, createAssetWithImages } from "./handlers/assets/useAssets";
import { deleteAssetAndFiles } from "./handlers/assets/useDeleteAsset";
import { ImageCollection, ImageDoc } from "../api/database/images/images";
import { useAuthGuard } from "../handlers/auth/authHook";
import { useNavigate } from "react-router-dom";
import { clearAuthCookie } from "../cookies/cookies";
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItemText,
  Collapse,
  ListItemButton,
  ListItemIcon,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Settings,
  ExitToApp,
  Collections,
} from "@mui/icons-material";
import * as MuiIcons from "@mui/icons-material";
import Folder from "@mui/icons-material/Folder";
import AddIcon from '@mui/icons-material/Add';

export const Home: React.FC = () => {
  useAuthGuard();
  const navigate = useNavigate();

  const [open, setOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const assets = useAssetsWithImageCount();
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [hoveredAssetId, setHoveredAssetId] = useState<string | null>(null);
  const [imagesByAsset, setImagesByAsset] = useState<Record<string, ImageDoc[]>>({});
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    clearAuthCookie();
    navigate("/", { replace: true });
  };

  // projectItems replaced by assets from useAssetsWithImageCount

  const handleExpandAsset = async (assetId: string) => {
    if (expandedAssetId === assetId) {
      setExpandedAssetId(null);
      return;
    }
    setExpandedAssetId(assetId);
    // Fetch images for this asset if not already loaded
    if (!imagesByAsset[assetId]) {
      const imgs = await ImageCollection.find({ assetId }).fetch();
      setImagesByAsset((prev) => ({ ...prev, [assetId]: imgs }));
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    setDeleting(assetId);
    await deleteAssetAndFiles(assetId);
    setDeleting(null);
    setExpandedAssetId(null);
  };

  const handleCreateAsset = async (data: { name: string; icon: string; files: File[] }) => {
    await createAssetWithImages(data);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
        p: 4,
        gap: 4,
        backgroundColor: "#F5F5F5",
      }}
    >
      <Typography variant="h4" fontWeight="bold" color="text.primary">
        Home
      </Typography>

      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: "90%",
          maxWidth: "1400px",
          height: "550px",
          overflow: "auto",
          backgroundColor: "#FAFAFA",
        }}
      >
        <List
          sx={{ width: "100%", bgcolor: "background.paper" }}
          component="nav"
          aria-labelledby="nested-list-subheader"
        >
          <ListItemButton onClick={handleClick}>
            <ListItemIcon>
              <Folder color="primary" />
            </ListItemIcon>
            <ListItemText primary="Assets" />
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {assets.map((asset: any) => {
                const isExpanded = expandedAssetId === asset._id;
                const isHovered = hoveredAssetId === asset._id;
                return (
                  <React.Fragment key={asset._id}>
                    <ListItemButton
                      sx={{ pl: 4, position: 'relative' }}
                      onClick={() => handleExpandAsset(asset._id)}
                      onMouseEnter={() => setHoveredAssetId(asset._id)}
                      onMouseLeave={() => setHoveredAssetId(null)}
                    >
                      <ListItemIcon>
                        {asset.icon && MuiIcons[asset.icon]
                          ? React.createElement((MuiIcons as any)[asset.icon], { fontSize: 'medium' })
                          : <Collections />}
                      </ListItemIcon>
                      <ListItemText
                        primary={asset.name}
                        secondary={`Images: ${asset.imageCount}`}
                      />
                      {/* Trash icon on hover */}
                      {isHovered && (
                        <Button
                          size="small"
                          color="error"
                          sx={{ minWidth: 0, position: 'absolute', right: 12 }}
                          onClick={e => { e.stopPropagation(); handleDeleteAsset(asset._id); }}
                          disabled={deleting === asset._id}
                        >
                          <span role="img" aria-label="delete">🗑️</span>
                        </Button>
                      )}
                    </ListItemButton>
                    {/* Show images if expanded */}
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding sx={{ pl: 8 }}>
                        {(imagesByAsset[asset._id] || []).length === 0 && (
                          <ListItemText primary="No images in this asset." />
                        )}
                        {(imagesByAsset[asset._id] || []).map((img) => (
                          <ListItemButton
                            key={img._id}
                            component="a"
                            href={img.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ pl: 2 }}
                          >
                            <ListItemText primary={img.fileName} />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  </React.Fragment>
                );
              })}
            </List>
          </Collapse>
        </List>
      </Paper>

      <Box sx={{ display: "flex", gap: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            px: 4,
            py: 1.5,
            borderRadius: "8px",
            fontWeight: "bold",
          }}
          onClick={() => setModalOpen(true)}
        >
          Import Assets
        </Button>
        <CreateAssetModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreateAsset} />
        <Button
          variant="contained"
          startIcon={<Collections />}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            px: 4,
            py: 1.5,
            borderRadius: "8px",
            fontWeight: "bold",
          }}
          onClick={() => navigate("/allpresentations")}
        >
          Presentations
        </Button>
        <Button
          variant="contained"
          startIcon={<Settings />}
          sx={{
            bgcolor: "secondary.main",
            color: "white",
            px: 4,
            py: 1.5,
            borderRadius: "8px",
            fontWeight: "bold",
          }}
          onClick={() => navigate("/settings")}
        >
          Settings
        </Button>
        <Button
          variant="contained"
          startIcon={<ExitToApp />}
          sx={{
            bgcolor: "error.main",
            color: "white",
            px: 4,
            py: 1.5,
            borderRadius: "8px",
            fontWeight: "bold",
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};
