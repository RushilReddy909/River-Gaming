import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000"; // change to your backend URL

const AdminQuiz = ({ streamId }) => {
  const [socket, setSocket] = useState(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const socketClient = io(SOCKET_SERVER_URL);
    setSocket(socketClient);

    // Listen for quiz results
    socketClient.on("quiz_results", (data) => {
      setResults((prev) => [...prev, data]);
    });

    // Cleanup
    return () => {
      socketClient.disconnect();
    };
  }, []);

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const startQuiz = () => {
    if (!question || options.some((opt) => !opt)) {
      alert("Please fill all fields");
      return;
    }

    socket.emit("start_quiz", {
      streamId,
      quiz: {
        question,
        options,
      },
    });

    setQuestion("");
    setOptions(["", "", "", ""]);
    setResults([]); // reset previous results
  };

  return (
    <div style={{ padding: "1rem", border: "1px solid gray" }}>
      <h3>Start Quiz</h3>
      <input
        type="text"
        placeholder="Question"
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

      <h4>Quiz Results (Real-time):</h4>
      <ul>
        {results.map(({ userId, answer }, idx) => (
          <li key={idx}>
            User <b>{userId}</b> answered: {answer}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminQuiz;
