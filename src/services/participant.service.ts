import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import type { AddParticipantsInput, UpdateParticipantInput } from "../validators/participant.validator.js";

// ─── List Participants for a Survey ──────────────────────
export const listSurveyParticipants = async (
  surveyId: string,
  userId: string,
  page: number,
  limit: number,
  search?: string
) => {
  const survey = await prisma.survey.findFirst({
    where: { id: surveyId, creatorId: userId },
  });
  if (!survey) throw new AppError("Survey not found", 404);

  const where: Record<string, unknown> = { surveyId };
  if (search) {
    where["OR"] = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.participant.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { responses: true } },
      },
    }),
    prisma.participant.count({ where }),
  ]);

  return {
    data: data.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      status: p.status,
      response_count: p._count.responses,
      created_at: p.createdAt.toISOString(),
    })),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
};

// ─── Add Participants ────────────────────────────────────
export const addParticipants = async (
  surveyId: string,
  userId: string,
  input: AddParticipantsInput
) => {
  const survey = await prisma.survey.findFirst({
    where: { id: surveyId, creatorId: userId },
  });
  if (!survey) throw new AppError("Survey not found", 404);

  const created = [];
  for (const p of input.participants) {
    try {
      const participant = await prisma.participant.create({
        data: {
          surveyId,
          email: p.email ?? null,
          name: p.name ?? null,
          userId,
        },
      });
      created.push(participant);
    } catch {
      // Skip duplicates
    }
  }

  return created;
};

// ─── Get Participant Detail ──────────────────────────────
export const getParticipantDetail = async (participantId: string, userId: string) => {
  const participant = await prisma.participant.findFirst({
    where: { id: participantId, userId },
    include: {
      survey: { select: { id: true, title: true } },
      responses: {
        select: {
          id: true,
          surveyId: true,
          completedAt: true,
          timeTakenSec: true,
        },
      },
    },
  });
  if (!participant) throw new AppError("Participant not found", 404);

  return {
    id: participant.id,
    name: participant.name,
    email: participant.email,
    status: participant.status,
    survey_id: participant.survey.id,
    survey_title: participant.survey.title,
    created_at: participant.createdAt.toISOString(),
    responses: participant.responses.map((r) => ({
      response_id: r.id,
      survey_id: r.surveyId,
      completed_at: r.completedAt?.toISOString() ?? null,
      time_taken_sec: r.timeTakenSec,
    })),
    response_count: participant.responses.length,
  };
};

// ─── Update Participant ──────────────────────────────────
export const updateParticipant = async (
  participantId: string,
  userId: string,
  input: UpdateParticipantInput
) => {
  const participant = await prisma.participant.findFirst({
    where: { id: participantId, userId },
  });
  if (!participant) throw new AppError("Participant not found", 404);

  const updated = await prisma.participant.update({
    where: { id: participantId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.status !== undefined && { status: input.status }),
    },
  });

  return updated;
};

// ─── Delete Participant ──────────────────────────────────
export const deleteParticipant = async (participantId: string, userId: string) => {
  const participant = await prisma.participant.findFirst({
    where: { id: participantId, userId },
  });
  if (!participant) throw new AppError("Participant not found", 404);

  await prisma.participant.delete({ where: { id: participantId } });
};

// ─── List All Participants (Global) ──────────────────────
export const listAllParticipants = async (
  userId: string,
  page: number,
  limit: number,
  search?: string
) => {
  const where: Record<string, unknown> = { userId };
  if (search) {
    where["OR"] = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.participant.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        survey: { select: { id: true, title: true } },
        _count: { select: { responses: true } },
      },
    }),
    prisma.participant.count({ where }),
  ]);

  return {
    data: data.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      status: p.status,
      survey_id: p.survey.id,
      survey_title: p.survey.title,
      response_count: p._count.responses,
      created_at: p.createdAt.toISOString(),
    })),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
};

// ─── Bulk Import (CSV text) ──────────────────────────────
export const bulkImportParticipants = async (
  userId: string,
  csvText: string
) => {
  const lines = csvText.trim().split("\n");
  const headers = lines[0]?.split(",").map((h) => h.trim().toLowerCase()) ?? [];
  const emailIdx = headers.indexOf("email");
  const nameIdx = headers.indexOf("name");
  const surveyIdIdx = headers.indexOf("survey_id");

  if (emailIdx === -1 && nameIdx === -1) {
    throw new AppError("CSV must have at least 'email' or 'name' column", 400);
  }
  if (surveyIdIdx === -1) {
    throw new AppError("CSV must have a 'survey_id' column", 400);
  }

  const created = [];
  const errors: Array<{ line: number; error: string }> = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i]?.split(",").map((c) => c.trim()) ?? [];
    const surveyId = cols[surveyIdIdx];
    const email = emailIdx >= 0 ? cols[emailIdx] : undefined;
    const name = nameIdx >= 0 ? cols[nameIdx] : undefined;

    if (!surveyId) {
      errors.push({ line: i + 1, error: "survey_id is required" });
      continue;
    }

    // Check survey ownership
    const survey = await prisma.survey.findFirst({
      where: { id: surveyId, creatorId: userId },
    });
    if (!survey) {
      errors.push({ line: i + 1, error: `Survey ${surveyId} not found or not owned by you` });
      continue;
    }

    try {
      const participant = await prisma.participant.create({
        data: {
          surveyId,
          email: email ?? null,
          name: name ?? null,
          userId,
        },
      });
      created.push(participant);
    } catch {
      errors.push({ line: i + 1, error: "Duplicate or invalid entry" });
    }
  }

  return { created: created.length, errors };
};
