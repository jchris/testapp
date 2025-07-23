import React from "react";
import { useFireproof } from "use-fireproof";

export default function App() {
  const { useDocument, useLiveQuery, database } = useFireproof("simple-test-db");
  const { doc, merge, submit } = useDocument({ text: "" });
  const { docs } = useLiveQuery("_id", { descending: true });

  return (
    <div style={{ maxWidth: 480, margin: "2em auto", padding: 24, border: "1px solid #bbb", borderRadius: 8 }}>
      <h2>Simple Fireproof Notes</h2>
      <form
        onSubmit={submit}
        style={{ display: "flex", gap: 8, marginBottom: 24 }}
        autoComplete="off"
      >
        <input
          type="text"
          value={doc.text}
          onChange={e => merge({ text: e.target.value })}
          placeholder="Type a new note and hit Enter"
          style={{ flex: 1, padding: 6 }}
        />
        <button type="submit" style={{ padding: "6px 18px", cursor: "pointer" }}>Add</button>
      </form>
      <ul>
        {docs.map(d =>
          <li key={d._id} style={{ marginBottom: 8 }}>
            {d.text}
            <button
              onClick={() => database.del(d._id)}
              style={{ marginLeft: 12, color: "#b22", border: "none", background: "none", cursor: "pointer" }}
              title="Delete this note"
            >
              ×
            </button>
          </li>
        )}
      </ul>
      <p style={{ marginTop: 32, fontSize: "90%", color: "#666" }}>
        <em>Type in the field above and press Enter to save. Your notes are stored locally and update live!</em>
      </p>
    </div>
  );
}