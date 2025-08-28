import React, { useState } from "react";
import { useAuthGuard } from "../handlers/auth/authHook";
import { useNavigate } from "react-router-dom";
import { clearAuthCookie } from "../cookies/cookies";
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItemText,
  Collapse,
  ListItemButton,
  ListItemIcon,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Folder,
  InsertChart,
  Timeline,
  PieChart,
  Settings,
  ExitToApp,
  Collections,
} from "@mui/icons-material";

export const Home: React.FC = () => {
  useAuthGuard();
  const navigate = useNavigate();

  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    clearAuthCookie();
    navigate("/", { replace: true });
  };

  const projectItems = [
    {
      id: "p1",
      name: "Sales Report",
      category: "Data Analysis",
      icon: <InsertChart color="primary" />,
      index: 1,
    },
    {
      id: "p2",
      name: "User Activity",
      category: "Behavior Tracking",
      icon: <Timeline color="primary" />,
      index: 2,
    },
    {
      id: "p3",
      name: "Market Trends",
      category: "Forecasting",
      icon: <PieChart color="primary" />,
      index: 3,
    },
  ];

  const handleItemSelect = (index: number) => {
    navigate(`/project/${index}`); // ** Change to see file with data maybe **
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
        p: 4,
        gap: 4,
        backgroundColor: "#F5F5F5",
      }}
    >
      <Typography variant="h4" fontWeight="bold" color="text.primary">
        Home
      </Typography>

      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: "90%",
          maxWidth: "1400px",
          height: "550px",
          overflow: "auto",
          backgroundColor: "#FAFAFA",
        }}
      >
        <List
          sx={{ width: "100%", bgcolor: "background.paper" }}
          component="nav"
          aria-labelledby="nested-list-subheader"
        >
          <ListItemButton onClick={handleClick}>
            <ListItemIcon>
              <Folder color="primary" />
            </ListItemIcon>
            <ListItemText primary="Workspace/Assets" />
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {projectItems.map((item) => (
                <ListItemButton
                  key={item.id}
                  sx={{ pl: 4 }}
                  onClick={() => handleItemSelect(item.index)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.name} secondary={item.category} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </List>
      </Paper>

      <Box sx={{ display: "flex", gap: 3 }}>
        <Button
          variant="contained"
          startIcon={<Collections />}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            px: 4,
            py: 1.5,
            borderRadius: "8px",
            fontWeight: "bold",
          }}
          onClick={() => navigate("/allpresentations")}
        >
          Presentations
        </Button>
        <Button
          variant="contained"
          startIcon={<Settings />}
          sx={{
            bgcolor: "secondary.main",
            color: "white",
            px: 4,
            py: 1.5,
            borderRadius: "8px",
            fontWeight: "bold",
          }}
          onClick={() => navigate("/settings")}
        >
          Settings
        </Button>
        <Button
          variant="contained"
          startIcon={<ExitToApp />}
          sx={{
            bgcolor: "error.main",
            color: "white",
            px: 4,
            py: 1.5,
            borderRadius: "8px",
            fontWeight: "bold",
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};
