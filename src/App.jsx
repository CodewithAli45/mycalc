import { useState } from 'react'
import Layout from './components/Layout'
import BasicCalc from './pages/BasicCalc'
import ScientificCalc from './pages/ScientificCalc'
import ProgrammerCalc from './pages/ProgrammerCalc'
import DateCalc from './pages/DateCalc'
import UnitConverter from './pages/UnitConverter'
import BasicMath from './pages/BasicMath'
import FinancialCalc from './pages/FinancialCalc'
import PrintingCalc from './pages/PrintingCalc'
import GraphingCalc from './pages/GraphingCalc'

// Placeholder imports for other pages
const Placeholder = ({ name }) => (
  <div style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center' }}>
    <h2>{name}</h2>
    <p>Coming Soon</p>
  </div>
);

function App() {
  const [activePage, setActivePage] = useState('BasicCalc')

  const renderPage = () => {
    switch (activePage) {
      case 'BasicCalc': return <BasicCalc />;
      case 'ScientificCalc': return <ScientificCalc />;
      case 'ProgrammerCalc': return <ProgrammerCalc />;
      case 'FinancialCalc': return <FinancialCalc />;
      case 'PrintingCalc': return <PrintingCalc />;
      case 'GraphingCalc': return <GraphingCalc />;
      case 'UnitConverter': return <UnitConverter />;
      case 'DateCalc': return <DateCalc />;
      case 'BasicMath': return <BasicMath />;
      default: return <BasicCalc />;
    }
  }

  return (
    <Layout activeCalculator={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </Layout>
  )
}

export default App

