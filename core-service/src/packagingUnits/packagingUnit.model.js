import { Schema, model } from "mongoose";

const packagingUnitSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la unidad de empaquetado es requerido"],
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

packagingUnitSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "es", strength: 2 } },
);

export default model("PackagingUnit", packagingUnitSchema);
