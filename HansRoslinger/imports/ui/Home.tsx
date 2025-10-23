import React, { useState, useEffect } from "react";
import CreateAssetModal from "./components/Assets/CreateAssetModal";
import { useAssetsWithImageCount, createAssetWithImages, AssetWithCount } from "./handlers/assets/useAssets";
import { deleteAssetAndFiles } from "./handlers/assets/useDeleteAsset";
import { ImageCollection, ImageDoc } from "../api/database/images/images";
import { getRecentPresentationId } from "../api/database/users/users";
import { getPresentationById } from "../api/database/presentations/presentations";
import { useAuthGuard } from "../handlers/auth/authHook";
import { useNavigate } from "react-router-dom";
import { clearAuthCookie, getUserIDCookie } from "../cookies/cookies";
import { Box, Typography, Paper, Button, List, ListItemText, Collapse, ListItemButton, ListItemIcon, ListItem, IconButton, Link as MuiLink, Backdrop, CircularProgress } from "@mui/material";
import { ExpandLess, ExpandMore, Settings, ExitToApp, Collections } from "@mui/icons-material";
import * as MuiIcons from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

/**
 * Home renderer for HansRoslinger landing page
 *
 * @returns HTML
 */
export const Home: React.FC = () => {
  useAuthGuard();
  const userId = getUserIDCookie();
  const navigate = useNavigate();

  const [open, setOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const assets: AssetWithCount[] = useAssetsWithImageCount();
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [hoveredAssetId, setHoveredAssetId] = useState<string | null>(null);
  const [imagesByAsset, setImagesByAsset] = useState<Record<string, ImageDoc[]>>({});

  const [deleting, setDeleting] = useState<string | null>(null);
  const [recentPresentationId, setRecentPresentationId] = useState<string | undefined>();
  const [recentPresentationName, setRecentPresentationName] = useState<string | undefined>();

  useEffect(() => {
    if (userId) {
      getRecentPresentationId(userId).then((id) => {
        setRecentPresentationId(id);
        if (id) {
          getPresentationById(id).then((presentation) => {
            setRecentPresentationName(presentation?.name ?? "Unnamed Presentation");
          });
        }
      });
    }
  }, [userId]);

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
      const imgs = (await ImageCollection.find({ assetId }, { sort: sortSpec }).fetch()) as ImageDoc[];
      return imgs;
    };
    let imgs = await fetchSorted();
    if (imgs.some((i) => typeof i.order !== "number")) {
      await Promise.all(imgs.map((img, idx) => (typeof img.order === "number" ? Promise.resolve() : ImageCollection.updateAsync(img._id!, { $set: { order: idx } }))));
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
  const handleCreateAsset = async (data: { name: string; icon: string; files: File[] }) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Pass progress callback to createAssetWithImages
      await createAssetWithImages(data, (progress) => {
        setUploadProgress(progress);
      });

      // Quickly animate from 90% to 100% when complete
      setUploadProgress(90);
      await new Promise((res) => setTimeout(res, 100));
      setUploadProgress(95);
      await new Promise((res) => setTimeout(res, 100));
      setUploadProgress(100);
      await new Promise((res) => setTimeout(res, 300)); // Brief pause at 100%
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClick = () => {
    setOpen(!open);
  };

  const moveImage = async (assetId: string, fromIdx: number, toIdx: number) => {
    const list = imagesByAsset[assetId] || [];
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= list.length || toIdx >= list.length) return;
    const a = list[fromIdx];
    const b = list[toIdx];
    const orderA = typeof a.order === "number" ? a.order : fromIdx;
    const orderB = typeof b.order === "number" ? b.order : toIdx;
    await Promise.all([ImageCollection.updateAsync(a._id!, { $set: { order: orderB } }), ImageCollection.updateAsync(b._id!, { $set: { order: orderA } })]);
    const sortSpec: Record<string, 1 | -1> = { order: 1, fileName: 1 };
    const refreshed = (await ImageCollection.find({ assetId }, { sort: sortSpec }).fetch()) as ImageDoc[];
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
        background: "linear-gradient(135deg, #e0e7ff 0%, #f8fafc 60%, #f0fdfa 100%)",
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
          zIndex: (theme: import("@mui/material/styles").Theme) => theme.zIndex.drawer + 1000,
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
        <List sx={{ width: "100%", bgcolor: "background.paper" }} component="nav" aria-labelledby="nested-list-subheader">
          <ListItemButton onClick={handleClick}>
            <ListItemIcon>
              <MuiIcons.Folder color="primary" />
            </ListItemIcon>
            <ListItemText primary="Assets" />
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {assets.map((asset: AssetWithCount) => {
                const isExpanded = expandedAssetId === asset._id;
                const isHovered = hoveredAssetId === asset._id;
                return (
                  <React.Fragment key={asset._id}>
                    <ListItemButton
                      sx={{ pl: 4, position: "relative" }}
                      onClick={() => handleExpandAsset(asset._id!)}
                      onMouseEnter={() => setHoveredAssetId(asset._id!)}
                      onMouseLeave={() => setHoveredAssetId(null)}
                    >
                      <ListItemIcon>
                        {asset.icon && (MuiIcons as Record<string, React.ElementType>)[asset.icon] ? (
                          React.createElement((MuiIcons as Record<string, React.ElementType>)[asset.icon], { fontSize: "medium" })
                        ) : (
                          <Collections />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={asset.name} secondary={`Images: ${asset.imageCount}`} />
                      {/* Trash icon on hover */}
                      {isHovered && (
                        <Button
                          size="small"
                          color="error"
                          sx={{ minWidth: 0, position: "absolute", right: 12 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAsset(asset._id!);
                          }}
                          disabled={deleting === asset._id}
                        >
                          <span role="img" aria-label="delete">
                            🗑️
                          </span>
                        </Button>
                      )}
                    </ListItemButton>
                    {/* Show images if expanded */}
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding sx={{ pl: 8 }}>
                        {(imagesByAsset[asset._id!] || []).length === 0 && <ListItemText primary="No images in this asset." />}
                        {(imagesByAsset[asset._id!] || []).map((img: ImageDoc, idx: number) => (
                          <ListItem
                            key={img._id}
                            sx={{ pl: 1 }}
                            secondaryAction={
                              <Box>
                                <IconButton
                                  size="small"
                                  aria-label="move up"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveImage(asset._id!, idx, idx - 1);
                                  }}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveImage(asset._id!, idx, idx + 1);
                                  }}
                                  disabled={idx === (imagesByAsset[asset._id!] || []).length - 1}
                                  sx={{
                                    color: "text.secondary",
                                    "&:hover": { color: "text.primary" },
                                  }}
                                >
                                  <ArrowDownwardIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            }
                          >
                            <ListItemText primary={<MuiLink href={img.url} target="_blank" underline="hover">{`${idx + 1}. ${img.fileName}`}</MuiLink>} />
                          </ListItem>
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
        {recentPresentationId && (
          <Button
            variant="contained"
            startIcon={<MuiIcons.RocketLaunch />}
            sx={{
              width: "fit-content",
              bgcolor: "primary.main",
              color: "white",
              px: 3,
              py: 1.5,
              borderRadius: "8px",
              fontWeight: "bold",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1.5,
            }}
            onClick={() => {
              navigate(`/present?presentationId=${recentPresentationId}`);
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Quick Present
            </Typography>
            {recentPresentationName && (
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {recentPresentationName}
              </Typography>
            )}
          </Button>
        )}
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
