import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";

import { GestureType, FunctionType } from "../gesture/gesture";
import { useState } from "react";

const GestureToLabel: Record<GestureType, string> = {
  [GestureType.THUMB_UP]: "Thumb Up",
  [GestureType.THUMB_DOWN]: "Thumb Down",
  [GestureType.POINTING_UP]: "Pointing Up",
  [GestureType.CLOSED_FIST]: "Closed Fist",
  [GestureType.I_LOVE_YOU]: "I Love You",
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
  const [state, setState] = useState<Record<GestureType, FunctionType>>({
    [GestureType.THUMB_UP]: FunctionType.UNUSED,
    [GestureType.THUMB_DOWN]: FunctionType.UNUSED,
    [GestureType.POINTING_UP]: FunctionType.SELECT,
    [GestureType.CLOSED_FIST]: FunctionType.CLEAR,
    [GestureType.I_LOVE_YOU]: FunctionType.UNUSED,
    [GestureType.UNIDENTIFIED]: FunctionType.UNUSED,
    [GestureType.OPEN_PALM]: FunctionType.FILTER,
    [GestureType.VICTORY]: FunctionType.ZOOM,
  });

  const handleChange = (key: GestureType, value: FunctionType) => {
    setState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <TableContainer component={Paper}>
      <FormControl>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Gesture</TableCell>
              <TableCell>Function</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Gestures.filter(
              (gesture) => gesture !== GestureType.UNIDENTIFIED,
            ).map((gesture) => (
              <TableRow key={gesture}>
                <TableCell>{GestureToLabel[gesture]}</TableCell>
                <TableCell>
                  <Select
                    value={state[gesture]}
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
      </FormControl>
    </TableContainer>
  );
};

export { Settings };
