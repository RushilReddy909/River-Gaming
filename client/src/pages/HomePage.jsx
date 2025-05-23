import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { CircleArrowLeft } from "lucide-react";
import UserQuiz from "@/components/UserQuiz";
import { Button } from "@/components/ui/button";
import useStreamStore from "../store/streamStore";
import { Card } from "@/components/ui/card";

const SOCKET_SERVER_URL = "http://localhost:5000";

const HomePage = () => {
  const [selectedStream, setSelectedStream] = useState(null);
  const [socket, setSocket] = useState(null);
  const { streams, fetchStreams } = useStreamStore();

  // Generate random userId once per session
  const [userId] = useState(() => "user_" + Math.floor(Math.random() * 10000));

  // Fetch streams on mount
  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  // Initialize socket when a stream is selected
  useEffect(() => {
    if (!selectedStream) return;

    const socketClient = io(SOCKET_SERVER_URL);

    socketClient.on("connect", () => {
      console.log("User socket connected");
      socketClient.emit("join_stream", {
        streamId: selectedStream.streamId,
        userId,
      });
    });

    setSocket(socketClient);

    return () => {
      socketClient.emit("leave_stream", {
        streamId: selectedStream.streamId,
        userId,
      });
      socketClient.disconnect();
      setSocket(null);
    };
  }, [selectedStream, userId]);

  if (selectedStream) {
    return (
      <div className="p-6">
        <div className="flex justify-between">
          <Button
            onClick={() => setSelectedStream(null)}
            className="mb-4 font-semibold flex items-center gap-2"
          >
            <CircleArrowLeft />
            Go Back
          </Button>
          <UserQuiz
            streamId={selectedStream.streamId}
            userId={userId}
            socket={socket}
          />
        </div>

        <p className="text-center text-lg font-semibold mb-4">
          {selectedStream.title}
        </p>

        {selectedStream.youtubeEmbedUrl?.length > 0 && (
          <div className="flex justify-center items-center mb-6">
            <iframe
              className="w-4/5 h-[500px]"
              src={selectedStream.youtubeEmbedUrl}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={selectedStream.title}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8">
      <p className="text-4xl font-extrabold text-center my-6 text-violet-700 dark:text-purple-300 tracking-tight underline underline-offset-8 decoration-violet-400 dark:decoration-purple-500 decoration-4 drop-shadow-sm">
        Available Streams
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {streams.length === 0 && <p>No streams available</p>}
        {streams.map((stream) => (
          <Card
            key={stream._id}
            className="cursor-pointer overflow-hidden p-0 gap-0"
            onClick={() => setSelectedStream(stream)}
          >
            <img
              src={stream.thumbnailUrl || "https://via.placeholder.com/300x200"}
              alt={stream.title}
              className="w-full h-[200px] object-cover"
            />
            <div className="py-2 px-4 text-center text-lg">{stream.title}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
