export const registrationTemplate = (userName: string | undefined, url: string) => {
  const logoUrl = process.env.EMAIL_LOGO_URL || ''; 

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>VERIFY YOUR ${process.env.PROJECT_NAME?.toUpperCase()} ACCOUNT</title>
    </head>
    <body style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <center style="width: 100%; background-color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto;" class="email-container">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: auto; border-collapse: collapse;">
            
            <tr>
              <td style="padding: 60px 0 40px 0; text-align: center; background-color: #000000;">
                ${logoUrl ? `<img src="${logoUrl}" width="150" alt="Atomecom Logo" style="display: block; margin: auto; border: 0;">` : 
                `<h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 4px; font-weight: 900; text-transform: uppercase;">${process.env.PROJECT_NAME}</h1>`}
              </td>
            </tr>

            <tr>
              <td style="padding: 50px 40px 20px 40px; text-align: left; background-color: #ffffff;">
                <h2 style="margin: 0; font-size: 22px; line-height: 30px; color: #111111; font-weight: 700;">Verify your email address</h2>
                <p style="margin: 20px 0; font-size: 16px; line-height: 26px; color: #444444;">
                  Hi ${userName},<br><br>
                  Thank you for joining Atomecom. To complete your account setup and ensure the security of your information, please verify your email address by clicking the button below.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 20px 40px 40px 40px; text-align: left; background-color: #ffffff;">
                <table border="0" cellpadding="0" cellspacing="0" style="margin: 0;">
                  <tr>
                    <td align="center" style="border-radius: 4px; background-color: #000000;">
                      <a href="${url}" target="_blank" style="padding: 16px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                        Verify Account
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 0 40px 40px 40px; text-align: left; background-color: #ffffff; border-bottom: 1px solid #f0f0f0;">
                <p style="margin: 0; font-size: 13px; line-height: 20px; color: #888888;">
                  <strong>Note:</strong> This link will expire in 24 hours. If you did not create an account with Atomecom, please ignore this email or contact our support team.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 40px 40px; text-align: center; color: #999999; font-size: 12px; line-height: 18px; background-color: #fafafa;">
                <p style="margin: 0; font-weight: bold; color: #666666; text-transform: uppercase; letter-spacing: 1px;">Atomecom System</p>
                <p style="margin: 10px 0 0 0;">
                  Designed and developed by <a href="https://sanghynh.info.vn" style="color: #000000; text-decoration: underline; font-weight: 600;">Sang Huynh</a>
                </p>
                <div style="margin-top: 20px;">
                  <a href="#" style="color: #999999; text-decoration: none; margin: 0 10px;">Privacy Policy</a> | 
                  <a href="#" style="color: #999999; text-decoration: none; margin: 0 10px;">Terms of Service</a>
                </div>
              </td>
            </tr>

          </table>
        </div>
      </center>
    </body>
    </html>
  `;
};