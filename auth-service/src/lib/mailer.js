import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

const FROM = `"SCOPH — Sistema de Salud" <${process.env.SMTP_USER}>`

/**
 * Envía las credenciales de acceso al nuevo usuario creado por un ADMIN.
 * @param {{ to: string, nombre: string, username: string, password: string }} opts
 */
export async function sendCredentialsMail({ to, nombre, username, password }) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Tu cuenta en SCOPH fue creada — Credenciales de acceso',
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cuenta creada</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1a56db;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">SCOPH — Sistema de Salud</p>
              <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;">Sistema de Control de Operaciones y Programas de Salud</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:16px;color:#111827;">Hola, <strong>${nombre}</strong></p>
              <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.6;">
                Un administrador ha creado tu cuenta en el sistema SCOPH. A continuación encontrarás tus credenciales de acceso:
              </p>

              <!-- Credentials box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                          <span style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Usuario</span>
                          <br/>
                          <span style="font-size:18px;font-weight:700;color:#1a56db;font-family:'Courier New',monospace;">${username}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0 0;">
                          <span style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Contraseña temporal</span>
                          <br/>
                          <span style="font-size:18px;font-weight:700;color:#1a56db;font-family:'Courier New',monospace;">${password}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Warning box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">
                      <strong>⚠️ Importante:</strong> Al iniciar sesión por primera vez, el sistema te pedirá que establezcas una nueva contraseña. Esta contraseña temporal no podrá usarse después de ese cambio.
                    </p>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />
              <p style="margin:0;font-size:13px;color:#9ca3af;">
                Si no esperabas este correo, contáctate con el administrador del sistema.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} SCOPH — Todos los derechos reservados</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  })
}

/**
 * Envía el correo de verificación de cuenta con el código de 6 dígitos.
 * @param {{ to: string, nombre: string, code: string }} opts
 */
export async function sendVerificationCodeMail({ to, nombre, code }) {
  const expiresMin = parseInt(process.env.VERIFICATION_TOKEN_EXPIRES_MINUTES || '10', 10)

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Verifica tu cuenta — SCOPH',
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verificación de cuenta</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1a56db;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">SCOPH — Sistema de Salud</p>
              <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;">Sistema de Control de Operaciones y Programas de Salud</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:16px;color:#111827;">Hola, <strong>${nombre}</strong></p>
              <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.6;">
                Para activar tu cuenta, ingresa el siguiente código de verificación:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:24px 0;">
                    <div style="display:inline-block;background:#f0f4ff;border:2px dashed #1a56db;border-radius:12px;padding:20px 48px;">
                      <span style="font-size:40px;font-weight:800;letter-spacing:10px;color:#1a56db;font-family:'Courier New',monospace;">${code}</span>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;">
                Este código expira en <strong>${expiresMin} minutos</strong>.
              </p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />
              <p style="margin:0;font-size:13px;color:#9ca3af;">Si no esperabas este correo, contáctate con el administrador.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} SCOPH — Todos los derechos reservados</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  })
}

/**
 * Envía el correo de restablecimiento de contraseña con el código de 6 dígitos.
 * @param {{ to: string, nombre: string, code: string }} opts
 */
export async function sendPasswordResetMail({ to, nombre, code }) {
  const expiresMin = parseInt(process.env.VERIFICATION_TOKEN_EXPIRES_MINUTES || '10', 10)

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Restablece tu contraseña — SCOPH',
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Restablecer contraseña</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#dc2626;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">SCOPH — Sistema de Salud</p>
              <p style="margin:6px 0 0;color:#fecaca;font-size:13px;">Solicitud de restablecimiento de contraseña</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:16px;color:#111827;">Hola, <strong>${nombre}</strong></p>
              <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta. Ingresa el siguiente código para continuar:
              </p>
              <!-- Code box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:24px 0;">
                    <div style="display:inline-block;background:#fff5f5;border:2px dashed #dc2626;border-radius:12px;padding:20px 48px;">
                      <span style="font-size:40px;font-weight:800;letter-spacing:10px;color:#dc2626;font-family:'Courier New',monospace;">${code}</span>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;">
                Este código expira en <strong>${expiresMin} minutos</strong>.
              </p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />
              <p style="margin:0;font-size:13px;color:#9ca3af;">
                Si no solicitaste este cambio, ignora este correo. Tu contraseña no será modificada.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} SCOPH — Todos los derechos reservados</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  })
}
