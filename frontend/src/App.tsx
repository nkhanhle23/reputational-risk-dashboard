import { NavLink, Route, Routes } from 'react-router-dom'
import Overview from './pages/Overview'
import Companies from './pages/Companies'
import CompanyDetail from './pages/CompanyDetail'
import CrossTab from './pages/CrossTab'
import CrosstabDrilldown from './pages/CrosstabDrilldown'
import PeakDetail from './pages/PeakDetail'
import Articles from './pages/Articles'
import './App.css'

function App() {
  return (
    <div className="app">
      <nav className="nav">
        <span className="brand">Reputational Risk Dashboard</span>
        <NavLink to="/" end>
          Overview
        </NavLink>
        <NavLink to="/companies">Companies</NavLink>
        <NavLink to="/crosstab">Cross-tab</NavLink>
      </nav>
      <main className="content">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:companyId" element={<CompanyDetail />} />
          <Route path="/peaks/:peakId" element={<PeakDetail />} />
          <Route path="/crosstab" element={<CrossTab />} />
          <Route path="/crosstab/drilldown" element={<CrosstabDrilldown />} />
          <Route path="/articles" element={<Articles />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
