import { Suspense } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import 'antd/dist/antd.min.css'
import { AppRouters } from './router';
import './App.css';

function App() {
  return (
    <Router>
      <Suspense fallback={<><div></div></>}>
        <AppRouters />
      </Suspense>
    </Router>
  )
}
export default App
