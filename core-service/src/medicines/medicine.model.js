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
            trim: true,
            default: null,
        },
        unitOfMeasure: {
            type: String,
            trim: true,
            default: null,
        },
        minimumUnit: {
            type: String,
            required: [true, 'La unidad mínima es requerida'],
            trim: true,
        },
        intermediateUnit: {
            type: String,
            trim: true,
            default: null,
        },
        packageUnit: {
            type: String,
            required: [true, 'La unidad de empaque es requerida'],
            trim: true,
        },
        unitsPerPackage: {
            type: Number,
            min: [1, 'La unidad por empaque debe ser mayor a 0'],
            default: 1,
        },
        unitsPerMinimumUnit: {
            type: Number,
            min: [1, 'La unidad por unidad mínima debe ser mayor a 0'],
            default: 1,
        },
        minimumStock: {
            type: Number,
            min: [0, 'El stock mínimo debe ser mayor o igual a 0'],
            default: 0,
        },
        category: {
            type: [{
                type: String,
                trim: true,
            }],
            required: [true, 'La categoría es requerida'],
            validate: {
                validator: (categories) => Array.isArray(categories) && categories.length > 0,
                message: 'Debe seleccionar al menos una categoría',
            },
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
