import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { company, name, email, phone, content } = await req.json() as {
    company: string;
    name: string;
    email: string;
    phone?: string;
    content: string;
  };

  if (!company || !name || !email || !content) {
    return NextResponse.json({ error: "必須項目が入力されていません" }, { status: 400 });
  }

  // DBに保存
  await prisma.consultationRequest.create({
    data: { company, name, email, phone: phone || null, content },
  });

  // メール送信（SMTP未設定時はスキップ）
  if (process.env.SMTP_USER && process.env.SMTP_PASS &&
      !process.env.SMTP_USER.includes("your_gmail")) {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"AI Tool Compass" <${process.env.SMTP_USER}>`,
      to: "kana.5939@gmail.com",
      replyTo: email,
      subject: `【相談申込】${company} / ${name}`,
      text: [
        `会社名：${company}`,
        `担当者名：${name}`,
        `メールアドレス：${email}`,
        `電話番号：${phone || "未入力"}`,
        "",
        `相談内容：`,
        content,
      ].join("\n"),
    });
  }

  return NextResponse.json({ ok: true });
}
