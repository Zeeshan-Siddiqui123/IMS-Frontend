import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Page from "./app/dashboard/page";
import Students from "./Pages/Students";
import UrlBreadcrumb from "./components/UrlBreadcrumb";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
        
          <Route path="/" element={<Page />} />
          <Route path="/students" element={<Students />}>
            <Route path="/students/add"/>
            <Route path="/students/view"/>
            {/* <Route path="/students/delete"/> */}
          </Route>
        </Routes>
      </Router>
    </div>
  )
}

export default App
