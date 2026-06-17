import { prisma } from "../config/prisma.js";

export const getStats = async (userId: string) => {
  const surveyQuantity = await prisma.survey.count({
    where: { creatorId: userId },
  });

  const totalResponses = await prisma.surveyResponse.count({
    where: { survey: { creatorId: userId } },
  });

  const questionsResponded = await prisma.responseAnswer.count({
    where: { response: { survey: { creatorId: userId } } },
  });

  const newQuestions = await prisma.surveyQuestion.count({
    where: { section: { survey: { creatorId: userId } } },
  });

  return {
    survey_quantity: surveyQuantity,
    total_responses: totalResponses,
    questions_responded: questionsResponded,
    new_questions: newQuestions,
    change_percentages: {
      survey_quantity: 0,
      total_responses: 0,
      questions_responded: 0,
      new_questions: 0,
    },
  };
};

export const getRecentSurveys = async (userId: string, limit: number) => {
  const surveys = await prisma.survey.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      _count: {
        select: { responses: true },
      },
    },
  });

  return surveys.map((survey) => ({
    id: survey.id,
    title: survey.title,
    status: survey.status,
    description: survey.description,
    author_name: "", // Will be populated from user
    author_avatar: "", // Will be populated from user
    response_count: survey._count.responses,
    response_limit: survey.responseLimit,
    created_at: survey.createdAt.toISOString(),
  }));
};

export const getSurveyAnalytics = async (surveyId: string, userId: string) => {
  const survey = await prisma.survey.findFirst({
    where: { id: surveyId, creatorId: userId },
    include: {
      responses: {
        include: {
          answers: true,
        },
      },
      sections: {
        include: {
          questions: {
            include: {
              options: true,
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!survey) {
    return null;
  }

  const totalResponses = survey.responses.length;
  const completedResponses = survey.responses.filter(
    (r) => r.completedAt !== null
  ).length;
  const completionRate =
    totalResponses > 0
      ? parseFloat(((completedResponses / totalResponses) * 100).toFixed(1))
      : 0;

  const averageTimeSec = (() => {
    const times = survey.responses
      .filter((r) => r.timeTakenSec !== null)
      .map((r) => r.timeTakenSec!);
    if (times.length === 0) return 0;
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  })();

  // responses over time (last 30 days)
  const responsesOverTime = (() => {
    const dateMap = new Map<string, number>();
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0]!;
      dateMap.set(key, 0);
    }
    for (const r of survey.responses) {
      const key = r.startedAt.toISOString().split("T")[0]!;
      if (dateMap.has(key)) {
        dateMap.set(key, (dateMap.get(key) ?? 0) + 1);
      }
    }
    return Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  })();

  // question breakdown
  const questionBreakdown = survey.sections.flatMap((section) =>
    section.questions.map((question) => {
      const answers = survey.responses.flatMap((r) =>
        r.answers.filter((a) => a.questionId === question.id)
      );

      const responses: Record<string, number> = {};

      if (question.type === "likert_scale") {
        const values = answers
          .filter((a) => a.likertValue !== null)
          .map((a) => a.likertValue!);
        for (let i = 1; i <= 5; i++) {
          responses[String(i)] = values.filter((v) => v === i).length;
        }
        const avg =
          values.length > 0
            ? parseFloat(
                (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
              )
            : 0;
        return {
          question_id: question.id,
          question_text: question.text,
          type: question.type,
          responses,
          average: avg,
        };
      }

      if (question.type === "yes_no") {
        const yesCount = answers.filter((a) => a.yesNoValue === true).length;
        const noCount = answers.filter((a) => a.yesNoValue === false).length;
        return {
          question_id: question.id,
          question_text: question.text,
          type: question.type,
          responses: { yes: yesCount, no: noCount },
          average: 0,
        };
      }

      if (question.type === "multiple_choice" || question.type === "single_choice") {
        for (const option of question.options) {
          responses[option.value] = 0;
        }
        for (const answer of answers) {
          if (answer.answerOptions) {
            try {
              const selected = JSON.parse(answer.answerOptions) as string[];
              for (const optValue of selected) {
                responses[optValue] = (responses[optValue] ?? 0) + 1;
              }
            } catch {
              // skip invalid JSON
            }
          }
        }
        return {
          question_id: question.id,
          question_text: question.text,
          type: question.type,
          responses,
          average: 0,
        };
      }

      // text type
      return {
        question_id: question.id,
        question_text: question.text,
        type: question.type,
        responses: { answers: answers.filter((a) => a.answerText).length },
        average: 0,
      };
    })
  );

  return {
    total_responses: totalResponses,
    completion_rate: completionRate,
    average_time_sec: averageTimeSec,
    responses_over_time: responsesOverTime,
    question_breakdown: questionBreakdown,
  };
};
