import { Schema, model } from 'mongoose';

const medicationSnapshotSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre del medicamento es requerido'],
            trim: true,
        },
        concentration: {
            type: String,
            required: [true, 'La concentración es requerida'],
            trim: true,
        },
    },
    { _id: false }
);

const detailSchema = new Schema(
    {
        medicineId: {
            type: Schema.Types.ObjectId,
            ref: 'Medicine',
            required: [true, 'El ID del medicamento es requerido'],
        },
        medicationSnapshot: {
            type: medicationSnapshotSchema,
            required: [true, 'El snapshot del medicamento es requerido'],
        },
        batch: {
            type: String,
            required: [true, 'El lote es requerido'],
            trim: true,
        },
        quantity: {
            type: Number,
            required: [true, 'La cantidad es requerida'],
            min: [1, 'La cantidad debe ser al menos 1'],
        },
        expirationDate: {
            type: Date,
            required: [true, 'La fecha de vencimiento es requerida'],
        },
    },
    { _id: false }
);

const originDestinationSchema = new Schema(
    {
        type: {
            type: String,
            required: [true, 'El tipo es requerido'],
            enum: {
                values: ['INVENTARIO_CENTRAL', 'INVENTARIO_JORNADA'],
                message: 'Tipo no válido',
            },
        },
        id: {
            type: String,
            default: null,
        },
    },
    { _id: false }
);

const movementSchema = new Schema(
    {
        type: {
            type: String,
            required: [true, 'El tipo de movimiento es requerido'],
            enum: {
                values: ['ENTRADA', 'SALIDA', 'TRANSFERENCIA'],
                message: 'Tipo de movimiento no válido',
            },
        },
        subType: {
            type: String,
            required: [true, 'El subtipo de movimiento es requerido'],
            enum: {
                values: ['DONACION', 'COMPRA', 'RECETA', 'CONSUMO_JORNADA', 'ASIGNACION_JORNADA', 'RETORNO_JORNADA'],
                message: 'Subtipo de movimiento no válido',
            },
        },
        origin: {
            type: originDestinationSchema,
            required: [true, 'El origen es requerido'],
        },
        destination: {
            type: originDestinationSchema,
            required: [true, 'El destino es requerido'],
        },
        detail: {
            type: [detailSchema],
            required: [true, 'El detalle es requerido'],
        },
        status: {
            type: String,
            enum: {
                values: ['PENDIENTE', 'APLICADO', 'CANCELADO'],
                message: 'Estado no válido',
            },
            default: 'PENDIENTE',
        },
        userId: {
            type: String,
            required: [true, 'El ID del usuario es requerido'],
            trim: true,
        },
        metadata: {
            patientName: {
                type: String,
                trim: true,
                default: null,
            },

            patientAge: {
                type: Number,
                default: null,
            },

            deliveryType: {
                type: String,
                enum: ['RECETA', 'MANUAL'],
                default: null,
            },

            reason: {
                type: String,
                trim: true,
                default: null,
            },
        },
        appliedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

movementSchema.index({ type: 1 });
movementSchema.index({ status: 1 });
movementSchema.index({ userId: 1 });

export default model('Movement', movementSchema);