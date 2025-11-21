import db from "@/lib/prisma";
import {
  EmployeeSetupPayloadCreateModel,
  EmployeeSetupPayloadUpdateModel,
} from "../models/employee-setup";

export const GET_EMPLOYEE_SETUPS = async () => {
  const result = await db.employeeSetup.findMany({
    include: {
      employeeSetupQuestion: true,
    },
  });
  return result;
};


export const GET_EMPLOYEE_SETUP = async (id: string) => {
  const result = await db.employeeSetup.findUnique({
    where: {
      id,
    },
    include: {
      employeeSetupQuestion: true,
    },
  });
  return result;
};
export const CREATE_EMPLOYEE_SETUP = async (payload: EmployeeSetupPayloadCreateModel) => {
  const result = await db.employeeSetup.create({
    data: payload,
  });

  return result;
};

export const UPDATE_EMPLOYEE_SETUP = async (
  id: string,
  payload: EmployeeSetupPayloadUpdateModel
) => {
  const result = await db.employeeSetup.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

export const DELETE_EMPLOYEE_SETUP = async (id: string) => {
  const result = await db.employeeSetup.delete({
    where: {
      id,
    },
  });
  return result;
};
