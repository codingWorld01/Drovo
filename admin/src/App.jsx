import React from 'react'
import Navbar from './components/navbar/Navbar'
import Sidebar from './components/sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Orders from './pages/Orders/Orders'
import List from './pages/List/List'
import Add from './pages/Add/Add'
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'react-hot-toast'



const App = () => {

  const url = 'http://localhost:4000'

  return (
    <div>
      {/* <ToastContainer /> */}
      <div><Toaster
        position="top-right"
        reverseOrder={false}
      /></div>

      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path='/add' element={<Add url={url} />} />
          <Route path='/list' element={<List url={url} />} />
          <Route path='/orders' element={<Orders url={url} />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
