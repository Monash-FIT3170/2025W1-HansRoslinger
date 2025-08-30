import React, { useState } from "react";
import { Box, List, ListItem, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import * as MuiIconsRaw from "@mui/icons-material";
const MuiIcons: Record<string, React.ElementType> = MuiIconsRaw as Record<string, React.ElementType>;
import DeleteIcon from '@mui/icons-material/Delete';
import AssetFilesModal from './AssetFilesModal';
import { useTracker } from 'meteor/react-meteor-data';
import { ImageCollection, ImageDoc } from '../../../api/database/images/images';
import { deleteAssetAndFiles } from '../../handlers/assets/useDeleteAsset';

export interface AssetListItem {
  _id: string;
  name: string;
  icon: string;
  imageCount: number;
}

export default function AssetList({ assets }: { assets: AssetListItem[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFiles, setModalFiles] = useState<{ fileName: string; url: string }[]>([]);
  const [modalAssetName, setModalAssetName] = useState('');
  // Get all images once, filter as needed
  const allImages = useTracker(() => ImageCollection.find({}).fetch(), []);

  const handleDelete = async (assetId: string) => {
    if (window.confirm('Delete this asset and all its files?')) {
      await deleteAssetAndFiles(assetId);
    }
  };

  const handleOpenModal = (asset: AssetListItem) => {
    const files = allImages.filter((img: ImageDoc) => img.assetId === asset._id).map((img: ImageDoc) => ({ fileName: img.fileName, url: img.url }));
    setModalFiles(files);
    setModalAssetName(asset.name);
    setModalOpen(true);
  };

  return (
    <Box>
      <List>
        {assets.map(asset => (
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
            <ListItemIcon>
              {MuiIcons[asset.icon] ? React.createElement(MuiIcons[asset.icon]) : null}
            </ListItemIcon>
            <ListItemText
              primary={asset.name}
              secondary={`${asset.imageCount} file(s)`}
              onClick={() => handleOpenModal(asset)}
              sx={{ cursor: 'pointer' }}
            />
          </ListItem>
        ))}
      </List>
      <AssetFilesModal isOpen={modalOpen} onClose={() => setModalOpen(false)} files={modalFiles} assetName={modalAssetName} />
    </Box>
  );
}
