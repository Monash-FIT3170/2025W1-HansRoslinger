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
  type FloatingQuote = { idx: number; x: number; y: number; speed: number; key: string };
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regMessage, setRegMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await loginUser(username, password);
      setMessage(result.message ?? null);
      if (result.success && result.token && result.userId) {
        setAuthCookie(result.token, result.userId);
        navigate("/home");
      }
    } catch {
      setMessage("An error occurred during login.");
    }
  };

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
    } catch {
      setRegMessage("An error occurred during registration.");
    }
  };

  const quotes = [
    { text: "This deserves at least a HD!", author: "- Adrian K" },
    { text: "Who is Hans Roslinger and why does he look like Sean Lock?", author: "- Max C" },
    { text: "Presentations are literally in the palm of my hands!", author: "- Alan T." },
    { text: "My boss thinks I'm a genius now.", author: "- Grace H." },
    { text: "So modern, so easy!", author: "- Linus T." },
    { text: "I wish I had this years ago.", author: "- Donald K." },
    { text: "The best thing since sliced bread.", author: "- Tim B.L." },
  ];

  const [floatingQuotes, setFloatingQuotes] = useState<FloatingQuote[]>([]);

  useEffect(() => {
    const addQuote = () => {
      setFloatingQuotes((prev) => [
        ...prev,
        {
          idx: Math.floor(Math.random() * quotes.length),
          x: -40,
          y: 300 + Math.random() * (window.innerHeight - 320),
          speed: 0.075 + Math.random() * 0.05,
          key: Math.random().toString(36).slice(2),
        },
      ]);
    };
    addQuote();
    const interval = setInterval(addQuote, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingQuotes((prev) =>
        prev
          .map((q) => {
            const newX = q.x + q.speed;
            if (newX > 110) return null;
            return { ...q, x: newX };
          })
          .filter((q): q is FloatingQuote => q !== null)
      );
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

      {/* Logo first */}
  <Box width="100%" textAlign="center" pt={4} mb={0.4} sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <img
            src="/images/logo.jpg"
            alt="Logo"
            style={{
              height: 250,
              borderRadius: 16,
              boxShadow: "0 4px 16px rgba(30,41,59,0.10)",
            }}
          />
        </Box>
        <Typography
          variant="h1"
          fontWeight="bold"
          sx={{ fontSize: { xs: 40, sm: 56, md: 64 }, letterSpacing: 1, color: "#1e293b" }}
        >
          HansRoslinger
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ fontSize: { xs: 16, sm: 20, md: 24 }, mt: 1, fontStyle: "italic" }}
        >
          the modern solution for the same old graph
        </Typography>
      </Box>

      {/* Login form */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        gap={1}
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Box
          sx={{
            background: "rgba(255,255,255,0.9)",
            borderRadius: 4,
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
            p: 4,
            minWidth: 340,
            maxWidth: "90vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
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

      {/* Register Modal */}
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
