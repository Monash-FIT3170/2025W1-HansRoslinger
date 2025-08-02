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
  ChartType,
} from "../api/database/dataset/dataset";

export default function AllPresentations() {
    // State for dataset summary modal
    const [showDatasetSummary, setShowDatasetSummary] = useState(false);
    const [summaryDataset, setSummaryDataset] = useState<Dataset | null>(null);
    // Show summary modal for a dataset
    function handleShowDatasetSummary(dataset: Dataset) {
      setSummaryDataset(dataset);
      setShowDatasetSummary(true);
    }

    function handleCloseDatasetSummary() {
      setShowDatasetSummary(false);
      setSummaryDataset(null);
    }

    // Navigate to Present page with dataset ID
    function handlePresentDataset(dataset: Dataset) {
      navigate(`/present?datasetId=${dataset._id}`);
    }
    useAuthGuard();
    const [showModal, setShowModal] = useState(false);
    const [presentationName, setPresentationName] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [presentations, setPresentations] = useState<Presentation[]>([]);
    const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);
    const [datasets, setDatasets] = useState<Dataset[]>([]);

    // Dataset modal state
    const [showDatasetModal, setShowDatasetModal] = useState(false);
    const [datasetCSV, setDatasetCSV] = useState("");
    const [datasetTitle, setDatasetTitle] = useState("");
    const [datasetChartType, setDatasetChartType] = useState<ChartType>(ChartType.BAR);
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
        datasets: [],
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
      await loadDatasets(presentation._id!);
    }

    function closePresentationModal() {
      setSelectedPresentation(null);
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
      <div className="flex flex-col h-screen">
        {/* Toolbar */}
        <Toolbar
          title="Presentations"
          actions={
            <>
              <button
                className="bg-white text-cyan-700 font-semibold px-4 py-2 rounded shadow hover:bg-cyan-100 transition-colors"
                onClick={showModel}
              >
                Create Presentation
              </button>
              <button
                className="bg-cyan-700 text-white font-semibold px-4 py-2 rounded shadow hover:bg-cyan-800 transition-colors"
                onClick={handleHome}
              >
                Home
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          }
        />
        {/* Create Presentation Modal */}
        <Modal isOpen={showModal} onClose={clearModel} widthClass="w-96">
          <h3 className="text-xl font-semibold mb-4">
            Enter the name of your new presentation
          </h3>
          <input
            className="border p-2 w-full mb-4"
            placeholder="Presentation Name"
            value={presentationName}
            onChange={(e) => setPresentationName(e.target.value)}
          />
          {message && (
            <div className="text-red-500 mb-2 text-center">{message}</div>
          )}
          <button
            className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600 transition-colors w-full"
            onClick={handleCreate}
            disabled={!presentationName.trim()}
          >
            Create
          </button>
        </Modal>
        {/* Presentation Tiles */}
        <div className="flex flex-col items-center justify-center flex-1 w-full">
          <h1 className="text-3xl font-bold mb-8">All Presentations</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl px-4">
            {presentations.map((presentation) => (
              <div
                key={presentation._id}
                className="cursor-pointer bg-cyan-100 border border-cyan-300 rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:bg-cyan-200 transition-colors"
                onClick={async () => await openPresentationModal(presentation)}
              >
                <div className="text-xl font-semibold mb-2 text-center text-cyan-900">
                  {presentation.name}
                </div>
                <div className="text-gray-600 text-sm text-center">
                  Added:{" "}
                  {presentation.createdAt
                    ? new Date(presentation.createdAt).toLocaleDateString()
                    : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Presentation Details Modal */}
        <Modal isOpen={!!selectedPresentation} onClose={closePresentationModal} widthClass="w-[60rem] max-w-full">
          {selectedPresentation && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{selectedPresentation.name}</h2>
                <button
                  className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600 transition-colors"
                  onClick={openDatasetModal}
                >
                  Add Dataset
                </button>
              </div>
              {/* DATASET TILES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {datasets && datasets.length > 0 ? (
                  datasets.map((dataset: Dataset, idx: number) => (
                    <div
                      key={dataset._id || idx}
                      className="bg-cyan-50 border border-cyan-200 rounded-lg shadow p-4 flex flex-col items-center cursor-pointer hover:bg-cyan-100 transition-colors"
                      onClick={() => handleShowDatasetSummary(dataset)}
                    >
                      <div className="text-lg font-semibold mb-1 text-cyan-900 text-center w-full">{dataset.title}</div>
                      <div className="text-gray-600 text-sm mb-1">
                        {dataset.data ? dataset.data.length : 0} data point{dataset.data && dataset.data.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-gray-700 text-xs mb-2">
                        Chart: {dataset.preferredChartType}
                      </div>
                      <button
                        className="mt-2 bg-cyan-500 text-white px-3 py-1 rounded hover:bg-cyan-600 transition-colors"
                        onClick={e => { e.stopPropagation(); handlePresentDataset(dataset); }}
                      >
                        Present
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center text-gray-500">No datasets yet.</div>
                )}
              </div>
            </>
          )}
        </Modal>
        {/* Dataset Summary Modal */}
        <Modal isOpen={showDatasetSummary && !!summaryDataset} onClose={handleCloseDatasetSummary} widthClass="w-[28rem] max-w-full">
          {summaryDataset && (
            <>
              <h3 className="text-xl font-semibold mb-4">Dataset Summary</h3>
              <div className="mb-2"><span className="font-bold">Title:</span> {summaryDataset.title}</div>
              <div className="mb-2"><span className="font-bold">Chart Type:</span> {summaryDataset.preferredChartType}</div>
              <div className="mb-2"><span className="font-bold">Number of Data Points:</span> {summaryDataset.data ? summaryDataset.data.length : 0}</div>
              <div className="mb-2"><span className="font-bold">Sample Data:</span></div>
              <div className="bg-gray-100 rounded p-2 text-xs max-h-40 overflow-auto mb-4">
                {summaryDataset.data && summaryDataset.data.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left pr-2">Label</th>
                        <th className="text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryDataset.data.slice(0, 10).map((dp, i) => (
                        <tr key={i}>
                          <td className="pr-2">{dp.label}</td>
                          <td>{dp.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div>No data points.</div>
                )}
              </div>
              <button
                className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600 transition-colors w-full"
                onClick={() => { handlePresentDataset(summaryDataset); }}
              >
                Present This Dataset
              </button>
            </>
          )}
        </Modal>
        {/* Add Dataset Modal */}
        <Modal isOpen={showDatasetModal} onClose={closeDatasetModal} widthClass="w-[32rem] max-w-full">
          <h3 className="text-xl font-semibold mb-4">Add Dataset</h3>
          <input
            className="border p-2 w-full mb-4"
            placeholder="Dataset Title"
            value={datasetTitle}
            onChange={(e) => setDatasetTitle(e.target.value)}
          />
          <select
            className="border p-2 w-full mb-4"
            value={datasetChartType}
            onChange={(e) => setDatasetChartType(e.target.value as ChartType)}
          >
            <option value={ChartType.BAR}>Bar</option>
            <option value={ChartType.LINE}>Line</option>
          </select>
          <textarea
            className="border p-2 w-full mb-4"
            placeholder={`Paste CSV here (label,value)\nExample:\nApples,10\nBananas,20`}
            value={datasetCSV}
            onChange={(e) => setDatasetCSV(e.target.value)}
            rows={6}
          />
          {datasetMessage && (
            <div className="text-red-500 mb-2 text-center">{datasetMessage}</div>
          )}
          <button
            className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600 transition-colors w-full"
            onClick={handleCreateDataset}
            disabled={!datasetTitle.trim() || !datasetCSV.trim()}
          >
            Create Dataset
          </button>
        </Modal>
      </div>
    );
  }

