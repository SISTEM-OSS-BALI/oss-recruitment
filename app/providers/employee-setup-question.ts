import db from "@/lib/prisma";
import {
  EmployeeSetupPayloadQuestionUpdateModel,
  EmployeeSetupQuestionPayloadCreateModel,
} from "../models/employee-setup-question";

export const CREATE_EMPLOYEE_QUESTION_SETUP = async (
  payload: EmployeeSetupQuestionPayloadCreateModel
) => {
  const result = await db.employeeSetupQuestion.create({
    data: payload,
  });

  return result;
};

export const UPDATE_EMPLOYEE_QUESTION_SETUP = async (
  id: string,
  payload: EmployeeSetupPayloadQuestionUpdateModel
) => {
  const result = await db.employeeSetupQuestion.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_EMPLOYEE_QUESTION_SETUP = async (id: string) => {
  const result = await db.employeeSetupQuestion.delete({
    where: {
      id,
    },
  });
  return result;
};
