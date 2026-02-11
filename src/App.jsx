import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProjectProvider } from "./context/ProjectContext"; // Import the provider
import { Toaster } from "./Components/ui/toaster";
import { Toaster as Sonner } from "./Components/ui/sonner";
import { TooltipProvider } from "./Components/ui/tooltip";
// Pages
import Projects from "./Pages/Projects";
import NotFound from "./Pages/NotFound";
// Admin Pages
import Login from "./Pages/Admin/Login";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import UserPageLogin from "./Pages/Admin/UserPageLogin";
import AdminPageLogin from "./Pages/Admin/AdminPageLogin";
import AdminLayout from "./Components/Layout/AdminLayout";
import Index from "./Pages/Index";
import NewProject from "./Pages/NewProject";
import ProjectDetail from "./Pages/ProjectDetail";
import Team from "./Pages/Team";
import Settings from "./Pages/Settings";
import Welcome from "./Pages/Admin/Welcome";
import UserLoginLogs from "./Pages/Admin/UserLoginLogs";
import QuickTask from "./Components/projects/forms/QuickTask";
import QuickTaskDetail from './pages/QuickTaskDetail';
import { TimerProvider } from "./context/TimerContext";

// Layout wrapper to conditionally show Navbar/Footer
const Layout = ({ children }) => {
  return (
    <div className="bg-vernoxy text-white min-h-screen text-center">
      {children}
    </div>
  );
};
const queryClient = new QueryClient();
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProjectProvider>
          <TimerProvider>
            <Toaster />
            <Sonner />
            <Router>
              <Routes>
                {/* DEFAULT → LOGIN */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Login page */}
                <Route path="/login" element={<Login />} />

                {/* Admin routes wrapped with ProjectProvider */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <ProjectProvider>
                        <AdminLayout />
                      </ProjectProvider>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Index />} />
                  <Route path="welcome" element={<Welcome />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="admin-page" element={<AdminPageLogin />} />
                  <Route path="user-page" element={<UserPageLogin />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="projects/new" element={<NewProject />} />
                  <Route path="projects/edit/:id" element={<NewProject />} />
                  <Route path="projects/:id" element={<ProjectDetail />} />
                  <Route path="team" element={<Team />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="login-logs" element={<UserLoginLogs />} />
                  <Route path="quick-task" element={<QuickTask />} />
                  <Route path="quick-task/edit/:id" element={<QuickTask />} />
                  <Route path="/dashboard/quick-task/:id" element={<QuickTaskDetail />} />
                </Route>

                {/* 404 fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </TimerProvider>
        </ProjectProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
