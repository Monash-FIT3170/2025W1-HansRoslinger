import React, { useState } from "react";
import CreateAssetModal from "./components/Assets/CreateAssetModal";
import {
  useAssetsWithImageCount,
  createAssetWithImages,
  AssetWithCount,
} from "./handlers/assets/useAssets";
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
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  Settings,
  ExitToApp,
  Collections,
} from "@mui/icons-material";
import * as MuiIcons from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";

export const Home: React.FC = () => {
  useAuthGuard();
  const navigate = useNavigate();

  const [open, setOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const assets: AssetWithCount[] = useAssetsWithImageCount();
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [hoveredAssetId, setHoveredAssetId] = useState<string | null>(null);
  const [imagesByAsset, setImagesByAsset] = useState<
    Record<string, ImageDoc[]>
  >({});
  const [deleting, setDeleting] = useState<string | null>(null);

  // uploading state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleLogout = () => {
    clearAuthCookie();
    navigate("/", { replace: true });
  };

  const handleExpandAsset = async (assetId: string) => {
    if (expandedAssetId === assetId) {
      setExpandedAssetId(null);
      return;
    }
    setExpandedAssetId(assetId);
    const fetchSorted = async (): Promise<ImageDoc[]> => {
      const sortSpec: Record<string, 1 | -1> = { order: 1, fileName: 1 };
      const imgs = (await ImageCollection.find(
        { assetId },
        { sort: sortSpec },
      ).fetch()) as ImageDoc[];
      return imgs;
    };
    let imgs = await fetchSorted();
    if (imgs.some((i) => typeof i.order !== "number")) {
      await Promise.all(
        imgs.map((img, idx) =>
          typeof img.order === "number"
            ? Promise.resolve()
            : ImageCollection.updateAsync(img._id!, { $set: { order: idx } }),
        ),
      );
      imgs = await fetchSorted();
    }
    setImagesByAsset((prev) => ({ ...prev, [assetId]: imgs }));
  };

  const handleDeleteAsset = async (assetId: string) => {
    setDeleting(assetId);
    await deleteAssetAndFiles(assetId);
    setDeleting(null);
    setExpandedAssetId(null);
  };

  // now tracks progress
  const handleCreateAsset = async (data: {
    name: string;
    icon: string;
    files: File[];
  }) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      await createAssetWithImages(data, (progress: number) => {
        setUploadProgress(progress);
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const moveImage = async (assetId: string, fromIdx: number, toIdx: number) => {
    const list = imagesByAsset[assetId] || [];
    if (
      fromIdx === toIdx ||
      fromIdx < 0 ||
      toIdx < 0 ||
      fromIdx >= list.length ||
      toIdx >= list.length
    )
      return;
    const a = list[fromIdx];
    const b = list[toIdx];
    const orderA = typeof a.order === "number" ? a.order : fromIdx;
    const orderB = typeof b.order === "number" ? b.order : toIdx;
    await Promise.all([
      ImageCollection.updateAsync(a._id!, { $set: { order: orderB } }),
      ImageCollection.updateAsync(b._id!, { $set: { order: orderA } }),
    ]);
    const sortSpec: Record<string, 1 | -1> = { order: 1, fileName: 1 };
    const refreshed = (await ImageCollection.find(
      { assetId },
      { sort: sortSpec },
    ).fetch()) as ImageDoc[];
    setImagesByAsset((prev) => ({ ...prev, [assetId]: refreshed }));
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
        background:
          "linear-gradient(135deg, #e0e7ff 0%, #f8fafc 60%, #f0fdfa 100%)",
      }}
    >
      <Typography variant="h4" fontWeight="bold" color="text.primary">
        Home
      </Typography>

      {/* Upload overlay */}
      <Backdrop
        open={uploading}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1000,
          flexDirection: "column",
        }}
      >
        <CircularProgress size={80} thickness={5} color="inherit" />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Uploading... {uploadProgress}%
        </Typography>
      </Backdrop>

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
        {/* assets list unchanged */}
        ...
      </Paper>

      <Box sx={{ display: "flex", gap: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          disabled={uploading} // disable while uploading
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
        <CreateAssetModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreateAsset}
        />
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
