"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// middleware.ts
const middleware_1 = require("next-auth/middleware");
const server_1 = require("next/server");
// Halaman publik (kalau nanti pakai matcher global / route lain)
const PUBLIC_PATHS = ["/login", "/register", "/api/public", "/"];
// Mapping prefix route → role yang boleh akses
const roleAccessMap = {
    // HANYA SUPER_ADMIN boleh akses user-management
    "/admin/dashboard/user-management": ["SUPER_ADMIN"],
    "/admin/dashboard/template": ["SUPER_ADMIN"],
    "/admin/dashboard/evaluation": ["SUPER_ADMIN"],
    "/admin/dashboard/assignment-setting": ["SUPER_ADMIN"],
    "/admin/dashboard/procedure-document": ["SUPER_ADMIN"],
    // Halaman lain di bawah /admin boleh ADMIN & SUPER_ADMIN
    "/admin": ["ADMIN", "SUPER_ADMIN"],
    // contoh lain: semua route /user hanya untuk CANDIDATE
    "/user": ["CANDIDATE"],
};
function isPublicPath(pathname) {
    return PUBLIC_PATHS.some((p) => {
        if (p === "/")
            return pathname === "/";
        return pathname === p || pathname.startsWith(`${p}/`);
    });
}
/**
 * Helper biar rule yang PALING SPESIFIK (prefix terpanjang) yang kepakai.
 * Jadi "/admin/dashboard/user-management" bakal menang dibanding "/admin".
 */
function getMatchedRule(pathname) {
    let bestMatch;
    for (const entry of Object.entries(roleAccessMap)) {
        const [prefix, roles] = entry;
        if (pathname.startsWith(prefix)) {
            if (!bestMatch || prefix.length > bestMatch[0].length) {
                bestMatch = [prefix, roles];
            }
        }
    }
    return bestMatch;
}
exports.default = (0, middleware_1.withAuth)(function middleware(req) {
    const { pathname } = req.nextUrl;
    // @ts-ignore - next-auth inject token ke req
    const token = req.nextauth.token;
    const matchedRule = getMatchedRule(pathname);
    // Kalau ada aturan role & user sudah login tapi role tidak cocok → tendang ke /403
    if (matchedRule && (token === null || token === void 0 ? void 0 : token.role)) {
        const [, allowedRoles] = matchedRule;
        if (!allowedRoles.includes(token.role)) {
            return server_1.NextResponse.redirect(new URL("/403", req.url));
        }
    }
    return server_1.NextResponse.next();
}, {
    callbacks: {
        /**
         * Di sini cuma cek "perlu login atau tidak".
         * Kalau `authorized` return false → NextAuth redirect ke pages.signIn ("/login").
         */
        authorized: ({ req, token }) => {
            const { pathname } = req.nextUrl;
            // route publik boleh diakses tanpa login
            if (isPublicPath(pathname))
                return true;
            // sisanya: asalkan ada token (sudah login)
            return !!token;
        },
    },
});
// Route yang dilewatin middleware
exports.config = {
    matcher: [
        // proteksi berdasarkan role
        "/admin/:path*",
        "/user/:path*",
        // tambahkan lain kalau perlu, misalnya:
        // "/candidate/:path*",
    ],
};
