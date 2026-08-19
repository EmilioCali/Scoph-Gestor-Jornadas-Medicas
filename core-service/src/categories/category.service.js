import Category from "./category.model.js";
import { NotFoundError, ValidationError } from "../utils/errorHandler.js";

function normalizeText(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ");
}

function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, () => []);
  for (let i = 0; i <= b.length; i += 1) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= a.length; j += 1) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (b[i - 1] === a[j - 1] ? 0 : 1),
      );
    }
  }
  return matrix[b.length][a.length];
}

async function assertUniqueCategoryName(name, excludeId = null) {
  if (!name || !name.trim()) {
    throw new ValidationError("El nombre de la categoría es requerido");
  }

  const exactMatch = await Category.findOne({
    name: {
      $regex: `^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });

  if (exactMatch) {
    throw new ValidationError(`Ya existe la categoría "${exactMatch.name}"`);
  }

  const normalizedName = normalizeText(name);
  const categories = await Category.find(
    excludeId ? { _id: { $ne: excludeId } } : {},
  ).lean();

  for (const category of categories) {
    const normalizedCandidate = normalizeText(category.name);
    const distance = levenshteinDistance(normalizedName, normalizedCandidate);
    const maxLength = Math.max(
      normalizedName.length,
      normalizedCandidate.length,
    );
    if (maxLength >= 5 ? distance <= 2 : distance <= 1) {
      throw new ValidationError(
        `Ya existe una categoría similar: "${category.name}". Verifica la ortografía.`,
      );
    }
  }
}

export async function createCategoryRecord(categoryData) {
  const data = {
    ...categoryData,
    name: categoryData.name?.trim(),
  };
  await assertUniqueCategoryName(data.name);
  const category = await Category.create(data);
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
  if (categoryData.name) {
    categoryData.name = categoryData.name.trim();
    await assertUniqueCategoryName(categoryData.name, categoryId);
  }

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
