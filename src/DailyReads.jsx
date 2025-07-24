import React from 'react';
import ReactDOM from 'react-dom/client';
import DailyReads from './DailyReads.jsx'; // ✅ correct path & name
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DailyReads />
  </React.StrictMode>
);
