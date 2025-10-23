import React, { useMemo, useState } from "react";
import { Box, Typography, IconButton, Button, List, ListItem, ListItemText } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { ImageCollection, ImageDoc } from "../../../api/database/images/images";
import { useTracker } from "meteor/react-meteor-data";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  assetName: string;
}

/**
 * Modal component for reordering assets.
 *
 * @param isOpen
 * @param onClose
 * @param assetId
 * @param assetName
 * @returns HTML
 */
export default function AssetReorderModal({ isOpen, onClose, assetId, assetName }: Props) {
  const images = useTracker(() => ImageCollection.find({ assetId }, { sort: { order: 1, fileName: 1 } }).fetch(), [assetId]) as ImageDoc[];
  const [localOrder, setLocalOrder] = useState<string[]>([]);

  React.useEffect(() => {
    setLocalOrder(images.map((i) => i._id!));
  }, [images.map((i) => i._id).join("|")]);

  const idToImage = useMemo(() => new Map<string, ImageDoc>(images.map((i) => [i._id!, i])), [images.map((i) => i._id).join("|")]);

  if (!isOpen) return null;

  const move = (from: number, to: number) => {
    setLocalOrder((prev) => {
      const next = prev.slice();
      const [spliced] = next.splice(from, 1);
      next.splice(to, 0, spliced);
      return next;
    });
  };

  const save = async () => {
    // Persist new order: index in localOrder becomes the `order` field
    await Promise.all(localOrder.map((id, idx) => ImageCollection.updateAsync(id, { $set: { order: idx } })));
    onClose();
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "white",
        p: 3,
        borderRadius: 2,
        boxShadow: 24,
        zIndex: 1300,
        minWidth: 420,
        maxHeight: "70vh",
        overflowY: "auto",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Reorder images for {assetName}
      </Typography>
      <List>
        {localOrder.map((id, idx) => {
          const img = idToImage.get(id)!;
          return (
            <ListItem
              key={id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", String(idx));
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
                if (!Number.isNaN(from) && from !== idx) move(from, idx);
              }}
              secondaryAction={
                <Box>
                  <IconButton
                    aria-label="up"
                    onClick={() => idx > 0 && move(idx, idx - 1)}
                    sx={{
                      color: "text.secondary",
                      "&:hover": { color: "text.primary" },
                    }}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="down"
                    onClick={() => idx < localOrder.length - 1 && move(idx, idx + 1)}
                    sx={{
                      color: "text.secondary",
                      "&:hover": { color: "text.primary" },
                    }}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
              sx={{ cursor: "grab" }}
            >
              <ListItemText primary={`${idx + 1}. ${img.fileName}`} secondary={img.url} />
            </ListItem>
          );
        })}
      </List>
      <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={save}>
          Save
        </Button>
      </Box>
    </Box>
  );
}
