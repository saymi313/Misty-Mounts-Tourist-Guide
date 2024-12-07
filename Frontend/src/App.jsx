import { useState } from 'react'

import LandingPage from './UserPanel/pages/LandingPage'
import './App.css'
import Destination from './UserPanel/pages/Destination'
import CityDetail from './UserPanel/pages/CityDetail'
import Hotel from './UserPanel/pages/Hotel'
import Payment from './UserPanel/pages/Payment'
import { BrowserRouter as Router } from "react-router-dom";
import Contact from './UserPanel/pages/Contact'
import About from './UserPanel/pages/About'
import Authentication from './UserPanel/pages/Authentication'
import Feedback from './UserPanel/pages/Feedback'
function App() {




  return (
    <>
   <LandingPage/>
    </>
  )
}

export default App
