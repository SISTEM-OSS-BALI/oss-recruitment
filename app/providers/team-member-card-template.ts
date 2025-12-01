import { db } from "@/lib/prisma";
import { TeamMemberCardTemplatePayloadCreateModel, TeamMemberCardTemplatePayloadUpdateModel } from "../models/team-member-card-template";



export const GET_TEAM_MEMBER_CARD_TEMPLATES = async () => {
  const result = await db.teamMemberCardTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });
  return result;
};

export const GET_TEAM_MEMBER_CARD_TEMPLATE = async (id: string) => {
  const result = await db.teamMemberCardTemplate.findUnique({
    where: {
      id,
    },
  });
  return result;
};
export const CREATE_TEAM_MEMBER_CARD_TEMPLATE = async (
  payload: TeamMemberCardTemplatePayloadCreateModel
) => {
  const result = await db.teamMemberCardTemplate.create({
    data: payload,
  });

  return result;
};

export const UPDATE_TEAM_MEMBER_CARD_TEMPLATE = async (
  id: string,
  payload: TeamMemberCardTemplatePayloadUpdateModel
) => {
  const result = await db.teamMemberCardTemplate.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_TEAM_MEMBER_CARD_TEMPLATE = async (id: string) => {
  const result = await db.teamMemberCardTemplate.delete({
    where: {
      id,
    },
  });
  return result;
};
