import React, { useState } from "react";
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

  return (
    <>
      {/* LOGIN FORM */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        gap={2}
      >
        <Typography variant="h4" fontWeight="bold">
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
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={() => setRegisterOpen(true)}
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
    </>
  );
};
