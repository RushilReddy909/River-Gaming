import Stream from "../models/streamModel.js";

const streamSocketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join_stream", async ({ streamId, userId }) => {
      try {
        const stream = await Stream.findOneAndUpdate(
          { streamId },
          { $addToSet: { viewers: socket.id } },
          { new: true }
        );

        if (!stream) {
          return socket.emit("error", "Stream not found");
        }

        socket.join(streamId);

        io.to(streamId).emit("viewer_count_update", {
          viewerCount: stream.viewers.length,
        });

        console.log(`User ${userId} joined stream ${streamId}`);
      } catch (err) {
        console.error("join_stream error:", err);
      }
    });

    socket.on("leave_stream", async ({ streamId }) => {
      try {
        const stream = await Stream.findOne({ streamId });
        if (stream) {
          stream.viewers = stream.viewers.filter((id) => id !== socket.id);
          await stream.save();
        }
      } catch (err) {
        console.error("leave_stream error:", err);
      }
    });

    socket.on("disconnecting", async () => {
      try {
        const rooms = Array.from(socket.rooms).filter(
          (room) => room !== socket.id
        );
        for (const room of rooms) {
          const stream = await Stream.findOneAndUpdate(
            { streamId: room },
            { $pull: { viewers: socket.id } },
            { new: true }
          );

          if (stream) {
            io.to(room).emit("viewer_count_update", {
              viewerCount: stream.viewers.length,
            });
          }
        }
      } catch (err) {
        console.error("disconnecting error:", err);
      }
    });

    socket.on("start_quiz", ({ streamId, quiz }) => {
      io.to(streamId).emit("quiz_question", quiz);
    });

    socket.on("submit_answer", ({ streamId, userId, answer }) => {
      io.to(streamId).emit("quiz_results", { userId, answer });
    });
  });
};

export default streamSocketHandler;
