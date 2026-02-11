import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "file 필드가 필요합니다." },
        { status: 400 }
      );
    }

    const contentType = file.type || "application/octet-stream";

    const session = await auth();
    const token = session?.access_token;
    if (!token) {
      return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
    }

    const presignRes = await fetch(
      `${
        process.env.NEXT_PUBLIC_SERVER_URL
      }/api/articles/presigned-url?contentType=${encodeURIComponent(
        contentType
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!presignRes.ok) {
      const text = await presignRes.text().catch(() => "");
      return NextResponse.json(
        { error: `presigned-url 실패: ${text}` },
        { status: 502 }
      );
    }
    const url = (await presignRes.json()).data.url;

    // 2) Next 서버에서 S3로 PUT (브라우저가 아니라 서버가 S3에 직접 요청)
    const arrayBuffer = await file.arrayBuffer();
    const putRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: Buffer.from(arrayBuffer),
    });

    if (!putRes.ok) {
      const text = await putRes.text().catch(() => "");
      return NextResponse.json(
        { error: `S3 PUT 실패: ${text}` },
        { status: 502 }
      );
    }

    // 업로드 성공. 필요하면 퍼블릭 URL 생성 규칙에 맞게 location을 만들어서 내려주세요.
    return NextResponse.json({ ok: true, url: url.split("?")[0] });
  } catch (e) {
    console.error("Error in uploading image: ", e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
