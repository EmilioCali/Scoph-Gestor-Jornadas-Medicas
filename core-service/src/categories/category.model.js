import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la categoría es requerido"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVO", "INACTIVO"],
        message: "Estado no válido",
      },
      default: "ACTIVO",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

categorySchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "es", strength: 2 } },
);

export default model("Category", categorySchema);
