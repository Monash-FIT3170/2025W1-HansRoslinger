import React, { useState, useEffect } from "react";
import Toolbar from "./components/Toolbar/Toolbar";
import Modal from "./components/Modal/Modal";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "../handlers/auth/authHook";
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

import { Alert, Box, Button, Grid, Typography, TextField, CardActionArea, Card, CardContent, Stack, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Select, MenuItem, Container } from "@mui/material";
import { AssetCollection, Asset } from "../api/database/assets/assets";
import { useTracker } from 'meteor/react-meteor-data';

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
  // Get all assets for dropdown
  const assets: Asset[] = useTracker(() => AssetCollection.find({}).fetch(), []);

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
    setSelectedAssetId(presentation.assetId || "");
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
        backgroundColor: "#F5F5F5",
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
              alignItems: "center", // vertical alignment within the row
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
          p: 2,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            p: 2,
            textAlign: "center",
          }}
        >
          All Presentations
        </Typography>
        <Grid
          container
          spacing={3}
          sx={{
            width: 1,
            gap: 2,
          }}
        >
          {presentations.map((presentation) => (
            <Grid size={4}>
              <Card>
                <CardActionArea
                  key={presentation._id}
                  onClick={async () =>
                    await openPresentationModal(presentation)
                  }
                >
                  <CardContent>
                    <Typography variant="h5">{presentation.name}</Typography>
                    <Typography variant="h6">
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2, // optional margin below
              }}
            >
              <Typography variant="h2">
                {selectedPresentation.name}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Select
                  value={selectedAssetId}
                  onChange={async (e) => {
                    const assetId = e.target.value;
                    setSelectedAssetId(assetId);
                    if (selectedPresentation && selectedPresentation._id) {
                      await Meteor.callAsync('presentations.update', selectedPresentation._id, { assetId });
                    }
                  }}
                  displayEmpty
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="">None</MenuItem>
                  {assets.map((asset) => (
                    <MenuItem value={asset._id} key={asset._id}>
                      {asset.name} ({asset._id})
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
            </Box>
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
                  <Grid size={6}>
                    <Card key={dataset._id || idx}>
                      <CardActionArea
                        key={dataset._id || idx}
                        onClick={() => handleShowDatasetSummary(dataset)}
                        sx={{
                          p: 2,
                        }}
                      >
                        <Typography variant="h5">{dataset.title}</Typography>
                        <Typography variant="h6">
                          {dataset.data ? dataset.data.length : 0} data point
                          {dataset.data && dataset.data.length !== 1 ? "s" : ""}
                        </Typography>
                        <Typography variant="h6">
                          Chart: {dataset.preferredChartType}
                        </Typography>
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
            <Typography variant="h4">Dataset Summary</Typography>
            <Typography variant="h5">
              <span className="font-bold">Title:</span> {summaryDataset.title}
            </Typography>
            <Typography variant="h5">
              <span className="font-bold">Chart Type:</span>{" "}
              {summaryDataset.preferredChartType}
            </Typography>
            <Typography variant="h5">
              <span className="font-bold">Number of Data Points:</span>{" "}
              {summaryDataset.data ? summaryDataset.data.length : 0}
            </Typography>
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
