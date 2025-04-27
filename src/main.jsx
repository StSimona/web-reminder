import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './reminder.css';          
import ReminderApp from './ReminderApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReminderApp />
  </StrictMode>,
)
