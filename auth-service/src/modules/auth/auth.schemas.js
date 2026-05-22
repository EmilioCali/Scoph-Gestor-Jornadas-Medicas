export const usuarioResponse = {
  type: 'object',
  properties: {
    _id: { type: 'string', example: 'usr_a1b2c3d4e5f6' },
    nombre: { type: 'string', example: 'Daniel' },
    apellido: { type: 'string', example: 'Gómez' },
    username: { type: 'string', example: 'dgomez' },
    correo: { type: 'string', example: 'daniel@gmail.com' },
    rol: { type: 'string', enum: ['ADMIN', 'MEDICO', 'ENFERMERO', 'ASISTENTE'] },
    telefono: { type: 'string', example: '12345678' },
    fotoPerfil: { type: 'string', nullable: true },
    isActive: { type: 'boolean' },
    mustChangePassword: { type: 'boolean' },
    emailVerificado: { type: 'boolean' },
    ultimoAcceso: { type: 'string', format: 'date-time', nullable: true },
    creadoPor: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

const errorResponse = {
  type: 'object',
  properties: {
    ok: { type: 'boolean', example: false },
    message: { type: 'string', example: 'Descripción del error' }
  }
}

export const loginSchema = {
  tags: ['Autenticación'],
  summary: 'Iniciar sesión',
  description: 'Autentica al usuario con su username o correo y retorna un token JWT.',
  body: {
    type: 'object',
    required: ['password'],
    properties: {
      username: { type: 'string', example: 'dgomez', description: 'Username del usuario' },
      correo: { type: 'string', example: 'daniel@gmail.com', description: 'Correo del usuario' },
      password: { type: 'string', minLength: 1, example: 'miContraseña123' }
    },
    description: 'Se requiere password y al menos uno de: username o correo'
  },
  response: {
    200: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        token: { type: 'string', description: 'Token JWT válido por 8 horas' },
        mustChangePassword: { type: 'boolean', description: 'Si es true, el usuario debe cambiar su contraseña antes de continuar' },
        user: usuarioResponse
      }
    },
    401: errorResponse
  }
}

export const registerSchema = {
  tags: ['Usuarios'],
  summary: 'Crear usuario',
  description: 'Crea un nuevo usuario. Solo ADMIN. El sistema genera una contraseña temporal y la envía automáticamente al correo del nuevo usuario.',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['nombre', 'apellido', 'username', 'correo', 'rol'],
    properties: {
      nombre: { type: 'string', minLength: 1, example: 'Daniel' },
      apellido: { type: 'string', minLength: 1, example: 'Gómez' },
      username: { type: 'string', minLength: 3, example: 'dgomez' },
      correo: { type: 'string', example: 'daniel@gmail.com' },
      rol: { type: 'string', enum: ['ADMIN', 'MEDICO', 'ENFERMERO', 'ASISTENTE'] },
      telefono: { type: 'string', example: '12345678' }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        user: usuarioResponse
      }
    },
    400: errorResponse,
    403: errorResponse
  }
}

export const changePasswordSchema = {
  tags: ['Autenticación'],
  summary: 'Cambiar contraseña',
  description: 'Permite al usuario autenticado cambiar su contraseña. Obligatorio en el primer inicio de sesión cuando mustChangePassword = true.',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['currentPassword', 'newPassword'],
    properties: {
      currentPassword: { type: 'string', minLength: 1, example: 'contraseñaTemporal', description: 'Contraseña actual o temporal recibida por correo' },
      newPassword: { type: 'string', minLength: 8, example: 'nuevaContraseña123', description: 'Nueva contraseña (mínimo 8 caracteres)' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Contraseña actualizada correctamente' }
      }
    },
    400: errorResponse
  }
}

export const verifyEmailSchema = {
  tags: ['Autenticación'],
  summary: 'Verificar correo electrónico',
  description: 'Verifica la cuenta del usuario usando el código de 6 dígitos enviado a su correo. El código expira según VERIFICATION_TOKEN_EXPIRES_MINUTES (default: 10 min).',
  body: {
    type: 'object',
    required: ['correo', 'code'],
    properties: {
      correo: { type: 'string', example: 'daniel@gmail.com', description: 'Correo del usuario a verificar' },
      code: { type: 'string', minLength: 6, maxLength: 6, example: '482910', description: 'Código de 6 dígitos recibido por correo' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Correo verificado correctamente' }
      }
    },
    400: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Descripción del error' }
      }
    }
  }
}

export const forgotPasswordSchema = {
  tags: ['Autenticación'],
  summary: 'Solicitar restablecimiento de contraseña',
  description: 'Envía un código de 6 dígitos al correo del usuario para restablecer su contraseña. El código expira según VERIFICATION_TOKEN_EXPIRES_MINUTES (default: 10 min).',
  body: {
    type: 'object',
    required: ['correo'],
    properties: {
      correo: { type: 'string', example: 'daniel@gmail.com' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Si el correo existe, recibirás un código para restablecer tu contraseña' }
      }
    },
    400: errorResponse
  }
}

export const resetPasswordSchema = {
  tags: ['Autenticación'],
  summary: 'Restablecer contraseña con código',
  description: 'Restablece la contraseña usando el código de 6 dígitos recibido por correo.',
  body: {
    type: 'object',
    required: ['correo', 'code', 'newPassword'],
    properties: {
      correo: { type: 'string', example: 'daniel@gmail.com' },
      code: { type: 'string', minLength: 6, maxLength: 6, example: '391047' },
      newPassword: { type: 'string', minLength: 8, example: 'nuevaContraseñaSegura123' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Contraseña restablecida correctamente' }
      }
    },
    400: errorResponse
  }
}
