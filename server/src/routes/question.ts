import { Router, Request, Response, NextFunction } from 'express';
import { answerQuestion } from '../services/questionService';

const router = Router();

interface QuestionRequestBody {
  question: string;
  transcript: string;
  formattedIntake: string;
}

router.post(
  '/ask',
  async (req: Request<object, object, QuestionRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    const { question, transcript, formattedIntake } = req.body;

    if (!question || !question.trim()) {
      res.status(400).json({
        message: 'Question is required',
        code: 'NO_QUESTION',
        retryable: false,
      });
      return;
    }

    if (!transcript || !formattedIntake) {
      res.status(400).json({
        message: 'Transcript and formatted intake context are required',
        code: 'NO_CONTEXT',
        retryable: false,
      });
      return;
    }

    try {
      const answer = await answerQuestion(question, {
        transcript,
        formattedIntake,
      });

      res.json({ answer });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
