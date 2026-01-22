import db from "@/lib/prisma";
import { UserPayloadCreateModel, UserPayloadUpdateModel } from "../models/user";
import bcrypt from "bcrypt";
import { GeneralError } from "@/app/utils/general-error";

function normalizeDateInput(input: unknown): Date | null | undefined {
  if (input === undefined) return undefined;
  if (input === null || input === "") return null;
  if (input instanceof Date) return input;
  if (typeof input === "string") {
    const parsed = new Date(input);
    return Number.isNaN(parsed.valueOf()) ? null : parsed;
  }
  if (
    typeof input === "object" &&
    input !== null &&
    "toDate" in input &&
    typeof (input as { toDate: () => Date }).toDate === "function"
  ) {
    return (input as { toDate: () => Date }).toDate();
  }
  return null;
}

export const GET_USERS = async () => {
  const result = await db.user.findMany({
    where : {
      role: "ADMIN"
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
}

export const CREATE_USER = async (payload: UserPayloadCreateModel) => {
  const { interestTags, password, ...rest } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const normalizedDob = normalizeDateInput(
    (rest as Record<string, unknown>).date_of_birth
  );
  if (normalizedDob !== undefined) {
    (rest as Record<string, unknown>).date_of_birth = normalizedDob;
  }

  const result = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        ...rest,
        password: hashedPassword,
      },
    });

    if (Array.isArray(interestTags) && interestTags.length > 0) {
      await tx.userInterestTag.createMany({
        data: interestTags
          .filter((interest) => Boolean(interest?.trim()))
          .map((interest) => ({
            user_id: user.id,
            interest: interest.trim(),
          })),
        skipDuplicates: true,
      });
    }

    return tx.user.findUnique({
      where: { id: user.id },
      include: { interestTags: true },
    });
  });

  return result;
};

export const GET_USER = async (id: string) => {
  const result = await db.user.findUnique({
    where: {
      id,
    },
    include: {
      interestTags: true,
    },
  });
  return result;
};

export const UPDATE_USER = async (
  id: string,
  payload: UserPayloadUpdateModel
) => {
  const {
    interestTags,
    password,
    date_of_birth,
    ...restPayload
  } = payload ?? {};

  const normalizedDob = normalizeDateInput(date_of_birth);

  const data: Record<string, unknown> = {
    ...restPayload,
  };

  if (normalizedDob !== undefined) {
    data.date_of_birth = normalizedDob;
  }

  if (password) {
    let plainPassword: string | undefined;
    if (typeof password === "string") {
      plainPassword = password;
    } else if (
      typeof password === "object" &&
      password !== null &&
      "set" in password &&
      typeof (password as { set?: unknown }).set === "string"
    ) {
      plainPassword = (password as { set: string }).set;
    }

    if (plainPassword) {
      data.password = await bcrypt.hash(plainPassword, 10);
    }
  }

  const result = await db.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: {
        id,
      },
      data,
    });

    if (Array.isArray(interestTags)) {
      await tx.userInterestTag.deleteMany({
        where: { user_id: id },
      });

      if (interestTags.length > 0) {
        await tx.userInterestTag.createMany({
          data: interestTags
            .filter((interest) => Boolean(interest?.trim()))
            .map((interest) => ({
              user_id: id,
              interest: interest.trim(),
            })),
          skipDuplicates: true,
        });
      }
    }

    return tx.user.findUnique({
      where: { id: updated.id },
      include: { interestTags: true },
    });
  });

  return result;
};

export const DELETE_USER = async (id: string) => {
  const result = await db.user.delete({
    where: {
      id,
    },
  });
  return result;
};

export const GET_USER_BY_APPLICANT_ID = async (applicant_id: string) => {
  const result = await db.user.findFirst({
    where: {
      Applicant: {
        some: {
          id: applicant_id,
        },
      },
    },
  });
  return result;
}

export const UPDATE_USER_DOCUMENT = async (user_id: string, payload: UserPayloadUpdateModel) => {
  const result = await db.user.update({
    where: {
      id: user_id,
    },

    data: {
      no_identity: payload.no_identity,
      no_identity_url: payload.no_identity_url,
    },
  });
  return result;
}

export const UPDATE_NO_UNIQUE = async (user_id: string, payload: UserPayloadUpdateModel) => {
  const result = await db.user.update({
    where: {
      id: user_id,
    },    
    data: {
      no_unique: payload.no_unique,
    },
  });
  return result;
}

export const UPDATE_MEMBER_CARD = async (user_id: string, payload: UserPayloadUpdateModel) => {
  const result = await db.user.update({
    where: {
      id: user_id,
    },    
    data: {
      member_card_url: payload.member_card_url,
    },
  });
  return result;
}

export const UPDATE_TEAM_MEMBER_CARD = async (
  user_id: string,
  payload: UserPayloadUpdateModel
) => {
  const result = await db.user.update({
    where: {
      id: user_id,
    },
    data: {
      team_member_card_url: payload.team_member_card_url,
    },
  });
  return result;
};

export const CHANGE_USER_PASSWORD = async (
  user_id: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await db.user.findUnique({
    where: { id: user_id },
    select: { id: true, password: true },
  });

  if (!user?.password) {
    throw new GeneralError({
      code: 404,
      details: "User not found",
      error: "User not found",
      error_code: "USER_NOT_FOUND",
    });
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    throw new GeneralError({
      code: 400,
      details: "Current password is incorrect",
      error: "Current password is incorrect",
      error_code: "INVALID_PASSWORD",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.user.update({
    where: { id: user_id },
    data: { password: hashedPassword },
    select: { id: true },
  });
};
