import { prisma } from "../config/prisma.js";

interface SearchResult {
  surveys: Array<{ id: string; title: string; status: string }>;
  participants: Array<{ id: string; name: string | null; email: string | null }>;
  responses: Array<{ id: string; respondent_email: string | null; survey_id: string }>;
}

export const globalSearch = async (
  userId: string,
  query: string,
  type: string,
  page: number,
  limit: number
): Promise<SearchResult> => {
  const result: SearchResult = {
    surveys: [],
    participants: [],
    responses: [],
  };

  const skip = (page - 1) * limit;

  if (type === "all" || type === "surveys") {
    const surveys = await prisma.survey.findMany({
      where: {
        creatorId: userId,
        title: { contains: query },
      },
      select: { id: true, title: true, status: true },
      skip: type === "surveys" ? skip : 0,
      take: limit,
    });
    result.surveys = surveys;
  }

  if (type === "all" || type === "participants") {
    const participants = await prisma.participant.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
        ],
      },
      select: { id: true, name: true, email: true },
      skip: type === "participants" ? skip : 0,
      take: limit,
    });
    result.participants = participants;
  }

  if (type === "all" || type === "responses") {
    const responses = await prisma.surveyResponse.findMany({
      where: {
        survey: { creatorId: userId },
        respondentEmail: { contains: query },
      },
      select: { id: true, respondentEmail: true, surveyId: true },
      skip: type === "responses" ? skip : 0,
      take: limit,
    });
    result.responses = responses.map((r) => ({
      id: r.id,
      respondent_email: r.respondentEmail,
      survey_id: r.surveyId,
    }));
  }

  return result;
};
