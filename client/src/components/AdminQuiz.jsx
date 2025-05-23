import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const quizSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string().min(1, "Option is required")).length(4),
});

const AdminQuiz = ({ streamId, socket }) => {
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      question: "",
      options: ["", "", "", ""],
    },
  });

  useEffect(() => {
    if (!socket) return;

    const handleResults = (data) => {
      setResults((prev) => [...prev, data]);
    };

    socket.on("quiz_results", handleResults);

    return () => {
      socket.off("quiz_results", handleResults);
    };
  }, [socket]);

  const startQuiz = (data) => {
    socket.emit("start_quiz", {
      streamId,
      quiz: {
        question: data.question,
        options: data.options,
      },
    });

    reset();
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="font-semibold">Start Quiz</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Start a New Quiz</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(startQuiz)} className="space-y-2">
            <Input
              placeholder="Enter quiz question"
              {...register("question")}
              className="mb-4"
            />
            {errors.question && (
              <p className="text-sm text-red-500">{errors.question.message}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx}>
                  <Input
                    placeholder={`Option ${idx + 1}`}
                    {...register(`options.${idx}`)}
                  />
                  {errors.options?.[idx] && (
                    <p className="text-sm text-red-500">
                      {errors.options[idx]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full mt-4 font-semibold">
              Launch Quiz
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {results.length > 0 && (
        <div>
          <h4 className="font-semibold">Quiz Results (Real-time):</h4>
          <ul className="list-disc pl-4">
            {results.map(({ userId, answer }, idx) => (
              <li key={idx}>
                User <b>{userId}</b> answered: {answer}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminQuiz;
