import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { SearchAnnouncementDto } from './dto/search-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async create(createAnnouncementDto: CreateAnnouncementDto, userId: string) {
    return this.prisma.announcement.create({
      data: {
        ...createAnnouncementDto,
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
      this.prisma.announcement.findMany({
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
      this.prisma.announcement.count(),
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
    return this.prisma.announcement.findUnique({
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

  async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    this.isAuthorize(announcement, userId);

    return this.prisma.announcement.update({
      where: { id },
      data: updateAnnouncementDto,
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
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    this.isAuthorize(announcement, userId);

    return this.prisma.announcement.delete({
      where: { id },
    });
  }

  async archive(id: string, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    this.isAuthorize(announcement, userId);

    return this.prisma.announcement.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async unarchive(id: string, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    this.isAuthorize(announcement, userId);

    return this.prisma.announcement.update({
      where: { id },
      data: { isArchived: false },
    });
  }

  async validate(id: string) {
    return this.prisma.announcement.update({
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
    return this.prisma.announcement.update({
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
      this.prisma.announcement.findMany({
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
      this.prisma.announcement.count({ where: { isValidated: true } }),
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
      this.prisma.announcement.findMany({
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
      this.prisma.announcement.count({ where: { isValidated: false } }),
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

  async search(
    searchDto: SearchAnnouncementDto,
    page: number = 1,
    limit: number = 15,
  ) {
    const skip = (page - 1) * limit;
    const where = this.buildSearchWhereClause(searchDto) as any;

    const [annonces, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
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
      this.prisma.announcement.count({ where }),
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

  private buildSearchWhereClause(searchDto: SearchAnnouncementDto) {
    return {
      isArchived: false,
      isValidated: true,
      ...(searchDto.location && {
        contains: searchDto.location,
        mode: 'insensitive',
      }),
      ...((searchDto.minPrice !== undefined || searchDto.maxPrice !== undefined) && {
        price: {
          gte: searchDto.maxPrice || undefined,
          lte: searchDto.minPrice || undefined
        }
      }),
      ...(searchDto.category && {
        contains: searchDto.category,
        mode: 'insensitive',
      }),
      ...(searchDto.searchTerm && {
        OR: [
          {
            title: {
              contains: searchDto.searchTerm,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: searchDto.searchTerm,
              mode: 'insensitive',
            },
          },
        ]
      })
    };
  }


  private isAuthorize(announcement: any, userId: string) {
    if (!announcement || announcement.userId !== userId) {
      throw new Error('C\'est pas autorise');
    }
  }
} 
