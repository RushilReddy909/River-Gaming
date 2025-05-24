import Stream from "../models/streamModel.js";
import authModel from "../models/authModel.js";

const activeQuizzes = {};

const streamSocketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join_stream", async ({ streamId, userId }) => {
      try {
        // Add socket.id to stream viewers (avoid duplicates)
        const stream = await Stream.findOneAndUpdate(
          { streamId },
          { $addToSet: { viewers: socket.id } },
          { new: true }
        );

        if (!stream) {
          return socket.emit("error", "Stream not found");
        }

        // Join the socket.io room for the stream
        socket.join(streamId);

        // Emit updated viewer count to the room
        io.to(streamId).emit("viewer_count_update", {
          viewerCount: stream.viewers.length,
        });

        console.log(
          `User ${userId} joined stream ${streamId} (socket ${socket.id})`
        );
      } catch (err) {
        console.error("join_stream error:", err);
      }
    });

    socket.on("leave_stream", async ({ streamId }) => {
      try {
        const stream = await Stream.findOne({ streamId });
        if (stream) {
          // Remove socket.id from viewers array
          stream.viewers = stream.viewers.filter((id) => id !== socket.id);
          await stream.save();

          // Emit updated viewer count to the room
          io.to(streamId).emit("viewer_count_update", {
            viewerCount: stream.viewers.length,
          });

          // Make socket leave the room
          socket.leave(streamId);

          console.log(`Socket ${socket.id} left stream ${streamId}`);
        }
      } catch (err) {
        console.error("leave_stream error:", err);
      }
    });

    socket.on("disconnecting", async () => {
      try {
        // Rooms includes socket.id and rooms joined by socket
        const rooms = Array.from(socket.rooms).filter(
          (room) => room !== socket.id
        );

        for (const room of rooms) {
          // Remove socket.id from viewers for each room (stream)
          const stream = await Stream.findOneAndUpdate(
            { streamId: room },
            { $pull: { viewers: socket.id } },
            { new: true }
          );

          if (stream) {
            io.to(room).emit("viewer_count_update", {
              viewerCount: stream.viewers.length,
            });

            console.log(
              `Socket ${socket.id} disconnected and left stream ${room}`
            );
          }
        }
      } catch (err) {
        console.error("disconnecting error:", err);
      }
    });

    socket.on("start_quiz", ({ streamId, quiz }) => {
      console.log(`Quiz started in stream ${streamId}`, quiz);

      // Store quiz with correct index for future reference
      activeQuizzes[streamId] = quiz;

      io.to(streamId).emit("quiz_question", quiz);

      // Cleanup after 2 minutes
      setTimeout(() => {
        delete activeQuizzes[streamId];
      }, 2 * 60 * 1000);
    });

    socket.on("submit_answer", async ({ streamId, userId, answer, amount }) => {
      const quiz = activeQuizzes[streamId];
      if (!quiz) return;

      const isCorrect = answer === quiz.correctIndex;

      let coinsToUpdate = isCorrect ? amount * 2 : -amount;

      try {
        const user = await authModel.findById(userId);
        if (user) {
          const newBalance = user.coins + coinsToUpdate;
          if (newBalance < 0) {
            // Don’t allow coin deduction if user doesn’t have enough
            return socket.emit("coin_update_failed", {
              message: "Insufficient coins to bet.",
            });
          }

          user.coins = newBalance;
          await user.save();

          io.to(streamId).emit("quiz_results", {
            userId,
            answer,
            isCorrect,
            amount,
            newBalance,
          });
        }
      } catch (err) {
        console.error("Error updating coins after quiz:", err);
      }
    });
  });
};

export default streamSocketHandler;
