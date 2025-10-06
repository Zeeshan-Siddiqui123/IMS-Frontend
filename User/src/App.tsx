import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { SiteHeader } from "./components/site-header";
import { AppSidebar } from "./components/app-sidebar";
import SignUp from "./auth/SignUp";
import Login from "./auth/Login";
import PrivateRoute from "./auth/PrivateRoute.tsx";
import Dashboard from "./Pages/Dashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <SidebarProvider
                style={
                  {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                  } as React.CSSProperties
                }
              >
                <AppSidebar variant="inset" />
                <SidebarInset>
                  <SiteHeader />
                  <Dashboard /> 
                </SidebarInset>
              </SidebarProvider>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
