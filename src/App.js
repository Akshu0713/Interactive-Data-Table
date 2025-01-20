import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login';
import DataTable from './DataTable';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/table" element={<DataTable />} />
      </Routes>
    </Router>
  );
}

export default App;
