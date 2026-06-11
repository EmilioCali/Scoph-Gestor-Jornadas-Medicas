import mongoose from 'mongoose'
import { randomBytes } from 'crypto'

export const ROLES = ['ADMIN', 'MEDICO', 'ENFERMERO', 'ASISTENTE']

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => 'usr_' + randomBytes(6).toString('hex')
    },

    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    correo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: { type: String, required: true },

    rol: {
      type: String,
      enum: ROLES,
      required: true,
      default: 'ASISTENTE'
    },

    telefono: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: (value) => value === null || value === '' || /^\d{8}$/.test(value),
        message: 'El telefono debe tener exactamente 8 digitos'
      }
    },
    fotoPerfil: { type: String, default: null },

    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: true },

    activationToken: { type: String, default: null },
    activationTokenExpires: { type: Date, default: null },

    resetPassword: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    emailVerificado: { type: Boolean, default: false },
    ultimoAcceso: { type: Date, default: null },

    creadoPor: { type: String, ref: 'User', default: null }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject()
  delete obj.passwordHash
  delete obj.activationToken
  delete obj.activationTokenExpires
  delete obj.resetPassword
  delete obj.resetPasswordExpires
  return obj
}

export const User = mongoose.model('User', userSchema)
