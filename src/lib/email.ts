import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || "Kyma <onboarding@resend.dev>";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface SendResult {
  success: boolean;
  error?: string;
  /** When no Resend key is set, the code is logged to console; this flag tells callers. */
  devMode?: boolean;
}

/**
 * Send a 6-digit verification code to the user's email.
 * If RESEND_API_KEY is not configured, logs to console (dev fallback).
 */
export async function sendVerificationCode(
  email: string,
  code: string
): Promise<SendResult> {
  if (!resend) {
    console.log(
      `\n📧 [DEV MODE — RESEND_API_KEY not set]\n` +
        `   To: ${email}\n` +
        `   Code: ${code}\n` +
        `   (Set RESEND_API_KEY in .env.local to send real emails)\n`
    );
    return { success: true, devMode: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: emailFrom,
      to: [email],
      subject: "[Kyma] 이메일 인증 코드",
      html: buildEmailHtml(code),
      text: buildEmailText(code),
    });

    if (error) {
      console.error("[email.sendVerificationCode]", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "이메일 발송 실패";
    console.error("[email.sendVerificationCode]", err);
    return { success: false, error: msg };
  }
}

function buildEmailHtml(code: string): string {
  return `
<!DOCTYPE html>
<html lang="ko">
  <body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:480px;margin:40px auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #f0f0f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="margin:0;color:#f06f90;font-size:28px;font-weight:700;">Kyma <span style="font-size:14px;color:#999;font-weight:400;">きょうま</span></h1>
      </div>
      <h2 style="margin:0 0 12px;color:#1a1a1a;font-size:18px;">이메일 인증 코드</h2>
      <p style="margin:0 0 24px;color:#666;font-size:14px;line-height:1.6;">
        아래 6자리 코드를 회원가입 화면에 입력해주세요.<br/>
        이 코드는 <strong>10분간 유효</strong>합니다.
      </p>
      <div style="background:#fdf2f5;border:1px solid #fce7ee;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#f06f90;font-family:'SF Mono',Consolas,monospace;">${code}</div>
      </div>
      <p style="margin:0;color:#999;font-size:12px;line-height:1.6;">
        본인이 요청하지 않은 경우 이 메일을 무시해주세요. 누군가 회원님의 이메일을 사용하려 시도했을 수 있습니다.
      </p>
    </div>
  </body>
</html>
`.trim();
}

function buildEmailText(code: string): string {
  return `[Kyma] 이메일 인증 코드\n\n인증 코드: ${code}\n\n이 코드를 회원가입 화면에 입력해주세요. 10분간 유효합니다.\n\n본인이 요청하지 않은 경우 이 메일을 무시해주세요.`;
}
