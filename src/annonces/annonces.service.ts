import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnonceDto } from './dto/create-annonce.dto';
import { UpdateAnnonceDto } from './dto/update-annonce.dto';

@Injectable()
export class AnnoncesService {
  constructor(private prisma: PrismaService) {}

  async create(createAnnonceDto: CreateAnnonceDto, userId: string) {
    return this.prisma.annonce.create({
      data: {
        ...createAnnonceDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(page: number = 1, limit: number = 15) {
    const skip = (page - 1) * limit;
    const [annonces, total] = await Promise.all([
      this.prisma.annonce.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.annonce.count(),
    ]);

    return {
      data: annonces,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.annonce.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id: string, updateAnnonceDto: UpdateAnnonceDto, userId: string) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id },
    });

    if (!annonce || annonce.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return this.prisma.annonce.update({
      where: { id },
      data: updateAnnonceDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id },
    });

    if (!annonce || annonce.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return this.prisma.annonce.delete({
      where: { id },
    });
  }

  async archive(id: string, userId: string) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id },
    });

    if (!annonce || annonce.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return this.prisma.annonce.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async unarchive(id: string, userId: string) {
    const annonce = await this.prisma.annonce.findUnique({
      where: { id },
    });

    if (!annonce || annonce.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return this.prisma.annonce.update({
      where: { id },
      data: { isArchived: false },
    });
  }

  async validate(id: string) {
    return this.prisma.annonce.update({
      where: { id },
      data: { isValidated: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async invalidate(id: string) {
    return this.prisma.annonce.update({
      where: { id },
      data: { isValidated: false },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findValidated(page: number = 1, limit: number = 15) {
    const skip = (page - 1) * limit;
    const [annonces, total] = await Promise.all([
      this.prisma.annonce.findMany({
        where: { isValidated: true },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.annonce.count({ where: { isValidated: true } }),
    ]);

    return {
      data: annonces,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPending(page: number = 1, limit: number = 15) {
    const skip = (page - 1) * limit;
    const [annonces, total] = await Promise.all([
      this.prisma.annonce.findMany({
        where: { isValidated: false },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.annonce.count({ where: { isValidated: false } }),
    ]);

    return {
      data: annonces,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
} 
