import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../handlers/auth/authHandlers";
import { setAuthCookie } from "../cookies/cookies";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export const Login: React.FC = () => {
  type FloatingQuote = {
    idx: number;
    x: number;
    y: number;
    speed: number;
    key: string;
  };
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // Registration modal state
  const [registerOpen, setRegisterOpen] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regMessage, setRegMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // ===== LOGIN =====
  const handleLogin = async () => {
    try {
      const result = await loginUser(username, password);
      setMessage(result.message ?? null);

      if (result.success && result.token && result.userId) {
        setAuthCookie(result.token, result.userId);
        navigate("/home");
      }
    } catch (error: unknown) {
      setMessage(
        error && typeof error === "object" && "message" in error
          ? (error as { message?: string }).message ||
              "An error occurred during login."
          : "An error occurred during login.",
      );
    }
  };

  // ===== REGISTER =====
  const handleRegister = async () => {
    if (regPassword !== regConfirmPassword) {
      setRegMessage("Passwords do not match.");
      return;
    }

    try {
      const result = await registerUser(regUsername, regPassword);
      setRegMessage(result.message ?? null);

      if (result.success && result.token && result.userId) {
        setAuthCookie(result.token, result.userId);
        setRegisterOpen(false);
        navigate("/home");
      }
    } catch (error: unknown) {
      setRegMessage(
        error && typeof error === "object" && "message" in error
          ? (error as { message?: string }).message ||
              "An error occurred during registration."
          : "An error occurred during registration.",
      );
    }
  };


  // Animated multi-quote logic
  const quotes = [
    { text: "This is the deserves at least a HD!", author: "- Adrian K" },
    { text: "Who is Hans Roslinger and why does he look like Sean Lock?", author: "- Max C"}
    { text: "Presentations are literally in the palm of my hands!", author: "- Alan T." },
    { text: "My boss thinks I'm a genius now.", author: "- Grace H." },
    { text: "So modern, so easy!", author: "- Linus T." },
    { text: "I wish I had this years ago.", author: "- Donald K." },
    { text: "The best thing since sliced bread.", author: "- Tim B.L." },
  ];

  // Floating quotes state: each quote is an object with its own animation
  const [floatingQuotes, setFloatingQuotes] = useState<FloatingQuote[]>([]);

  // Add a new floating quote every 5 seconds
  useEffect(() => {
    const addQuote = () => {
      setFloatingQuotes((prev) => [
        ...prev,
        {
          idx: Math.floor(Math.random() * quotes.length),
          x: -40,
          y: 300 + Math.random() * (window.innerHeight - 320), // avoid title area
          speed: 0.075 + Math.random() * 0.05,
          key: Math.random().toString(36).slice(2),
        },
      ]);
    };
    // Spawn one immediately
    addQuote();
    // Then every 10 seconds
    const interval = setInterval(addQuote, 10000);
    return () => clearInterval(interval);
  }, []);

  // Animate all floating quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingQuotes((prev) => {
        const updated = prev
          .map((q) => {
            const newX = q.x + q.speed;
            if (newX > 110) {
              // Remove quote when it leaves the screen
              return null;
            }
            return { ...q, x: newX };
          });
        // Only keep non-null quotes
        return updated.filter((q): q is FloatingQuote => q !== null);
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f8fafc 60%, #f0fdfa 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >

      {/* Multiple floating animated quotes */}
      {floatingQuotes.map((fq) => (
        <Box
          key={fq.key}
          sx={{
            position: "absolute",
            top: fq.y,
            left: `${fq.x}%`,
            whiteSpace: "nowrap",
            fontStyle: "italic",
            fontSize: { xs: 16, sm: 22 },
            color: "#6b7280",
            opacity: 0.85,
            pointerEvents: "none",
            transition: "left 0.03s linear",
            zIndex: 0,
          }}
        >
          {quotes[fq.idx].text} <span style={{ fontWeight: 300 }}>{quotes[fq.idx].author}</span>
        </Box>
      ))}

      {/* Title and Motto at the very top */}
  <Box width="100%" textAlign="center" pt={6} mb={2} sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="h1" fontWeight="bold" sx={{ fontSize: { xs: 40, sm: 56, md: 72 }, letterSpacing: 2, color: "#1e293b" }}>
          HansRoslinger
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: 16, sm: 22, md: 26 }, mt: 1, fontStyle: "italic" }}>
          the modern solution for the same old graph
        </Typography>
      </Box>

      {/* Centered Login Form Card */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="70vh"
        gap={3}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2, color: '#334155', fontWeight: 500, fontSize: { xs: 16, sm: 20 }, letterSpacing: 1 }}>
          Elevate your presentations. Impress your audience. Start now...
        </Typography>
        <Box
          sx={{
            background: "rgba(255,255,255,0.85)",
            borderRadius: 4,
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
            p: 4,
            minWidth: 340,
            maxWidth: "90vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography variant="h5" fontWeight="bold" sx={{ color: "#334155" }}>
            Login
          </Typography>

          <Stack spacing={2} width="300px">
            <TextField
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogin}
                sx={{ fontWeight: 600, letterSpacing: 1 }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={() => setRegisterOpen(true)}
                sx={{ fontWeight: 600, letterSpacing: 1 }}
              >
                Register
              </Button>
            </Stack>

            {message && (
              <Alert severity="error" variant="filled">
                {message}
              </Alert>
            )}
          </Stack>
        </Box>
      </Box>

      {/* REGISTER MODAL */}
      <Dialog open={registerOpen} onClose={() => setRegisterOpen(false)}>
        <DialogTitle>Register</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1} width="300px">
            <TextField
              label="Username"
              variant="outlined"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Confirm Password"
              type="password"
              variant="outlined"
              value={regConfirmPassword}
              onChange={(e) => setRegConfirmPassword(e.target.value)}
              fullWidth
            />
            {regMessage && (
              <Alert severity="error" variant="filled">
                {regMessage}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRegister}>
            Register
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
