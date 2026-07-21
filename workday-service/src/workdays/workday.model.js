import { Schema, model } from 'mongoose';

const workdaySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre de la jornada es requerido'],
            trim: true,
            maxLength: [100, 'El nombre no puede exceder 100 caracteres'],
        },

        description: {
            type: String,
            trim: true,
            maxLength: [500, 'La descripción no puede exceder 500 caracteres'],
        },

        startDate: {
            type: Date,
            required: [true, 'La fecha de inicio es requerida'],
        },

        endDate: {
            type: Date,
            required: [true, 'La fecha de finalización es requerida'],
        },

        location: {
            department: {
                type: String,
                required: [true, 'El departamento es requerido'],
                trim: true,
            },

            municipality: {
                type: String,
                required: [true, 'El municipio es requerido'],
                trim: true,
            },

            address: {
                type: String,
                required: [true, 'La dirección es requerida'],
                trim: true,
                maxLength: [255, 'La dirección no puede exceder 255 caracteres'],
            },
        },

        manager: {
            userId: {
                type: String,
                required: [true, 'El ID del responsable es requerido'],
                trim: true,
            },

            name: {
                type: String,
                required: [true, 'El nombre del responsable es requerido'],
                trim: true,
                maxLength: [100, 'El nombre no puede exceder 100 caracteres'],
            },
        },

        // Médicos asignados a la jornada (soporta asignación múltiple)
        doctors: {
            type: [
                {
                    userId: {
                        type: String,
                        required: [true, 'El ID del médico es requerido'],
                        trim: true,
                    },
                    name: {
                        type: String,
                        required: [true, 'El nombre del médico es requerido'],
                        trim: true,
                        maxLength: [100, 'El nombre no puede exceder 100 caracteres'],
                    },
                },
            ],
            default: [],
        },

        estimatedPatients: {
            type: Number,
            required: [true, 'La cantidad estimada de pacientes es requerida'],
            min: [0, 'La cantidad no puede ser negativa'],
        },

        estimatedMedicines: {
            type: Number,
            required: [true, 'La cantidad estimada de medicamentos es requerida'],
            min: [0, 'La cantidad no puede ser negativa'],
        },

        status: {
            type: String,
            required: [true, 'El estado es requerido'],
            enum: {
                values: ['PLANNED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED'],
                message: 'Estado de jornada no válido',
            },
            default: 'PLANNED',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

workdaySchema.index({ status: 1 });
workdaySchema.index({ startDate: 1 });
workdaySchema.index({ 'location.department': 1 });
workdaySchema.index({ 'doctors.userId': 1 });

workdaySchema.pre('validate', function () {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
        this.invalidate(
            'endDate',
            'La fecha de finalización no puede ser anterior a la fecha de inicio'
        );
    }
});

export default model('Workday', workdaySchema);
