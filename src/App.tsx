import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useFireproof } from 'use-fireproof'

// Define the type for our count record documents
interface CountRecord {
  _id?: string
  type: string
  count: number
  note: string
  createdAt: number
}

function App() {
  // Theme state (dark/light)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })
  // Initialize Fireproof database
  const { useLiveQuery, useDocument } = useFireproof("my-app-data")

  // Create a document with useDocument hook for creating new count records
  const { doc, merge, submit } = useDocument<CountRecord>(() => ({
    type: "count-record",
    count: 0,
    note: "",
    createdAt: Date.now()
  }))

  // Query for existing count records, sorted by creation time (most recent first)
  const { docs: countRecords } = useLiveQuery<CountRecord>("type", { 
    key: "count-record",
    descending: true,
    limit: 5
  })

  // Handle saving the current count to the database
  const saveCount = () => {
    console.log("Saving count", doc.count, "with note:", doc.note)
    submit()
  }
  
  // Toggle between dark and light mode
  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
  }
  
  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode')
      document.body.style.backgroundColor = '#222'
      document.body.style.color = '#eee'
    } else {
      document.documentElement.classList.remove('dark-mode')
      document.body.style.backgroundColor = ''
      document.body.style.color = ''
    }
  }, [isDarkMode])

  // Theme-dependent styles
  const styles = {
    card: {
      backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
      color: isDarkMode ? '#eee' : 'inherit',
      borderColor: isDarkMode ? '#444' : '#ddd'
    },
    input: {
      backgroundColor: isDarkMode ? '#444' : '#fff',
      color: isDarkMode ? '#eee' : '#333',
      border: isDarkMode ? '1px solid #555' : '1px solid #ddd'
    },
    button: {
      backgroundColor: isDarkMode ? '#555' : '#f0f0f0',
      color: isDarkMode ? '#eee' : 'inherit'
    },
    recordItem: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f4f4f8',
      color: isDarkMode ? '#eee' : 'inherit',
      boxShadow: isDarkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
    },
    timestamp: {
      color: isDarkMode ? '#aaa' : '#666'
    }
  }
  
  return (
    <div style={{ backgroundColor: isDarkMode ? '#222' : '#fff', minHeight: '100vh', transition: 'background-color 0.3s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <button 
          onClick={toggleTheme}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            ...styles.button,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'} Mode
        </button>
      </div>
      <h1>Vite + React + Fireproof</h1>
      <div className="card" style={styles.card}>
        <button onClick={() => merge({ count: doc.count + 1 })}>
          count is {doc.count}
        </button>
        <div style={{ margin: '10px 0' }}>
          <input 
            type="text" 
            value={doc.note} 
            onChange={(e) => merge({ note: e.target.value })}
            placeholder="Add a note"
            style={{ 
              padding: '5px', 
              marginRight: '10px', 
              width: '200px',
              ...styles.input
            }}
          />
          <button onClick={saveCount}>
            Save count & note
          </button>
        </div>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      
      {countRecords.length > 0 && (
        <div className="card" style={styles.card}>
          <h3>Recent Count Records</h3>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto', listStyleType: 'none', padding: 0 }}>
            {countRecords.map((record) => (
              <li key={record._id} style={{ 
                padding: '8px', 
                margin: '6px 0', 
                borderRadius: '6px',
                ...styles.recordItem
              }}>
                <div>
                  <strong>Count:</strong> {record.count}
                </div>
                {record.note && (
                  <div style={{ marginTop: '4px', fontSize: '0.95em' }}>
                    <strong>Note:</strong> {record.note}
                  </div>
                )}
                <div style={{ marginTop: '4px', fontSize: '0.8em', ...styles.timestamp }}>
                  {new Date(record.createdAt).toLocaleTimeString()} - {new Date(record.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
