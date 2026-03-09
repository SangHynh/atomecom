import 'dotenv/config';
import mongoose from 'mongoose';
import { CategoryModel } from '../../infra/models/mongoose-category.model.js';
import appConfig from '../../../../shared/configs/app.config.js';
import { PRODUCT_STATUS } from '@atomecom/shared';

async function seed() {
  try {
    const uri = process.env.DEV_DB_URI || appConfig?.db?.uri;
    if (!uri) {
      throw new Error('DB_URI is not defined in environment variables');
    }

    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Connected successfully.');

    console.log('Cleaning existing categories...');
    await CategoryModel.deleteMany({});

    // 50 Root Categories (Level 1)
    const rootBase = [
      {
        name: 'Điện thoại & Tablet',
        slug: 'dien-thoai-tablet',
        icon: 'Smartphone',
      },
      { name: 'Laptop & Máy tính', slug: 'laptop-may-tinh', icon: 'Laptop' },
      {
        name: 'Âm thanh & Phụ kiện',
        slug: 'am-thanh-phu-kien',
        icon: 'Headphones',
      },
      {
        name: 'Máy ảnh & Quay phim',
        slug: 'may-anh-quay-phim',
        icon: 'Camera',
      },
      { name: 'Tivi & Thiết bị giải trí', slug: 'tivi-giai-tri', icon: 'Tv' },
      { name: 'Linh kiện máy tính', slug: 'linh-kien-pc', icon: 'Cpu' },
      { name: 'Đồ gia dụng', slug: 'do-gia-dung', icon: 'Home' },
      { name: 'Thời trang Nam', slug: 'thoi-trang-nam', icon: 'Shirt' },
      { name: 'Thời trang Nữ', slug: 'thoi-trang-nu', icon: 'Shirt' },
      { name: 'Đồng hồ & Trang sức', slug: 'dong-ho-trang-suc', icon: 'Watch' },
      { name: 'Sức khỏe & Làm đẹp', slug: 'suc-khoe-lam-dep', icon: 'Heart' },
      { name: 'Thể thao & Dã ngoại', slug: 'the-thao-da-ngoai', icon: 'Bike' },
      { name: 'Ô tô & Xe máy', slug: 'o-to-xe-may', icon: 'Car' },
      { name: 'Đồ chơi & Mẹ bé', slug: 'do-choi-me-be', icon: 'Baby' },
      { name: 'Sách & Văn phòng phẩm', slug: 'sach-vpp', icon: 'Book' },
      {
        name: 'Thực phẩm & Bách hóa',
        slug: 'thuc-pham-bach-hoa',
        icon: 'ShoppingBag',
      },
      { name: 'Vật dụng nhà bếp', slug: 'nha-bep', icon: 'Utensils' },
      { name: 'Nội thất phòng khách', slug: 'noi-that-pk', icon: 'Home' },
      { name: 'Sản phẩm chăm sóc da', slug: 'skincare', icon: 'Sparkles' },
      { name: 'Dụng cụ sửa chữa', slug: 'dung-cu-sua-chua', icon: 'Wrench' },
    ];

    const roots: any[] = [...rootBase];
    for (let i = rootBase.length + 1; i <= 50; i++) {
      roots.push({
        name: `Danh mục Gốc ${i}`,
        slug: `danh-muc-goc-${i}`,
        icon: 'Folder',
        description: `Mô tả cho danh mục gốc thứ ${i}`,
      });
    }

    const categories: any[] = [];
    const createdMap = new Map<string, any>();

    console.log('Inserting 50 Root Categories...');
    for (const root of roots) {
      const categoryId = new mongoose.Types.ObjectId();
      const path = `,${categoryId.toString()},`;

      const doc = await CategoryModel.create({
        ...root,
        _id: categoryId,
        path,
        status: PRODUCT_STATUS.PUBLISHED,
        version: 1,
        attributeDefinitions: [],
      });
      createdMap.set(root.slug, doc);
      categories.push(doc);
    }

    // Add some deep children to the first few roots to verify hierarchy
    const techChildren = [
      { name: 'iPhone', slug: 'iphone', parent: 'dien-thoai-tablet' },
      {
        name: 'Samsung Galaxy',
        slug: 'samsung-galaxy',
        parent: 'dien-thoai-tablet',
      },
      { name: 'MacBook Pro', slug: 'macbook-pro', parent: 'laptop-may-tinh' },
      {
        name: 'Gaming Laptops',
        slug: 'gaming-laptops',
        parent: 'laptop-may-tinh',
      },
    ];

    console.log('Inserting Children...');
    for (const child of techChildren) {
      const parent = createdMap.get(child.parent);
      if (!parent) continue;

      const categoryId = new mongoose.Types.ObjectId();
      const path = `${parent.path}${categoryId.toString()},`;

      const doc = await CategoryModel.create({
        name: child.name,
        slug: child.slug,
        _id: categoryId,
        path,
        status: PRODUCT_STATUS.PUBLISHED,
        version: 1,
        attributeDefinitions: [],
      });
      createdMap.set(child.slug, doc);
    }

    // Add Level 3
    const iphoneModels = [
      { name: 'iPhone 15 Pro', slug: 'iphone-15-pro', parent: 'iphone' },
      { name: 'iPhone 14', slug: 'iphone-14', parent: 'iphone' },
    ];

    for (const model of iphoneModels) {
      const parent = createdMap.get(model.parent);
      if (!parent) continue;

      const categoryId = new mongoose.Types.ObjectId();
      const path = `${parent.path}${categoryId.toString()},`;

      await CategoryModel.create({
        name: model.name,
        slug: model.slug,
        _id: categoryId,
        path,
        status: PRODUCT_STATUS.PUBLISHED,
        version: 1,
        attributeDefinitions: [],
      });
    }

    console.log('Seed completed successfully! 🌱 Total Roots: 50.');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
