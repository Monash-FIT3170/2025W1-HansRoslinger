import React, { useEffect } from "react";
import { Box, Typography, List, ListItem, ListItemText, IconButton, Link } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useTracker } from "meteor/react-meteor-data";
import { ImageCollection, ImageDoc } from "../../../api/database/images/images";

export interface AssetFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  assetName: string;
}

/**
 * Modal for displaying file assets that can be uploaded
 *
 * @param isOpen
 * @param onClose
 * @param assetId
 * @param assetName
 * @returns HTML
 */
export default function AssetFilesModal({ isOpen, onClose, assetId, assetName }: AssetFilesModalProps) {
  if (!isOpen) return null;

  const images = useTracker(() => {
    if (!assetId) return [] as ImageDoc[];
    return ImageCollection.find({ assetId }, { sort: { order: 1, fileName: 1 } }).fetch() as ImageDoc[];
  }, [assetId]);

  // Ensure legacy items get an order assigned (first time modal opens)
  useEffect(() => {
    (async () => {
      const needsOrder = images.some((img: ImageDoc) => typeof img.order !== "number");
      if (!needsOrder) return;
      await Promise.all(
        images.map((img: ImageDoc, idx: number) => {
          if (typeof img.order === "number") return Promise.resolve();
          return ImageCollection.updateAsync(img._id!, {
            $set: { order: idx },
          });
        }),
      );
    })();
  }, [images.map((i: ImageDoc) => `${i._id}:${i.order ?? "x"}`).join("|")]);

  const move = async (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= images.length || to >= images.length) return;
    const a = images[from];
    const b = images[to];
    const orderA = typeof a.order === "number" ? a.order : from;
    const orderB = typeof b.order === "number" ? b.order : to;
    // Swap orders
    await Promise.all([ImageCollection.updateAsync(a._id!, { $set: { order: orderB } }), ImageCollection.updateAsync(b._id!, { $set: { order: orderA } })]);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "white",
        p: 4,
        borderRadius: 2,
        boxShadow: 24,
        zIndex: 1300,
        minWidth: 350,
      }}
    >
      <Typography variant="h6" mb={2}>
        {assetName} Files
      </Typography>
      <List>
        {images.map((img: ImageDoc, idx: number) => (
          <ListItem key={img._id}>
            <Box display="flex" alignItems="center" gap={0.5} mr={1}>
              <IconButton
                size="small"
                aria-label="move up"
                onClick={() => move(idx, idx - 1)}
                disabled={idx === 0}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "text.primary" },
                }}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="move down"
                onClick={() => move(idx, idx + 1)}
                disabled={idx === images.length - 1}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "text.primary" },
                }}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </Box>
            <Link href={img.url} target="_blank" underline="hover" sx={{ flexGrow: 1 }}>
              <ListItemText primary={`${idx + 1}. ${img.fileName}`} />
            </Link>
          </ListItem>
        ))}
      </List>
      <Box mt={2} textAlign="right">
        <button onClick={onClose}>Close</button>
      </Box>
    </Box>
  );
}
