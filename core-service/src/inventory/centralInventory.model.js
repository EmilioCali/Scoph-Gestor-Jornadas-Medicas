import { Schema, model } from 'mongoose';

const lotSchema = new Schema(
    {
        batch: {
            type: String,
            required: [true, 'El número de lote es requerido'],
            trim: true,
        },
        expirationDate: {
            type: Date,
            required: [true, 'La fecha de vencimiento es requerida'],
        },
        boxes: {
            type: Number,
            min: [0, 'Las cajas no pueden ser negativas'],
            default: 0,
        },
        blisters: {
            type: Number,
            min: [0, 'Los blísteres no pueden ser negativos'],
            default: 0,
        },
        units: {
            type: Number,
            min: [0, 'Las unidades no pueden ser negativas'],
            default: 0,
        },
        stock: {
            type: Number,
            required: [true, 'El stock es requerido'],
            min: [0, 'El stock no puede ser negativo'],
            default: 0,
        },
    },
    { _id: false }
    );

    const centralInventorySchema = new Schema(
    {
        medicineId: {
            type: Schema.Types.ObjectId,
            ref: 'Medicine',
            required: [true, 'El ID del medicamento es requerido'],
        },
        lots: {
            type: [lotSchema],
            default: [],
        },
        totalStock: {
            type: Number,
            required: [true, 'El stock total es requerido'],
            min: [0, 'El stock total no puede ser negativo'],
            default: 0,
        },
        minimumStock: {
            type: Number,
            required: [true, 'El stock mínimo es requerido'],
            min: [0, 'El stock mínimo no puede ser negativo'],
            default: 10,
        },
    },
    {
        timestamps: { createdAt: false, updatedAt: true },
        versionKey: false,
    }
);

centralInventorySchema.index({ medicineId: 1 }, { unique: true });

export default model('CentralInventory', centralInventorySchema);
