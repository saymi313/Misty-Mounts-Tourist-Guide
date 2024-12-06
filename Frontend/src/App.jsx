import { useState } from 'react'

import LandingPage from './UserPanel/pages/LandingPage'
import './App.css'
import Destination from './UserPanel/pages/Destination'
import CityDetail from './UserPanel/pages/CityDetail'
import Hotel from './UserPanel/pages/Hotel'
import Payment from './UserPanel/pages/Payment'
import { BrowserRouter as Router } from "react-router-dom";

function App() {


  return (
    <>
    <Router>
        <Payment/>
            
        </Router>
    </>
  )
}

export default App
