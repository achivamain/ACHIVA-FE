// 게시물 신고
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { postId, reporterName } = await req.json();

  // Nodemailer 설정 (예: Gmail, SMTP, SendGrid)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: "contact@achiva.kr",
      subject: `게시물 신고`,
      text: `https://www.iworkouttoday.com/post/${postId} 게시물에 대한 신고가 접수되었습니다.
      신고자: ${reporterName}`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "fail" }, { status: 500 });
  }
}
