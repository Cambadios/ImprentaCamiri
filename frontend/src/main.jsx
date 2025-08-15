import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PrimeReactProvider  } from 'primereact/api';

import 'primereact/resources/primereact.min.css'; //core css
import 'primeicons/primeicons.css'; //icons



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrimeReactProvider value={{pt: {}, ptOptions:{mergeSections: true, mergeProps:true}  }}>
      <App/>
    </PrimeReactProvider>
  </React.StrictMode>,
)