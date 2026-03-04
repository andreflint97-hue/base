import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const router = Router();
const prisma = new PrismaClient();

// ============ CREATE ORGANIZATION ============
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, slug' 
      });
    }

    const org = await prisma.organization.create({
      data: {
        id: uuid(),
        name,
        slug: slug.toLowerCase(),
        plan: 'free',
      },
    });

    res.status(201).json(org);
  } catch (error: any) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

// ============ GET ALL ORGANIZATIONS ============
router.get('/', async (req: Request, res: Response) => {
  try {
    const orgs = await prisma.organization.findMany();
    res.json(orgs);
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

export default router;