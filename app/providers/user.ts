import db from "@/lib/prisma";
import { UserPayloadCreateModel, UserPayloadUpdateModel } from "../models/user";
import bcrypt from "bcrypt";

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
    data.password = await bcrypt.hash(password, 10);
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
