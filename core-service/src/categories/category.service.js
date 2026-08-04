import Category from "./category.model.js";
import { NotFoundError } from "../utils/errorHandler.js";

export async function createCategoryRecord(categoryData) {
  const category = await Category.create(categoryData);
  return category;
}

export async function getAllCategories() {
  return Category.find().sort({ name: 1 }).lean();
}

export async function getCategoryById(categoryId) {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new NotFoundError("Categoría no encontrada");
  }
  return category;
}

export async function updateCategoryRecord(categoryId, categoryData) {
  const category = await Category.findByIdAndUpdate(categoryId, categoryData, {
    new: true,
    runValidators: true,
    context: "query",
  });
  if (!category) {
    throw new NotFoundError("Categoría no encontrada");
  }
  return category;
}

export async function deleteCategoryRecord(categoryId) {
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) {
    throw new NotFoundError("Categoría no encontrada");
  }
  return category;
}
