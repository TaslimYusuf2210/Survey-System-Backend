import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import type {
  CreateSectionInput,
  UpdateSectionInput,
  ReorderSectionsInput,
  CreateQuestionInput,
  UpdateQuestionInput,
  ReorderQuestionsInput,
  CreateOptionInput,
  UpdateOptionInput,
} from "../validators/survey.validator.js";

// ─── Verify Survey Ownership ─────────────────────────────
const verifySurveyOwnership = async (surveyId: string, userId: string) => {
  const survey = await prisma.survey.findFirst({
    where: { id: surveyId, creatorId: userId },
  });
  if (!survey) throw new AppError("Survey not found", 404);
  return survey;
};

// ─── Create Section ──────────────────────────────────────
export const createSection = async (
  surveyId: string,
  userId: string,
  input: CreateSectionInput
) => {
  await verifySurveyOwnership(surveyId, userId);

  const section = await prisma.surveySection.create({
    data: {
      surveyId,
      title: input.title,
      sortOrder: input.sort_order ?? 0,
      questions: input.questions
        ? {
            create: input.questions.map((q) => ({
              text: q.text,
              type: q.type,
              required: q.required ?? true,
              sortOrder: q.sort_order ?? 0,
              options: q.options
                ? {
                    create: q.options.map((o) => ({
                      value: o.value,
                      sortOrder: o.sort_order ?? 0,
                    })),
                  }
                : undefined,
            })),
          }
        : undefined,
    },
    include: {
      questions: {
        include: { options: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return section;
};

// ─── Update Section ──────────────────────────────────────
export const updateSection = async (
  sectionId: string,
  userId: string,
  input: UpdateSectionInput
) => {
  const section = await prisma.surveySection.findUnique({
    where: { id: sectionId },
    include: { survey: true },
  });
  if (!section) throw new AppError("Section not found", 404);
  if (section.survey.creatorId !== userId) throw new AppError("Forbidden", 403);

  const updated = await prisma.surveySection.update({
    where: { id: sectionId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.sort_order !== undefined && { sortOrder: input.sort_order }),
    },
  });

  return updated;
};

// ─── Delete Section ──────────────────────────────────────
export const deleteSection = async (sectionId: string, userId: string) => {
  const section = await prisma.surveySection.findUnique({
    where: { id: sectionId },
    include: { survey: true },
  });
  if (!section) throw new AppError("Section not found", 404);
  if (section.survey.creatorId !== userId) throw new AppError("Forbidden", 403);

  await prisma.surveySection.delete({ where: { id: sectionId } });
};

// ─── Reorder Sections ────────────────────────────────────
export const reorderSections = async (
  userId: string,
  input: ReorderSectionsInput
) => {
  const updates = input.section_ids.map((id, index) =>
    prisma.surveySection.update({
      where: { id },
      data: { sortOrder: index },
    })
  );

  await prisma.$transaction(updates);
};

// ─── Create Question ─────────────────────────────────────
export const createQuestion = async (
  sectionId: string,
  userId: string,
  input: CreateQuestionInput
) => {
  const section = await prisma.surveySection.findUnique({
    where: { id: sectionId },
    include: { survey: true },
  });
  if (!section) throw new AppError("Section not found", 404);
  if (section.survey.creatorId !== userId) throw new AppError("Forbidden", 403);

  const question = await prisma.surveyQuestion.create({
    data: {
      sectionId,
      text: input.text,
      type: input.type,
      required: input.required ?? true,
      sortOrder: input.sort_order ?? 0,
      options: input.options
        ? {
            create: input.options.map((o) => ({
              value: o.value,
              sortOrder: o.sort_order ?? 0,
            })),
          }
        : undefined,
    },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
    },
  });

  return question;
};

// ─── Update Question ─────────────────────────────────────
export const updateQuestion = async (
  questionId: string,
  userId: string,
  input: UpdateQuestionInput
) => {
  const question = await prisma.surveyQuestion.findUnique({
    where: { id: questionId },
    include: { section: { include: { survey: true } } },
  });
  if (!question) throw new AppError("Question not found", 404);
  if (question.section.survey.creatorId !== userId) throw new AppError("Forbidden", 403);

  const updated = await prisma.surveyQuestion.update({
    where: { id: questionId },
    data: {
      ...(input.text !== undefined && { text: input.text }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.required !== undefined && { required: input.required }),
      ...(input.sort_order !== undefined && { sortOrder: input.sort_order }),
    },
  });

  return updated;
};

// ─── Delete Question ─────────────────────────────────────
export const deleteQuestion = async (questionId: string, userId: string) => {
  const question = await prisma.surveyQuestion.findUnique({
    where: { id: questionId },
    include: { section: { include: { survey: true } } },
  });
  if (!question) throw new AppError("Question not found", 404);
  if (question.section.survey.creatorId !== userId) throw new AppError("Forbidden", 403);

  await prisma.surveyQuestion.delete({ where: { id: questionId } });
};

// ─── Reorder Questions ───────────────────────────────────
export const reorderQuestions = async (
  userId: string,
  input: ReorderQuestionsInput
) => {
  const updates = input.question_ids.map((id, index) =>
    prisma.surveyQuestion.update({
      where: { id },
      data: { sortOrder: index },
    })
  );

  await prisma.$transaction(updates);
};

// ─── Create Option ───────────────────────────────────────
export const createOption = async (
  questionId: string,
  userId: string,
  input: CreateOptionInput
) => {
  const question = await prisma.surveyQuestion.findUnique({
    where: { id: questionId },
    include: { section: { include: { survey: true } } },
  });
  if (!question) throw new AppError("Question not found", 404);
  if (question.section.survey.creatorId !== userId) throw new AppError("Forbidden", 403);

  const option = await prisma.questionOption.create({
    data: {
      questionId,
      value: input.value,
      sortOrder: input.sort_order ?? 0,
    },
  });

  return option;
};

// ─── Update Option ───────────────────────────────────────
export const updateOption = async (
  optionId: string,
  userId: string,
  input: UpdateOptionInput
) => {
  const option = await prisma.questionOption.findUnique({
    where: { id: optionId },
    include: {
      question: {
        include: { section: { include: { survey: true } } },
      },
    },
  });
  if (!option) throw new AppError("Option not found", 404);
  if (option.question.section.survey.creatorId !== userId) throw new AppError("Forbidden", 403);

  const updated = await prisma.questionOption.update({
    where: { id: optionId },
    data: {
      ...(input.value !== undefined && { value: input.value }),
      ...(input.sort_order !== undefined && { sortOrder: input.sort_order }),
    },
  });

  return updated;
};

// ─── Delete Option ───────────────────────────────────────
export const deleteOption = async (optionId: string, userId: string) => {
  const option = await prisma.questionOption.findUnique({
    where: { id: optionId },
    include: {
      question: {
        include: { section: { include: { survey: true } } },
      },
    },
  });
  if (!option) throw new AppError("Option not found", 404);
  if (option.question.section.survey.creatorId !== userId) throw new AppError("Forbidden", 403);

  await prisma.questionOption.delete({ where: { id: optionId } });
};
