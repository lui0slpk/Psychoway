import nodemailer from "nodemailer";

// Transporter configurado con Gmail SMTP
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "psychowaysena@gmail.com",
    pass: "fqoc twlg ttgk zohl",
  },
});

transporter.verify().then(() => {
  console.log("✅ Listo para enviar emails");
});

/**
 * Envía un correo de recuperación de contraseña con un enlace para restablecer.
 * @param {string} email - Correo del usuario
 * @param {string} resetLink - URL completa con el token (ej: http://localhost:5173/reset-password?token=abc123)
 */
export const sendPasswordResetEmail = async (email, resetLink) => {
  const mailOptions = {
    from: '"Psychoway" <psychowaysena@gmail.com>',
    to: email,
    subject: "Recuperación de contraseña - Psychoway",
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #eef2f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #eef2f5; padding: 40px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="500" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <!-- Header verde -->
                <tr>
                  <td style="background-color: #007832; padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Psychoway</h1>
                    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 14px;">Recuperación de contraseña</p>
                  </td>
                </tr>

                <!-- Contenido -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333; margin: 0 0 15px 0; font-size: 20px;">¡Hola!</h2>
                    <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hemos recibido una solicitud para restablecer tu contraseña en Psychoway.
                      Haz clic en el siguiente botón para crear una nueva contraseña:
                    </p>

                    <!-- Botón -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 10px 0 25px 0;">
                          <a href="${resetLink}" 
                             style="background-color: #005222; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
                            Restablecer contraseña
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #888; font-size: 13px; line-height: 1.5; margin: 0 0 15px 0;">
                      Este enlace expirará en <strong>1 hora</strong>. Si no solicitaste este cambio, puedes ignorar este correo.
                    </p>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

                    <p style="color: #aaa; font-size: 12px; line-height: 1.5; margin: 0;">
                      Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
                      <a href="${resetLink}" style="color: #007832; word-break: break-all;">${resetLink}</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                    <p style="color: #999; font-size: 12px; margin: 0;">Psychoway © 2024 — Todos los derechos reservados</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("📧 Correo de recuperación enviado:", info.messageId);
  return info;
};
