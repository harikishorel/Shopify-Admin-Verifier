// import { NextResponse } from "next/server";\
import { NextResponse } from "next/server";

export default function middleware(req) {
  const URL = process.env.URL;
  let verify = req.cookies.get("next-auth.session-token");
  let url = req.url;

  if (!verify && url.includes("/Dashboard")) {
    return NextResponse.redirect(`${URL}/Verifier/Login`);
  }

  if (!verify && url.includes("/Properties")) {
    return NextResponse.redirect(`${URL}/Verifier/Login`);
  }

  if (!verify && url.includes("/Profile")) {
    return NextResponse.redirect(`${URL}/Verifier/Login`);
  }
  if (!verify && url.includes("/Payment")) {
    return NextResponse.redirect(`${URL}/Verifier/Login`);
  }
  if (!verify && url.includes("/Property")) {
    return NextResponse.redirect(`${URL}/Verifier/Login`);
  }
}

export const config = {
  matcher: [
    "/Verifier/:path*",
    "/Properties/:path*",
    "/Profile/:path*",
    "/Payment/:path*",
    "/Property/:path*",
  ],
};
