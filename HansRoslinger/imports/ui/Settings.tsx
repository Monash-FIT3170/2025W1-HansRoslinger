import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Button, Box } from "@mui/material";

import { GestureType, FunctionType } from "../gesture/gesture";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { setSettingsCookie, getSettingsCookie } from "../cookies/cookies";

const GestureToLabel: Record<GestureType, string> = {
  [GestureType.THUMB_UP]: "Thumb Up",
  [GestureType.THUMB_DOWN]: "Thumb Down",
  [GestureType.POINTING_UP]: "Pointing Up",
  [GestureType.CLOSED_FIST]: "Closed Fist",
  [GestureType.I_LOVE_YOU]: "Heart",
  [GestureType.UNIDENTIFIED]: "Unidentified",
  [GestureType.OPEN_PALM]: "Open Palm",
  [GestureType.VICTORY]: "Victory",
};

const FunctionToLabel: Record<FunctionType, string> = {
  [FunctionType.SELECT]: "Select",
  [FunctionType.CLEAR]: "Clear",
  [FunctionType.FILTER]: "Filter",
  [FunctionType.ZOOM]: "Zoom",
  [FunctionType.SWITCH_CHART]: "Switch Chart",
  [FunctionType.SWITCH_DATA]: "Switch Data",
  [FunctionType.UNUSED]: "None",
};

const Gestures = [
  GestureType.CLOSED_FIST,
  GestureType.I_LOVE_YOU,
  GestureType.OPEN_PALM,
  GestureType.POINTING_UP,
  GestureType.THUMB_DOWN,
  GestureType.THUMB_UP,
  GestureType.VICTORY,
];

const Functions = [
  FunctionType.UNUSED,
  FunctionType.SELECT,
  FunctionType.FILTER,
  FunctionType.CLEAR,
  FunctionType.ZOOM,
];

const Settings: React.FC = () => {
  const [state, setState] = useState<Record<GestureType, FunctionType>>(getSettingsCookie());

  const handleChange = (key: GestureType, value: FunctionType) => {
    setState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    setSettingsCookie(state);
  }

  const navigate = useNavigate()
  const handleReturn = () => {
    navigate("/");
  }

  return (
     <Box sx={{ p: 2 }}>
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Gesture</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Function</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Gestures.filter((gesture) => gesture !== GestureType.UNIDENTIFIED)
              .map((gesture) => (
                <TableRow key={gesture}>
                  <TableCell>{GestureToLabel[gesture]}</TableCell>
                  <TableCell>
                    <Select
                      fullWidth
                      size="small"
                      value={state[gesture] ?? ""}
                      onChange={(e) => handleChange(gesture, e.target.value)}
                    >
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
      
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 5}}>
        <Button variant="outlined" onClick={handleReturn} sx={{ borderRadius: 2, px: 3 }}>
          Return
        </Button>

        <Button variant="contained" color="primary" onClick={handleSave} sx={{ borderRadius: 2, px: 3 }}>
          Save
        </Button>
      </Box>
    </Box>
  );
};

export { Settings };
