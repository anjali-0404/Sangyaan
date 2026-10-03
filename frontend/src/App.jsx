import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import VerifyWorkspace from './pages/VerifyWorkspace'
import AnalysisProgress from './pages/AnalysisProgress'
import HistoryPage from './pages/HistoryPage'
import LearnPage from './pages/LearnPage'
import ReportFraud from './pages/ReportFraud'

function App() {
  const location = useLocation()

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/verify" element={<VerifyWorkspace />} />
          <Route path="/analysis" element={<AnalysisProgress />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/report" element={<ReportFraud />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  )
}

export default App
