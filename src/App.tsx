import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useFireproof } from 'use-fireproof'

// Define the type for our count record documents
interface CountRecord {
  _id?: string
  type: string
  count: number
  createdAt: number
}

function App() {
  // Initialize Fireproof database
  const { useLiveQuery, useDocument } = useFireproof("my-app-data")

  // Create a document with useDocument hook for creating new count records
  const { doc, merge, submit } = useDocument<CountRecord>(() => ({
    type: "count-record",
    count: 0,
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
    console.log("Saving count", doc.count)
    submit()
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Fireproof</h1>
      <div className="card">
        <button onClick={() => merge({ count: doc.count + 1 })}>
          count is {doc.count}
        </button>
        <button onClick={saveCount} style={{ marginLeft: '10px' }}>
          Save count
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      
      {countRecords.length > 0 && (
        <div className="card">
          <h3>Recent Count Records</h3>
          <ul style={{ textAlign: 'left', maxWidth: '300px', margin: '0 auto' }}>
            {countRecords.map((record) => (
              <li key={record._id}>
                {JSON.stringify(record)}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
