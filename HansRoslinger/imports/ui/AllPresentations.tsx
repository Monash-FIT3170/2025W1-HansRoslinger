import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "../handlers/auth/authHook";
import {
  doesPresentationExist,
  createPresentation,
  getPresentationsByUser,
  Presentation,
} from "../api/database/presentations/presentations";
import { clearAuthCookie, getUserIDCookie } from "../cookies/cookies";

export const AllPresentations: React.FC = () => {
  useAuthGuard();
  const [showModal, setShowModal] = useState(false);
  const [presentationName, setPresentationName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
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

  return (
    <div className="flex flex-col h-screen">
      {/* Toolbar */}
      <div className="w-full bg-cyan-500 p-4 flex items-center shadow relative">
        <h2 className="text-white text-2xl font-bold flex-1">Presentations</h2>
        <div className="flex space-x-4">
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
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-8 relative w-96">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={clearModel}
              aria-label="Close"
            >
              ×
            </button>
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
          </div>
        </div>
      )}
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 w-full">
        <h1 className="text-3xl font-bold mb-8">All Presentations</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl px-4">
          {presentations.map((presentation) => (
            <div
              key={presentation._id}
              className="bg-cyan-100 border border-cyan-300 rounded-lg shadow-md p-6 flex flex-col items-center justify-center"
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
    </div>
  );
};

