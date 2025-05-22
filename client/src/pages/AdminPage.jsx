import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000";

const AdminPanel = () => {
  const [streamId, setStreamId] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // Quiz states
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);

  // Create a new stream
  const createStream = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/admin/create-stream"
      );
      setStreamId(res.data.streamId);
      setViewerCount(0);
      alert(`Stream created: ${res.data.streamId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create stream");
    }
  };

  // Connect to Socket.IO once streamId is set
  useEffect(() => {
    if (!streamId) return;

    const socketClient = io(SOCKET_SERVER_URL);

    socketClient.on("connect", () => {
      console.log("Admin socket connected");
    });

    // Listen for viewer count updates
    socketClient.on("viewer_count_update", ({ viewerCount }) => {
      setViewerCount(viewerCount);
    });

    setSocket(socketClient);

    return () => {
      socketClient.disconnect();
      setSocket(null);
    };
  }, [streamId]);

  // Emit start quiz
  const startQuiz = () => {
    if (!question || options.some((opt) => !opt)) {
      alert("Please fill all quiz fields");
      return;
    }

    if (socket) {
      socket.emit("start_quiz", {
        streamId,
        quiz: { question, options },
      });
      alert("Quiz started!");
      setQuestion("");
      setOptions(["", "", "", ""]);
    }
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Admin Panel</h2>

      <button onClick={createStream}>Create New Stream</button>

      {streamId && (
        <>
          <p>
            <b>Stream ID:</b> {streamId}
          </p>
          <p>
            <b>Current Viewers:</b> {viewerCount}
          </p>

          <h3>Start a Quiz</h3>
          <input
            type="text"
            placeholder="Quiz Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          {options.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Option ${idx + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
          ))}
          <button onClick={startQuiz}>Start Quiz</button>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
