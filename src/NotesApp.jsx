import { useEffect, useState } from "react";

const NotesApp = () => {
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedNote, setSelectedNote] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null); 

  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    setNotes(savedNotes);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch(console.error);
    }
  }, []);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  const addNote = () => {
    if (!noteText.trim()) return;
    const newNotes = [...notes, { id: Date.now(), text: noteText }];
    setNotes(newNotes);
    localStorage.setItem("notes", JSON.stringify(newNotes));
    setNoteText("");
  };

  const deleteNote = (id) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));

    if (selectedNote && selectedNote.id === id) {
      setSelectedNote(null);
    }
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
  };

  const closeViewer = () => {
    setSelectedNote(null);
  };

  const installApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("Пользователь установил приложение");
        } else {
          console.log("Пользователь отклонил установку");
        }
        setDeferredPrompt(null); 
      });
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: 10 }}>Заметки</h1>

      {!isOnline && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            backgroundColor: "#ff4d4f",
            color: "#fff",
            textAlign: "center",
            padding: "10px",
            zIndex: 9999,
            fontWeight: "bold",
            fontSize: "16px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
            ⚠ Вы находитесь в офлайн-режиме
        </div>
        )}


      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Введите заметку"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={addNote} style={{ padding: "8px 12px" }}>Добавить</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {notes.map((note) => (
          <div
            key={note.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 6,
              cursor: "pointer"
            }}
            onClick={() => handleNoteClick(note)}
          >
            <span style={{ flex: 1 }}>{note.text.slice(0, 30)}...</span>
            <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} style={{ color: "red" }}>
              Удалить
            </button>
          </div>
        ))}
      </div>

      {selectedNote && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={closeViewer}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 10,
              maxWidth: 400,
              width: "90%",
              boxShadow: "0 0 10px rgba(0,0,0,0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 10, color: "black" }}>Просмотр заметки</h2>
            <p style={{ color: "black" }}>{selectedNote.text}</p>
            <button onClick={closeViewer} style={{ marginTop: 15 }}>Закрыть</button>
          </div>
        </div>
      )}

      {/* Кнопка для установки на главный экран */}
      {deferredPrompt && (
        <button
          id="install-btn"
          onClick={installApp}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer"
          }}
        >
          Добавить на главный экран
        </button>
      )}
    </div>
  );
};

export default NotesApp;
