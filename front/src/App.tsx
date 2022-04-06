import { Suspense } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import 'antd/dist/antd.min.css'
import { AppRouters } from './router';
import './App.css';

function App() {
  const { VITE_APP_BASEN_NAME } = import.meta.env;
  return (
    <Router basename={VITE_APP_BASEN_NAME as string}>
      <Suspense fallback={<><div></div></>}>
        <AppRouters />
      </Suspense>
    </Router>
  )
}
export default App
