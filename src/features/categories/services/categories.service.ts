import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    // Get only top-level categories (parent_id is null)
    return this.categoryRepository.find({
      where: { parent_id: IsNull() },
      order: { name: 'ASC' },
    });
  }

  async findSubcategories(categoryId: string): Promise<Category[]> {
    // First check if the parent category exists
    const parentExists = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!parentExists) {
      throw new NotFoundException('Category not found');
    }

    // Get subcategories for the given parent category
    return this.categoryRepository.find({
      where: { parent_id: categoryId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // If parent_id is provided, check if parent category exists
    if (createCategoryDto.parent_id) {
      const parentExists = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parent_id },
      });

      if (!parentExists) {
        throw new NotFoundException('Parent category not found');
      }
    }

    // Check if category with same name exists at the same level
    const existingCategory = await this.categoryRepository.findOne({
      where: {
        name: createCategoryDto.name,
        parent_id: createCategoryDto.parent_id || IsNull(),
      },
    });

    if (existingCategory) {
      throw new BadRequestException(
        'Category with this name already exists at this level',
      );
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async update(
    id: string,
    updateCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    // If parent_id is provided and different from current, check if new parent exists
    if (
      updateCategoryDto.parent_id &&
      updateCategoryDto.parent_id !== category.parent_id
    ) {
      const parentExists = await this.categoryRepository.findOne({
        where: { id: updateCategoryDto.parent_id },
      });

      if (!parentExists) {
        throw new NotFoundException('Parent category not found');
      }

      // Prevent circular reference
      if (updateCategoryDto.parent_id === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      // Check if the new parent is not one of its own descendants
      const descendants = await this.findSubcategories(id);
      if (descendants.some((desc) => desc.id === updateCategoryDto.parent_id)) {
        throw new BadRequestException(
          'Category cannot have one of its descendants as parent',
        );
      }
    }

    // Check if category with same name exists at the same level (excluding this category)
    const existingCategory = await this.categoryRepository.findOne({
      where: {
        name: updateCategoryDto.name,
        parent_id: updateCategoryDto.parent_id || IsNull(),
        id: Not(id), // Not equal to current category
      },
    });

    if (existingCategory) {
      throw new BadRequestException(
        'Category with this name already exists at this level',
      );
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Check if category has subcategories
    const hasSubcategories = await this.categoryRepository.count({
      where: { parent_id: id },
    });

    if (hasSubcategories > 0) {
      throw new BadRequestException(
        'Cannot delete category with subcategories',
      );
    }

    // Check if category has associated businesses
    const hasBusinesses = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.businesses', 'business')
      .where('category.id = :id', { id })
      .andWhere('business.id IS NOT NULL')
      .getCount();

    if (hasBusinesses > 0) {
      throw new BadRequestException(
        'Cannot delete category with associated businesses',
      );
    }

    await this.categoryRepository.remove(category);
  }
}
