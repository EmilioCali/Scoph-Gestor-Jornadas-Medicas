import { Schema, model } from "mongoose";

const measureUnitSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la unidad es requerido"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

measureUnitSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "es", strength: 2 } },
);

export default model("MeasureUnit", measureUnitSchema);
