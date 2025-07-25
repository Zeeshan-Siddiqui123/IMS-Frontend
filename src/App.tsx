import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Page from "./Pages/Dashboard";
import Students from "./Pages/Students";
import Posts from "./Pages/Posts";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { SiteHeader } from "./components/site-header";
import Teams from "./Pages/Teams";
import Projects from "./Pages/Projects";
import Managers from "./Pages/Managers";

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
          <Route path="/students" element={<Students />}/>
          <Route path="/posts" element={<Posts />}/>
          <Route path="/teams" element={<Teams />}/>
          <Route path="/projects" element={<Projects />}/>
          <Route path="/pm" element={<Managers />}/>
          </Routes>
        </SidebarInset>
        </SidebarProvider>
          
        
      </Router>
    </div>
  )
}

export default App
