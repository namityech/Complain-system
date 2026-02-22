import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const adminService = {
  async getAnalytics() {
    const [total, open, inProgress, resolved, rejected] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: "OPEN" } }),
      prisma.complaint.count({ where: { status: "IN_PROGRESS" } }),
      prisma.complaint.count({ where: { status: "RESOLVED" } }),
      prisma.complaint.count({ where: { status: "REJECTED" } }),
    ]);

    const complaintsByDepartment = await prisma.department.findMany({
      include: {
        categories: {
          include: {
            _count: { select: { complaints: true } }
          }
        }
      }
    });

    const deptStats = complaintsByDepartment.map(dept => ({
      name: dept.name,
      count: dept.categories.reduce((acc, cat) => acc + cat._count.complaints, 0)
    }));

    return {
      counts: { total, open, inProgress, resolved, rejected },
      deptStats
    };
  },

  async assignComplaint(complaintId: string, staffId: string) {
    return prisma.complaint.update({
      where: { id: complaintId },
      data: {
        assignedToId: staffId,
        status: "IN_PROGRESS"
      }
    });
  }
};
