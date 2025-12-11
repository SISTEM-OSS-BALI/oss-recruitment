"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = global;
const datasourceUrl = process.env.DATABASE_URL;
if (!datasourceUrl) {
    throw new Error("DATABASE_URL environment variable is not set.");
}
exports.db = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : new client_1.PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
});
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.db;
exports.default = exports.db;
