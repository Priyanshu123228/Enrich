import { Category } from '../models/Category.js';
import { Service } from '../models/Service.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ order: 1, createdAt: -1 });

  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const count = await Service.countDocuments({ category: cat.name, isActive: true });
      return { ...cat.toObject(), serviceCount: count };
    })
  );

  return res.status(200).json(
    new ApiResponse(200, categoriesWithCount, 'Categories fetched successfully')
  );
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, order, isActive } = req.body;

  const existing = await Category.findOne({ name: name.trim() });
  if (existing) {
    throw new ApiError(409, 'Category with this name already exists');
  }

  const category = await Category.create({
    name: name.trim(),
    description,
    image,
    order: Number(order) || 0,
    isActive: isActive !== undefined ? isActive : true
  });

  return res.status(201).json(
    new ApiResponse(201, category, 'Category created successfully')
  );
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, image, order, isActive } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  if (name && name.trim() !== category.name) {
    const existing = await Category.findOne({ name: name.trim(), _id: { $ne: id } });
    if (existing) throw new ApiError(409, 'Category with this name already exists');
    category.name = name.trim();
  }

  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  if (order !== undefined) category.order = Number(order);
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  return res.status(200).json(
    new ApiResponse(200, category, 'Category updated successfully')
  );
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'Category deleted successfully')
  );
});
