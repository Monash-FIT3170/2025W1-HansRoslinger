
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { GestureType } from '../gesture/gesture';

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

const Gestures = [
    GestureType.CLOSED_FIST,
    GestureType.I_LOVE_YOU,
    GestureType.OPEN_PALM,
    GestureType.POINTING_UP,
    GestureType.THUMB_DOWN,
    GestureType.THUMB_UP,
    GestureType.VICTORY 
]


export default function settings() {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Gesture</TableCell>
            <TableCell>Function</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Gestures.map((gesture) => (
            <TableRow key={gesture}>
              <TableCell>
                {GestureToLabel[gesture]}
              </TableCell>
              <TableCell>
                {/*Select */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
