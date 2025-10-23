import React, { useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Button, Box, Typography, Alert } from "@mui/material";

import { GestureType, FunctionType, defaultMapping } from "../gesture/gesture";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthCookie } from "../cookies/cookies";
import { getUserById, getUserSettings, updateUserSettings } from "../api/database/users/users";

export const GestureToLabel: Record<GestureType, string> = {
  [GestureType.THUMB_UP]: "Thumb Up",
  [GestureType.THUMB_DOWN]: "Thumb Down",
  [GestureType.POINTING_UP]: "Pointing Up",
  [GestureType.CLOSED_FIST]: "Closed Fist",
  [GestureType.I_LOVE_YOU]: "Heart",
  [GestureType.UNIDENTIFIED]: "Unidentified",
  [GestureType.OPEN_PALM]: "Open Palm",
  [GestureType.VICTORY]: "Victory",
  [GestureType.PINCH]: "Pinch",
  [GestureType.DOUBLE_PINCH]: "Double Pinch",
  [GestureType.TWO_FINGER_POINTING_LEFT]: "Two Fingers Pointing Left",
  [GestureType.TWO_FINGER_POINTING_RIGHT]: "Two Fingers Pointing Right",
  [GestureType.DRAW]: "Draw",
};

export const FunctionToLabel: Record<FunctionType, string> = {
  [FunctionType.SELECT]: "Select",
  [FunctionType.CLEAR]: "Clear",
  [FunctionType.FILTER]: "Filter",
  [FunctionType.CLICK]: "Click",
  // [FunctionType.ZOOM]: "Zoom",
  [FunctionType.SWITCH_CHART]: "Switch Chart",
  [FunctionType.SWITCH_DATA]: "Switch Data",
  [FunctionType.UNUSED]: "None",
  [FunctionType.DRAW]: "Draw",
};

export const FunctionToIconSources: Record<FunctionType, string> = {
  [FunctionType.SELECT]: "/icons/selection.png",
  [FunctionType.FILTER]: "/icons/filter.png",
  [FunctionType.CLEAR]: "/icons/filter-clear.png",
  [FunctionType.ZOOM]: "/icons/zoom-in.png",
  [FunctionType.CLICK]: "/icons/click.png",
  [FunctionType.SWITCH_CHART]: "/icons/change-type.png",
  [FunctionType.SWITCH_DATA]: "/icons/change-data.png",
  [FunctionType.UNUSED]: "",
  [FunctionType.DRAW]: "/icons/draw.png",
};

export const GestureToIconSources: Record<GestureType, string> = {
  [GestureType.CLOSED_FIST]: "/icons/closed_fist.png",
  [GestureType.I_LOVE_YOU]: "/icons/love.png",
  [GestureType.UNIDENTIFIED]: "",
  [GestureType.OPEN_PALM]: "/icons/open_palm.png",
  [GestureType.POINTING_UP]: "/icons/point_up.png",
  [GestureType.THUMB_DOWN]: "/icons/thumbs_down.png",
  [GestureType.THUMB_UP]: "/icons/thumbs_up.png",
  [GestureType.VICTORY]: "/icons/victory.png",
  [GestureType.PINCH]: "/icons/pinch.png",
  [GestureType.DOUBLE_PINCH]: "/icons/double_pinch.png",
  [GestureType.TWO_FINGER_POINTING_LEFT]: "/icons/two_point_L.png",
  [GestureType.TWO_FINGER_POINTING_RIGHT]: "/icons/two_point_R.png",
  [GestureType.DRAW]: "/icons/draw_gesture.png",
};

const Gestures = [
  GestureType.CLOSED_FIST,
  GestureType.I_LOVE_YOU,
  GestureType.OPEN_PALM,
  GestureType.POINTING_UP,
  GestureType.THUMB_DOWN,
  GestureType.THUMB_UP,
  GestureType.VICTORY,
  GestureType.PINCH,
  // GestureType.DOUBLE_PINCH,
  GestureType.TWO_FINGER_POINTING_LEFT,
  GestureType.TWO_FINGER_POINTING_RIGHT,
  GestureType.DRAW,
];

const Functions = [
  FunctionType.UNUSED,
  FunctionType.SELECT,
  FunctionType.FILTER,
  FunctionType.CLEAR,
  FunctionType.ZOOM,
  FunctionType.CLICK,
  FunctionType.SWITCH_CHART,
  FunctionType.SWITCH_DATA,
  FunctionType.DRAW,
];

/**
 * Settings page for HansRoslinger
 * 
 * @returns HTML
 */
const Settings: React.FC = () => {
  const [state, setState] = useState<Record<GestureType, FunctionType>>(defaultMapping);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const userId = getAuthCookie()?.userId;
    if (!userId) return;

    async function loadSettings() {
      if (userId != null) {
        const user = await getUserById(userId);

        if (user != null) {
          const email = user.email;
          const settings = await getUserSettings(email);
          if (settings) {
            setState(settings);
          }
        }
      }
    }

    loadSettings();
  }, []);

  const handleChange = (key: GestureType, value: FunctionType) => {
    setState((prev) => {
      const next: Record<GestureType, FunctionType> = { ...prev };
      if (value !== FunctionType.UNUSED) {
        // Ensure uniqueness: only one gesture can use a function at a time
        for (const g of Gestures) {
          if (g !== key && prev[g] === value) {
            next[g] = FunctionType.UNUSED;
          }
        }
      }
      next[key] = value;
      return next;
    });
  };

  const handleSave = async () => {
    const cookie = getAuthCookie();
    if (cookie != null && cookie.userId != null) {
      const res = await updateUserSettings(cookie.userId, state);
      console.log("Saved:" + "\n" + res + "\n" + cookie.userId + "\n" + JSON.stringify(state));
    } else {
      alert("Not logged in");
    }
  };

  const navigate = useNavigate();
  const handleReturn = () => {
    navigate("/home");
  };

  return (
    <Box
      sx={{
        p: 2,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f8fafc 60%, #f0fdfa 100%)",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here you can configure the mapping from a gesture to a specific action within HansRoslinger. If you would like to disable a gesture, set it to &quot;None&quot;.
        </Typography>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Gesture</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Function</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Gestures.filter((gesture) => gesture !== GestureType.UNIDENTIFIED).map((gesture) => (
              <TableRow key={gesture}>
                <TableCell>{GestureToLabel[gesture]}</TableCell>
                <TableCell>
                  <Select fullWidth size="small" value={state[gesture] ?? FunctionType.UNUSED} onChange={(e) => handleChange(gesture, e.target.value as FunctionType)}>
                    {Functions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {FunctionToLabel[option]}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 5 }}>
        <Button variant="outlined" onClick={handleReturn} sx={{ borderRadius: 2, px: 5, minWidth: 160 }}>
          Return
        </Button>

        <Button variant="contained" color="primary" onClick={handleSave} sx={{ borderRadius: 2, px: 5, minWidth: 160 }}>
          Save
        </Button>
      </Box>
    </Box>
  );
};

export { Settings };
