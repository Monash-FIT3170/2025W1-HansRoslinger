import React, { useState } from "react";
import { Box, List, ListItem, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import * as MuiIconsRaw from "@mui/icons-material";
const MuiIcons: Record<string, React.ElementType> = MuiIconsRaw as Record<string, React.ElementType>;
import DeleteIcon from "@mui/icons-material/Delete";
import AssetFilesModal from "./AssetFilesModal";
import AssetReorderModal from "./AssetReorderModal";
import { deleteAssetAndFiles } from "../../handlers/assets/useDeleteAsset";

export interface AssetListItem {
  _id: string;
  name: string;
  icon: string;
  imageCount: number;
}

/**
 * Component to render a list of assets.
 * 
 * @param assets
 * @returns HTML
 */
export default function AssetList({ assets }: { assets: AssetListItem[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAssetName, setModalAssetName] = useState("");
  const [modalAssetId, setModalAssetId] = useState("");
  const [reorderOpen, setReorderOpen] = useState(false);
  const [reorderAssetId, setReorderAssetId] = useState<string>("");
  const [reorderAssetName, setReorderAssetName] = useState<string>("");

  // Handle asset deletioon
  const handleDelete = async (assetId: string) => {
    if (window.confirm("Delete this asset and all its files?")) {
      await deleteAssetAndFiles(assetId);
    }
  };

  // Modal handler
  const handleOpenModal = (asset: AssetListItem) => {
    setModalAssetId(asset._id);
    setModalAssetName(asset.name);
    setModalOpen(true);
  };

  return (
    <Box>
      <List>
        {assets.map((asset) => (
          <ListItem
            key={asset._id}
            onMouseEnter={() => setHovered(asset._id)}
            onMouseLeave={() => setHovered(null)}
            secondaryAction={
              hovered === asset._id && (
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(asset._id)}>
                  <DeleteIcon />
                </IconButton>
              )
            }
          >
            <ListItemIcon>{MuiIcons[asset.icon] ? React.createElement(MuiIcons[asset.icon]) : null}</ListItemIcon>
            <ListItemText primary={asset.name} secondary={`${asset.imageCount} file(s)`} onClick={() => handleOpenModal(asset)} sx={{ cursor: "pointer" }} />
            <IconButton
              edge="end"
              aria-label="reorder"
              onClick={() => {
                setReorderAssetId(asset._id);
                setReorderAssetName(asset.name);
                setReorderOpen(true);
              }}
              sx={{ ml: 1 }}
            >
              <MuiIcons.Reorder />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <AssetFilesModal isOpen={modalOpen} onClose={() => setModalOpen(false)} assetId={modalAssetId} assetName={modalAssetName} />
      <AssetReorderModal isOpen={reorderOpen} onClose={() => setReorderOpen(false)} assetId={reorderAssetId} assetName={reorderAssetName} />
    </Box>
  );
}
