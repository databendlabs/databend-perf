import { Suspense } from 'react'
import { HashRouter as Router } from 'react-router-dom'
import 'antd/dist/antd.min.css'
import { AppRouters } from './router';
import './assets/fonts/fonts.css';
import './App.scss';
import Fallback from './componnent/Fallback';

function App() {
  return (
    <Router>
      <Suspense fallback={<Fallback></Fallback>}>
        <AppRouters></AppRouters>
      </Suspense>
    </Router>
  )
}
export default App
