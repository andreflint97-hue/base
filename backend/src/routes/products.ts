import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const router = Router();
const prisma = new PrismaClient();

// ============ CREATE PRODUCT ============
router.post('/', async (req: Request, res: Response) => {
  try {
    const { sku, name, description, categoryId, orgId } = req.body;

    // Validate required fields
    if (!sku || !name || !orgId) {
      return res.status(400).json({ 
        error: 'Missing required fields: sku, name, orgId' 
      });
    }

    // Check if SKU already exists for this organization
    const existingProduct = await prisma.product.findFirst({
      where: {
        sku: sku.toUpperCase(),
        orgId: orgId,
      },
    });

    if (existingProduct) {
      return res.status(409).json({ 
        error: 'Product with this SKU already exists in your organization' 
      });
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        id: uuid(),
        sku: sku.toUpperCase(),
        name,
        description,
        categoryId: categoryId || null,
        orgId,
        metadata: {},
      },
      include: {
        category: true,
        mediaAssets: true,
      },
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// ============ GET ALL PRODUCTS (Paginated) ============
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      orgId,
      page = 1,
      limit = 50,
      search = '',
      categoryId = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    if (!orgId) {
      return res.status(400).json({ error: 'orgId is required' });
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(250, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = { orgId: orgId as string };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    // Get total count
    const total = await prisma.product.count({ where });

    // Get products
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        mediaAssets: {
          take: 1, // Get first image
        },
      },
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc',
      },
    });

    res.json({
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ============ GET SINGLE PRODUCT ============
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await prisma.product.findUnique({
      where: { id: id as string },
      include: {
        category: true,
        mediaAssets: true,
        children: true,
        parent: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ============ UPDATE PRODUCT ============
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, categoryId, metadata } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Get existing product
    const existingProduct = await prisma.product.findUnique({
      where: { id: id as string },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: id as string },
      data: {
        name: name || existingProduct.name,
        description: description !== undefined ? description : existingProduct.description,
        categoryId: categoryId !== undefined ? categoryId : existingProduct.categoryId,
        metadata: metadata || existingProduct.metadata,
        updatedAt: new Date(),
      },
      include: {
        category: true,
        mediaAssets: true,
      },
    });

    res.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// ============ DELETE PRODUCT ============
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: id as string },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete product (cascade will delete related records)
    await prisma.product.delete({
      where: { id: id as string },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ============ BULK DELETE PRODUCTS ============
router.post('/bulk/delete', async (req: Request, res: Response) => {
  try {
    const { ids, orgId } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    if (!orgId) {
      return res.status(400).json({ error: 'orgId is required' });
    }

    // Delete products
    const result = await prisma.product.deleteMany({
      where: {
        id: { in: ids },
        orgId, // Safety check: only delete from user's org
      },
    });

    res.json({ 
      message: `${result.count} products deleted`,
      count: result.count,
    });
  } catch (error: any) {
    console.error('Error bulk deleting products:', error);
    res.status(500).json({ error: 'Failed to delete products' });
  }
});

// ============ BULK UPDATE PRODUCTS ============
router.post('/bulk/update', async (req: Request, res: Response) => {
  try {
    const { ids, updates, orgId } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    if (!orgId) {
      return res.status(400).json({ error: 'orgId is required' });
    }

    // Update all products
    const result = await prisma.product.updateMany({
      where: {
        id: { in: ids },
        orgId,
      },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    res.json({ 
      message: `${result.count} products updated`,
      count: result.count,
    });
  } catch (error: any) {
    console.error('Error bulk updating products:', error);
    res.status(500).json({ error: 'Failed to update products' });
  }
});

// ============ SEARCH PRODUCTS ============
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const { orgId, limit = 10 } = req.query;

    if (!orgId) {
      return res.status(400).json({ error: 'orgId is required' });
    }

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const queryStr = Array.isArray(query) ? query[0] : (query as string);
    const orgIdStr = Array.isArray(orgId) ? orgId[0] : (orgId as string);
const limitNum = Math.max(1, Math.min(100, parseInt((limit as string) || '10')));
    const products = await prisma.product.findMany({
      where: {
        orgId: orgIdStr,
        OR: [
          { name: { contains: queryStr, mode: 'insensitive' } },
          { sku: { contains: queryStr, mode: 'insensitive' } },
          { description: { contains: queryStr, mode: 'insensitive' } },
        ],
      },
      take: limitNum,
      include: {
        category: true,
      },
    });

    res.json(products);
  } catch (error: any) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

export default router;