import React from "react";
import { Meteor } from "meteor/meteor";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Login } from "./Login";
import { Home } from "./Home";
import AllPresentations from "./AllPresentations";
import { Present } from "./Present";

Meteor.subscribe("users");
Meteor.subscribe("presentations")
Meteor.subscribe("datasets")

export const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/allpresentations" element={<AllPresentations />} />
      <Route path="/present" element={<Present />} />
      {/* Redirect unknown routes to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);
