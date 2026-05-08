export const sendOtp = (otp: number) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Verification Code</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Sora:wght@300;400;600;700&display=swap');
  </style>
</head>
<body style="margin:0; padding:0; background-color:#0a0a0f; font-family:'Sora', sans-serif;">

  <span style="display:none; font-size:1px; color:#0a0a0f; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
    Your one-time verification code — valid for 10 minutes.
  </span>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f; padding: 40px 16px;">
    <tr>
      <td align="center">

        <table role="presentation" width="100%" style="max-width:520px; background-color:#111118; border-radius:16px; overflow:hidden; border:1px solid #1e1e2e;">

          <tr>
            <td style="background: linear-gradient(90deg, #6c63ff 0%, #ff6584 50%, #43e97b 100%); height:4px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #6c63ff, #ff6584); border-radius:12px; padding:10px 18px;">
                    <span style="font-family:'Space Mono', monospace; font-size:18px; font-weight:700; color:#ffffff; letter-spacing:2px;">SARAHA</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top: 1px solid #1e1e2e; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 36px 40px 10px 40px;">
              <p style="margin:0 0 8px 0; font-size:22px; font-weight:700; color:#f0f0ff; letter-spacing:-0.3px;">
                Verify your identity
              </p>
              <p style="margin:0 0 28px 0; font-size:14px; color:#6b6b8a; line-height:1.6;">
                Use the code below to complete your verification. This code is valid for <strong style="color:#9d9dbf;">10 minutes</strong> and can only be used once.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #14141f, #1a1a2e); border-radius:12px; border:1px solid #2a2a40; padding: 28px 20px;">
                    <p style="margin:0 0 6px 0; font-size:11px; font-weight:600; color:#6b6b8a; letter-spacing:3px; text-transform:uppercase;">One-Time Password</p>
                    <p style="margin:0; font-family:'Space Mono', monospace; font-size:42px; font-weight:700; letter-spacing:14px; color:#ffffff; text-shadow: 0 0 30px rgba(108, 99, 255, 0.5);">
                      {${otp}}
                    </p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="background-color:#1a1020; border-left:3px solid #ff6584; border-radius:0 8px 8px 0; padding:14px 16px;">
                    <p style="margin:0; font-size:13px; color:#9d7a8a; line-height:1.5;">
                      🔒 &nbsp;Never share this code with anyone. Saraha will <strong style="color:#ff6584;">never</strong> ask for it via phone or chat.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top: 1px solid #1e1e2e; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 40px 36px 40px;">
              <p style="margin:0 0 4px 0; font-size:12px; color:#3d3d5c; line-height:1.6;">
                If you didn't request this code, you can safely ignore this email. No action is needed.
              </p>
              <p style="margin:0; font-size:12px; color:#3d3d5c;">
                &copy; 2025 Saraha &nbsp;&middot;&nbsp;
                <a href="#" style="color:#6c63ff; text-decoration:none;">Unsubscribe</a> &nbsp;&middot;&nbsp;
                <a href="#" style="color:#6c63ff; text-decoration:none;">Privacy Policy</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
};