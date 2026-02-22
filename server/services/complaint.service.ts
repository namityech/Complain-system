import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const complaintService = {
  async create(data: any, userId: string) {
    return prisma.complaint.create({
      data: {
        ...data,
        userId,
      },
      include: {
        category: true,
        user: { select: { name: true, email: true } },
      }
    });
  },

  async getAll(filters: any) {
    const { status, priority, categoryId, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          category: true,
          user: { select: { name: true } },
          assignedTo: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.complaint.count({ where }),
    ]);

    return { items, total, page, limit };
  },

  async getById(id: string) {
    return prisma.complaint.findUnique({
      where: { id },
      include: {
        category: true,
        user: { select: { name: true, email: true } },
        assignedTo: { select: { name: true, email: true } },
        comments: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "asc" },
        },
        attachments: true,
      },
    });
  },

  async update(id: string, data: any) {
    return prisma.complaint.update({
      where: { id },
      data,
      include: {
        category: true,
        user: { select: { name: true } },
      }
    });
  }
};
