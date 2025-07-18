import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Account from './auth/Account'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Account />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
