import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/organizations`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    return res;
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 },
    );
  }
}
