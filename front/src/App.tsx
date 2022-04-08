import { Suspense } from 'react'
import { HashRouter as Router } from 'react-router-dom'
import 'antd/dist/antd.min.css'
import { AppRouters } from './router';
import './App.less';
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
