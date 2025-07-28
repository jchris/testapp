import React, { useState, useEffect } from "react";
import { useFireproof, toCloud, RedirectStrategy } from "use-fireproof";

function NotesApp({ databaseName }: { databaseName: string }) {
  const { database, useDocument, useLiveQuery, attach } = useFireproof(
    databaseName,
    {
      attach: toCloud({
        strategy: new RedirectStrategy({
          //   overlayCss: defaultOverlayCss,
          overlayHtml: (url: string) => `<div class="fpOverlayContent">
          <div class="fpCloseButton">&times;</div>
          Fireproof Dashboard<br />
          Sign in to Fireproof Dashboard
          <a href="${url}" target="_blank">Redirect to Fireproof</a>
        </div>`,
        }),
      }),
    },
  );

  const { doc, merge, submit } = useDocument({ text: "" });
  const { docs } = useLiveQuery<{ text: string }>("_id", { descending: true });

  return (
    <>
      <div>
        {attach.state}:[
        {attach.ctx.tokenAndClaims.state === "ready"
          ? attach.ctx.tokenAndClaims.tokenAndClaims.token
          : ""}
        ]{attach.state === "error" ? attach.error.message : ""}
      </div>
      <div
        className="card"
        onClick={() => {
          if (attach.ctx.tokenAndClaims.state === "ready") {
            attach.ctx.tokenAndClaims.reset();
          }
        }}
      >
        Reset Token
      </div>
      <form
        onSubmit={(e) => submit(e as unknown as Event)}
        style={{ display: "flex", gap: 8, marginBottom: 24 }}
        autoComplete="off"
      >
        <input
          type="text"
          value={doc.text}
          onChange={(e) => merge({ text: e.target.value })}
          placeholder="Type a new note and hit Enter"
          style={{ flex: 1, padding: 6 }}
        />
        <button
          type="submit"
          style={{ padding: "6px 18px", cursor: "pointer" }}
        >
          Add
        </button>
      </form>
      <ul>
        {docs.map((d) => (
          <li key={d._id} style={{ marginBottom: 8 }}>
            {d.text}
            <button
              onClick={() => database.del(d._id)}
              style={{
                marginLeft: 12,
                color: "#b22",
                border: "none",
                background: "none",
                cursor: "pointer",
              }}
              title="Delete this note"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: 32, fontSize: "90%", color: "#666" }}>
        <em>
          Type in the field above and press Enter to save. Your notes are stored
          locally and update live!
        </em>
      </p>
    </>
  );
}

export default function App() {
  const [databaseName, setDatabaseName] = useState("");
  const [currentDb, setCurrentDb] = useState("");
  const [dbHistory, setDbHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("fireproof-db-history");
    if (saved) {
      setDbHistory(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (databaseName.trim()) {
      const newDbName = databaseName.trim();
      setCurrentDb(newDbName);

      const updatedHistory = [
        newDbName,
        ...dbHistory.filter((db) => db !== newDbName),
      ].slice(0, 5);
      setDbHistory(updatedHistory);
      localStorage.setItem(
        "fireproof-db-history",
        JSON.stringify(updatedHistory),
      );

      setDatabaseName("");
    }
  };

  const switchToDb = (dbName: string) => {
    setCurrentDb(dbName);
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "2em auto",
        padding: 24,
        border: "1px solid #bbb",
        borderRadius: 8,
      }}
    >
      <h2>Simple Fireproof Notes</h2>

      <div
        style={{
          marginBottom: 24,
          padding: 16,
          backgroundColor: "#f8f9fa",
          borderRadius: 6,
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: 8, marginBottom: 12 }}
        >
          <input
            type="text"
            value={databaseName}
            onChange={(e) => setDatabaseName(e.target.value)}
            placeholder="Enter database name"
            style={{ flex: 1, padding: 6 }}
          />
          <button
            type="submit"
            style={{ padding: "6px 18px", cursor: "pointer" }}
          >
            Switch
          </button>
        </form>

        {dbHistory.length > 0 && (
          <div>
            <div style={{ fontSize: "90%", color: "#666", marginBottom: 8 }}>
              Recent databases:
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {dbHistory.map((db) => (
                <button
                  key={db}
                  onClick={() => switchToDb(db)}
                  style={{
                    padding: "4px 8px",
                    fontSize: "85%",
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    background: db === currentDb ? "#007bff" : "#fff",
                    color: db === currentDb ? "#fff" : "#333",
                    cursor: "pointer",
                  }}
                >
                  {db}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentDb && (
          <div style={{ marginTop: 12, fontSize: "90%", color: "#666" }}>
            Current database: <strong>{currentDb}</strong>
          </div>
        )}
      </div>

      {currentDb ? (
        <NotesApp databaseName={currentDb} />
      ) : (
        <p style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}>
          Enter a database name above to start taking notes
        </p>
      )}
    </div>
  );
}
