import type { CategoryEntity } from '../../domain/entities/category.entity.js';
import { computeLevel } from '../../domain/entities/category.entity.js';
import type { ICategoryRepository } from '../../domain/repositories/category.repo.js';
import { CategoryModel } from '../models/mongoose-category.model.js';
import { ConflictError } from '@shared/core/error.response.js';
import mongoose from 'mongoose';

export class MongooseCategoryRepo implements ICategoryRepository {
  public async findAll(params: {
    keyword?: string;
    path?: string | null;
    level?: number;
    offset: number;
    limit: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: CategoryEntity[]; totalElements: number }> {
    const { keyword, path, level, offset, limit, sortField, sortOrder } =
      params;

    const query: any = { deletedAt: null };

    // Drill-down logic using Materialized Path
    if (keyword) {
      // Global search: ignore path/level restrictions
      query.name = { $regex: keyword, $options: 'i' };
    } else if (path !== undefined && path !== 'undefined') {
      if (path === null || path === 'null' || path === '') {
        // Root categories (Level 1)
        query.path = /^,[^,]+,$/;
      } else {
        // Direct children of the given path
        const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.path = new RegExp(`^${escapedPath}[^,]+,$`);
      }
    } else if (level) {
      // Filter by level if no path is specified
      // Level 1: ^,[^,]+,$
      // Level 2: ^,[^,]+,[^,]+,$
      // Level N: ^,([^,]+,){N}$
      query.path = new RegExp(`^,([^,]+,){${level}}$`);
    }

    const sortOptions: any = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const [data, totalElements] = await Promise.all([
      CategoryModel.find(query)
        .sort(sortOptions)
        .skip(offset)
        .limit(limit)
        .lean(),
      CategoryModel.countDocuments(query),
    ]);

    return {
      data: data.map((d: any) => this._toDomain(d)!),
      totalElements,
    };
  }

  public async findById(id: string): Promise<CategoryEntity | null> {
    const category = await CategoryModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      deletedAt: null,
    } as any).lean();
    return this._toDomain(category);
  }

  public async findByIds(ids: string[]): Promise<CategoryEntity[]> {
    const categories = await CategoryModel.find({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
      deletedAt: null,
    }).lean();

    // Sort results to match the order of IDs in the path
    const results = categories.map((c: any) => this._toDomain(c)!);
    return ids
      .map((id) => results.find((r) => r.id === id))
      .filter(Boolean) as CategoryEntity[];
  }

  public async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const category = await CategoryModel.findOne({
      slug,
      deletedAt: null,
    }).lean();
    return this._toDomain(category);
  }

  public async findByPath(path: string): Promise<CategoryEntity | null> {
    const category = await CategoryModel.findOne({
      path,
      deletedAt: null,
    }).lean();
    return this._toDomain(category);
  }

  public async findAllDescendants(
    pathPrefix: string,
  ): Promise<CategoryEntity[]> {
    const escapedPath = pathPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const categories = await CategoryModel.find({
      path: new RegExp(`^${escapedPath}`),
      deletedAt: null,
    }).lean();
    return categories.map((c: any) => this._toDomain(c)!);
  }

  public async create(category: CategoryEntity): Promise<CategoryEntity> {
    const { id: _, ...catData } = category;
    const saved = await CategoryModel.create({
      ...catData,
    } as any);
    return this._toDomain(saved.toObject())!;
  }

  public async update(
    id: string,
    data: Partial<CategoryEntity>,
  ): Promise<CategoryEntity | null> {
    const { version, ...updateData } = data;
    const query: any = { _id: id };

    if (version !== undefined) {
      query.version = version;
    }

    const updated = await CategoryModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), version } as any,
      {
        $set: updateData,
        $inc: { version: 1 },
      },
      { returnDocument: 'after' },
    ).lean();

    if (!updated && version !== undefined) {
      throw new ConflictError(
        'Data modified concurrently, Category not found or deleted',
      );
    }

    return this._toDomain(updated);
  }

  public async delete(id: string, deletedAt?: Date): Promise<boolean> {
    const result = await CategoryModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id), deletedAt: null } as any,
      { $set: { deletedAt: deletedAt || new Date() } },
    );
    return result.modifiedCount > 0;
  }

  public async updateSubtreePath(
    oldPath: string,
    newPathPrefix: string,
  ): Promise<void> {
    const escapedPath = oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    await CategoryModel.collection.updateMany(
      {
        path: new RegExp(`^${escapedPath}`),
        deletedAt: null,
      },
      [
        {
          $set: {
            path: {
              $concat: [
                newPathPrefix,
                {
                  $substrCP: [
                    '$path',
                    oldPath.length,
                    { $subtract: [{ $strLenCP: '$path' }, oldPath.length] },
                  ],
                },
              ],
            },
          },
        },
      ],
    );
  }

  private _toDomain(doc: any): CategoryEntity | null {
    if (!doc) return null;
    const data = doc.toObject ? doc.toObject() : doc;
    const { _id, id: _idValue, __v, level: _level, ...rest } = data;
    const path: string = rest.path || '';
    return {
      ...rest,
      id: (_id || _idValue).toString(),
      level: computeLevel(path), // computed, not stored
    } as unknown as CategoryEntity;
  }
}
