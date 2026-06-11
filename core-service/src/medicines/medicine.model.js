import { Schema, model } from 'mongoose';

const medicineSchema = new Schema(
    {
        barcode: {
            type: String,
            trim: true,
            default: null,
        },
        name: {
            type: String,
            required: [true, 'El nombre del medicamento es requerido'],
            trim: true,
        },
        compound: {
            type: String,
            required: [true, 'El compuesto es requerido'],
            trim: true,
        },
        concentration: {
            type: String,
            required: [true, 'La concentración es requerida'],
            trim: true,
        },
        presentation: {
            type: String,
            required: [true, 'La presentación es requerida'],
            trim: true,
        },
        unitOfMeasure: {
            type: String,
            required: [true, 'La unidad de medida es requerida'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'La categoría es requerida'],
            trim: true,
        },
        status: {
            type: String,
            enum: {
                values: ['ACTIVO', 'INACTIVO'],
                message: 'Estado no válido',
            },
            default: 'ACTIVO',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

medicineSchema.index({ name: 1 }, { unique: true, collation: { locale: 'es', strength: 2 } });
medicineSchema.index({ status: 1 });
medicineSchema.index({ barcode: 1 }, { unique: true, sparse: true });

export default model('Medicine', medicineSchema);
