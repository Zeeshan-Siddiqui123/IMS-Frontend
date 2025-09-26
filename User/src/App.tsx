import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { SiteHeader } from "./components/site-header";
import { AppSidebar } from "./components/app-sidebar";
import Page from "./Pages/Dashboard";
import SignUp from "./auth/SignUp";
import Login from "./auth/Login";


const App = () => {
  return (
    <div>
      <Router>
        
        <SidebarProvider style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <Routes>
          <Route path="/" element={<Page />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          </Routes>
        </SidebarInset>
        </SidebarProvider>
          
        
      </Router>
    </div>
  )
}

export default App
