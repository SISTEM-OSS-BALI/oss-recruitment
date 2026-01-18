import middleware from "./lib/middleware";

export default middleware;

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
