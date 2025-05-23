import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BadgeDollarSign } from "lucide-react";
import { Separator } from "./ui/separator";

const quizSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).nonempty(),
});

const UserQuiz = ({ streamId, userId, socket, onGoBack }) => {
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [showQuizDialog, setShowQuizDialog] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleQuizQuestion = (quizData) => {
      const result = quizSchema.safeParse(quizData);
      if (result.success) {
        setQuiz(result.data);
        setSelectedAnswer("");
        setSelectedAmount(null);
        toast.info("New quiz is live! Click 'Answer Quiz' to participate.");
        setShowQuizDialog(false);
      } else {
        console.error("Invalid quiz data", result.error);
        toast.error("Received invalid quiz data.");
      }
    };

    socket.on("quiz_question", handleQuizQuestion);

    // Join stream with userId on mount or streamId change
    socket.emit("join_stream", { streamId, userId });

    // Cleanup on unmount or dependency change
    return () => {
      socket.off("quiz_question", handleQuizQuestion);
      socket.emit("leave_stream", { streamId, userId });
    };
  }, [socket, streamId, userId]);

  const submitAnswer = () => {
    if (selectedAnswer && selectedAmount && socket) {
      socket.emit("submit_answer", {
        streamId,
        userId,
        answer: selectedAnswer,
        amount: selectedAmount,
      });
      toast.success("Answer submitted!");
      setQuiz(null);
      setShowQuizDialog(false);
    }
  };

  if (!quiz) return null;

  return (
    <div>
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogTrigger asChild>
          {!showQuizDialog && (
            <Button
              onClick={() => setShowQuizDialog(true)}
              className={"font-semibold"}
            >
              Answer Quiz
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="w-[90%] max-w-md">
          <DialogHeader>
            <DialogTitle>{quiz.question}</DialogTitle>
          </DialogHeader>

          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            className="flex flex-col space-y-2 mt-4"
          >
            {quiz.options.map((opt, idx) => (
              <label
                key={idx}
                className="flex items-center cursor-pointer space-x-2"
              >
                <RadioGroupItem value={opt} id={`option-${idx}`} />
                <span>{opt}</span>
              </label>
            ))}
          </RadioGroup>
          <Separator />
          <div>
            <div className="text-center mt-2">Select Amount to Bet</div>
            <div className="flex gap-4 mt-6 justify-center">
              {[10, 50, 100].map((amt) => (
                <Button
                  key={amt}
                  variant={selectedAmount === amt ? "default" : "outline"}
                  onClick={() => setSelectedAmount(amt)}
                  className={"font-semibold"}
                >
                  <BadgeDollarSign />
                  {amt}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-4">
            <Button
              className={"font-semibold"}
              variant="outline"
              onClick={() => setShowQuizDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className={"font-semibold"}
              disabled={!selectedAnswer || !selectedAmount}
              onClick={submitAnswer}
            >
              Submit Answer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserQuiz;
