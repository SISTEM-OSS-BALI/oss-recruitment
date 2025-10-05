import db from "@/lib/prisma";

export const DELETE_SCHEDULE_TIME = async (id: string) => {
    const result = await db.scheduleTime.delete({
        where: {
            time_id: id,
        },
    });
    return result;
};