import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
    pages: {
      signIn: "/signin",
    },
  },
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|signin|signup).*)"],
};
