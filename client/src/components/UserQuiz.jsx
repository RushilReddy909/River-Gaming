import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000"; // change to your backend URL

const UserQuiz = ({ streamId, userId }) => {
  const [socket, setSocket] = useState(null);
  const [quiz, setQuiz] = useState(null); // current quiz question
  const [selectedAnswer, setSelectedAnswer] = useState("");

  useEffect(() => {
    // Connect to Socket.IO server
    const socketClient = io(SOCKET_SERVER_URL);

    setSocket(socketClient);

    // Join stream room
    socketClient.emit("join_stream", { streamId, userId });

    // Listen for quiz question event
    socketClient.on("quiz_question", (quizData) => {
      setQuiz(quizData);
      setSelectedAnswer("");
    });

    // Cleanup on unmount
    return () => {
      socketClient.disconnect();
    };
  }, [streamId, userId]);

  // Handle answer submit
  const submitAnswer = () => {
    if (selectedAnswer && socket) {
      socket.emit("submit_answer", {
        streamId,
        userId,
        answer: selectedAnswer,
      });
      alert("Answer submitted!");
      setQuiz(null); // hide quiz after submission
    }
  };

  if (!quiz) return <div>Watching live stream...</div>;

  return (
    <div
      style={{ border: "1px solid black", padding: "1rem", marginTop: "1rem" }}
    >
      <h3>Quiz Time!</h3>
      <p>{quiz.question}</p>
      {quiz.options.map((opt, idx) => (
        <div key={idx}>
          <label>
            <input
              type="radio"
              name="answer"
              value={opt}
              checked={selectedAnswer === opt}
              onChange={() => setSelectedAnswer(opt)}
            />
            {opt}
          </label>
        </div>
      ))}
      <button onClick={submitAnswer} disabled={!selectedAnswer}>
        Submit Answer
      </button>
    </div>
  );
};

export default UserQuiz;
