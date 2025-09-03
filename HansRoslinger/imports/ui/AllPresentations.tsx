import React, { useState, useEffect } from "react";
import Toolbar from "./components/Toolbar/Toolbar";
import Modal from "./components/Modal/Modal";
import { Meteor } from "meteor/meteor";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "../handlers/auth/authHook";
import { useAssetsWithImageCount } from "./handlers/assets/useAssets";
import {
  doesPresentationExist,
  createPresentation,
  getPresentationsByUser,
  Presentation,
} from "../api/database/presentations/presentations";
import { getDatasetsByPresentationId } from "../api/database/dataset/dataset";
import type { Dataset } from "../api/database/dataset/dataset";
import { clearAuthCookie, getUserIDCookie } from "../cookies/cookies";
import {
  createDataset,
  deleteDataset,
  ChartType,
} from "../api/database/dataset/dataset";

import {
  Alert,
  Box,
  Button,
  Grid,
  Typography,
  TextField,
  CardActionArea,
  Card,
  CardContent,
  Stack,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Select,
  MenuItem,
} from "@mui/material";
import { Asset } from "../api/database/assets/assets";

export default function AllPresentations() {
  // State for dataset summary modal
  const [showDatasetSummary, setShowDatasetSummary] = useState(false);
  const [summaryDataset, setSummaryDataset] = useState<Dataset | null>(null);
  // Show summary modal for a dataset
  function handleShowDatasetSummary(dataset: Dataset) {
    setSummaryDataset(dataset);
    setShowDatasetSummary(true);
  }

  async function handleDeleteDataset() {
    if (!summaryDataset || !summaryDataset._id) return;
    try {
      await deleteDataset(summaryDataset._id);
      setShowDatasetSummary(false);
      setSummaryDataset(null);
      // Refresh datasets for the selected presentation
      if (selectedPresentation) await loadDatasets(selectedPresentation._id!);
    } catch {
      // Optionally handle error
    }
  }

  function handleCloseDatasetSummary() {
    setShowDatasetSummary(false);
    setSummaryDataset(null);
  }
  // Navigate to Present page with dataset ID
  function handlePresentDataset(presentation: Presentation) {
    navigate(`/present?presentationId=${presentation._id}`);
  }
  useAuthGuard();
  const [showModal, setShowModal] = useState(false);
  const [presentationName, setPresentationName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [selectedPresentation, setSelectedPresentation] =
    useState<Presentation | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  // Get all assets for dropdown (only those owned by the user)
  const assets: Asset[] = useAssetsWithImageCount();

  // Dataset modal state
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [datasetCSV, setDatasetCSV] = useState("");
  const [datasetTitle, setDatasetTitle] = useState("");
  const [datasetChartType, setDatasetChartType] = useState<ChartType>(
    ChartType.BAR,
  );
  const [datasetMessage, setDatasetMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthCookie();
    navigate("/", { replace: true });
  };

  const handleHome = () => {
    navigate("/home");
  };

  const loadPresentations = async () => {
    const userId = getUserIDCookie();
    if (!userId) return;
    const result = await getPresentationsByUser(userId);
    setPresentations(result);
  };

  useEffect(() => {
    loadPresentations();
    // eslint-disable-next-line
  }, []);

  const handleCreate = async () => {
    setMessage(null);
    const userId = getUserIDCookie();
    if (!userId) {
      setMessage("User not found.");
      return;
    }
    const exists = await doesPresentationExist(userId, presentationName);
    if (exists) {
      setMessage("A presentation with that name already exists.");
      return;
    }
    await createPresentation({
      name: presentationName,
      userID: userId,
      createdAt: new Date(),
      assetID: "",
    });
    clearModel();
    loadPresentations();
  };

  function showModel() {
    setShowModal(true);
  }
  function clearModel() {
    setShowModal(false);
    setPresentationName("");
    setMessage(null);
  }

  // Loads datasets for a given presentation ID
  async function loadDatasets(presentationId: string) {
    const result = await getDatasetsByPresentationId(presentationId);
    setDatasets(result);
  }

  // Open modal and load datasets for the selected presentation
  async function openPresentationModal(presentation: Presentation) {
    setSelectedPresentation(presentation);
    // Prefer the canonical field assetID, but fall back to legacy assetId if present
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legacy = (presentation as any).assetId as string | undefined;
    setSelectedAssetId(presentation.assetID || legacy || "");
    await loadDatasets(presentation._id!);
  }

  function closePresentationModal() {
    setSelectedPresentation(null);
    setSelectedAssetId("");
  }

  // --- Dataset Modal Logic ---
  function openDatasetModal() {
    setShowDatasetModal(true);
    setDatasetCSV("");
    setDatasetTitle("");
    setDatasetChartType(ChartType.BAR);
    setDatasetMessage(null);
  }
  function closeDatasetModal() {
    setShowDatasetModal(false);
    setDatasetCSV("");
    setDatasetTitle("");
    setDatasetChartType(ChartType.BAR);
    setDatasetMessage(null);
  }

  // Update handleCreateDataset to refresh the datasets after adding a dataset
  async function handleCreateDataset() {
    setDatasetMessage(null);
    if (!selectedPresentation) {
      setDatasetMessage("No presentation selected.");
      return;
    }
    if (!datasetTitle.trim()) {
      setDatasetMessage("Please enter a dataset title.");
      return;
    }
    if (!datasetCSV.trim()) {
      setDatasetMessage("Please paste your CSV data.");
      return;
    }
    // Parse CSV: each line "label,value"
    const lines = datasetCSV
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const data = [];
    for (const line of lines) {
      const [label, value] = line.split(",");
      if (!label || value === undefined) {
        setDatasetMessage("CSV format error: each line must be 'label,value'");
        return;
      }
      const numValue = Number(value);
      if (isNaN(numValue)) {
        setDatasetMessage(`Value for ${label} is not a number.`);
        return;
      }
      data.push({ label: label.trim(), value: numValue });
    }
    try {
      await createDataset({
        title: datasetTitle,
        data,
        preferredChartType: datasetChartType,
        presentationID: selectedPresentation._id!,
      });
      setDatasetMessage("Dataset created!");
      closeDatasetModal();
      // Reload datasets for the selected presentation
      await loadDatasets(selectedPresentation._id!);
      // Optionally, reload all presentations
      loadPresentations();
    } catch {
      setDatasetMessage("Failed to create dataset.");
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #e0e7ff 0%, #f8fafc 60%, #f0fdfa 100%)",
      }}
    >
      {/* Toolbar */}
      <Toolbar
        title="Presentations"
        actions={
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={showModel}>
              Create Presentation
            </Button>
            <Button variant="contained" onClick={handleHome}>
              Home
            </Button>
            <Button variant="contained" onClick={handleLogout}>
              Logout
            </Button>
          </Stack>
        }
      />
      {/* Create Presentation Modal */}
      <Modal isOpen={showModal} onClose={clearModel} maxwidth={"550px"}>
        <Stack spacing={2}>
          <Typography variant="h5">
            Enter the name of your new presentation
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextField
              label="Presentation Name"
              value={presentationName}
              onChange={(e) => setPresentationName(e.target.value)}
            />
            {message && <Alert severity="info">{message}</Alert>}
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={!presentationName.trim()}
            >
              Create
            </Button>
          </Stack>
        </Stack>
      </Modal>
      {/* Presentation Tiles */}
      <Box
        sx={{
          width: 1,
          px: 8,
          py: 4,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            mb: 3,
            textAlign: "center",
          }}
        >
          All Presentations
        </Typography>
        <Grid container spacing={9} sx={{ width: 1 }}>
          {presentations.map((presentation) => (
            <Grid size={4} key={presentation._id}>
              <Card>
                <CardActionArea
                  key={presentation._id}
                  onClick={async () =>
                    await openPresentationModal(presentation)
                  }
                  sx={{ height: "100%", display: "flex", p: 5 }}
                >
                  <CardContent
                    sx={{
                      textAlign: "center",
                      p: 0,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      {presentation.name}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      Added:{" "}
                      {presentation.createdAt
                        ? new Date(presentation.createdAt).toLocaleDateString()
                        : ""}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* Presentation Details Modal */}
      <Modal
        isOpen={!!selectedPresentation}
        onClose={closePresentationModal}
        maxwidth={"60vw"}
      >
        {selectedPresentation && (
          <>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                {selectedPresentation.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Added:{" "}
                {selectedPresentation.createdAt
                  ? new Date(
                      selectedPresentation.createdAt,
                    ).toLocaleDateString()
                  : ""}
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="center"
            >
              <Select
                value={selectedAssetId}
                onChange={async (e) => {
                  const assetId = e.target.value;
                  setSelectedAssetId(assetId);
                  if (selectedPresentation && selectedPresentation._id) {
                    // Update the presentation's assetID (canonical field)
                    await Meteor.callAsync(
                      "presentations.update",
                      selectedPresentation._id,
                      { assetID: assetId },
                    );
                    // Update all datasets for this presentation to set assetId
                    if (datasets && datasets.length > 0) {
                      for (const dataset of datasets) {
                        if (dataset._id) {
                          await Meteor.callAsync(
                            "datasets.update",
                            dataset._id,
                            { assetId },
                          );
                        }
                      }
                    }
                  }
                }}
                displayEmpty
                sx={{ minWidth: 180 }}
                renderValue={(selected) => {
                  if (!selected) return "Select Asset";
                  const found = assets.find((a) => a._id === selected);
                  return found ? found.name : "Select Asset";
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {assets.map((asset) => (
                  <MenuItem value={asset._id} key={asset._id}>
                    {asset.name}
                  </MenuItem>
                ))}
              </Select>
              <Button variant="contained" onClick={openDatasetModal}>
                Add Dataset
              </Button>
              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePresentDataset(selectedPresentation);
                }}
              >
                Present
              </Button>
            </Stack>
            {/* DATASET TILES */}
            <Grid
              container
              spacing={2}
              sx={{
                mt: 2,
              }}
            >
              {datasets && datasets.length > 0 ? (
                datasets.map((dataset: Dataset, idx: number) => (
                  <Grid size={6} key={dataset._id || idx}>
                    <Card>
                      <CardActionArea
                        onClick={() => handleShowDatasetSummary(dataset)}
                        sx={{ p: 2 }}
                      >
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {dataset.title}
                          </Typography>
                          <Typography variant="subtitle2">
                            {dataset.preferredChartType === ChartType.BAR
                              ? "Bar chart"
                              : "Line chart"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {dataset.data ? dataset.data.length : 0} data point
                            {dataset.data && dataset.data.length !== 1
                              ? "s"
                              : ""}
                          </Typography>
                        </Box>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid size={12}>
                  <Typography variant="h5">No datasets yet.</Typography>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </Modal>
      {/* Dataset Summary Modal */}
      <Modal
        isOpen={showDatasetSummary && !!summaryDataset}
        onClose={handleCloseDatasetSummary}
        maxwidth={"50vw"}
      >
        {summaryDataset && (
          <Stack spacing={2}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                Dataset Summary
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {summaryDataset.title}
              </Typography>
              <Typography variant="subtitle2">
                {summaryDataset.preferredChartType === ChartType.BAR
                  ? "Bar chart"
                  : "Line chart"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summaryDataset.data ? summaryDataset.data.length : 0} data
                point
                {summaryDataset.data && summaryDataset.data.length !== 1
                  ? "s"
                  : ""}
              </Typography>
            </Box>
            <Typography variant="h5">
              <span className="font-bold">Sample Data:</span>
            </Typography>
            <Stack>
              {summaryDataset.data && summaryDataset.data.length > 0 ? (
                <TableContainer
                  component={Paper}
                  sx={{
                    maxHeight: "40vh",
                    overflow: "auto",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="left">Label</TableCell>
                        <TableCell align="left">Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {summaryDataset.data.slice(0, 10).map((dp, i) => (
                        <TableRow key={i}>
                          <TableCell>{dp.label}</TableCell>
                          <TableCell>{dp.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="h5">No data points.</Typography>
              )}
            </Stack>
            <Button onClick={handleDeleteDataset}>Delete</Button>
          </Stack>
        )}
      </Modal>
      {/* Add Dataset Modal */}
      <Modal
        isOpen={showDatasetModal}
        onClose={closeDatasetModal}
        maxwidth={"40vw"}
      >
        <Stack spacing={2}>
          <Typography variant="h3">Add Dataset</Typography>
          <TextField
            label="Dataset Title"
            variant="outlined"
            value={datasetTitle}
            onChange={(e) => setDatasetTitle(e.target.value)}
          />
          <Select
            value={datasetChartType}
            onChange={(e) => setDatasetChartType(e.target.value as ChartType)}
          >
            <MenuItem value={ChartType.BAR}>Bar</MenuItem>
            <MenuItem value={ChartType.LINE}>Line</MenuItem>
          </Select>
          <TextField
            label={`Paste CSV here (label,value)\nExample:\nApples,10\nBananas,20`}
            value={datasetCSV}
            onChange={(e) => setDatasetCSV(e.target.value)}
            multiline
            maxRows={6}
          />
          {datasetMessage && <Alert severity="info">{datasetMessage}</Alert>}
          <Button
            onClick={handleCreateDataset}
            disabled={!datasetTitle.trim() || !datasetCSV.trim()}
          >
            Create Dataset
          </Button>
        </Stack>
      </Modal>
    </Box>
  );
}
