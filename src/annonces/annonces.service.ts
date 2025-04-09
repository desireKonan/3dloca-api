import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnonceDto } from './dto/create-annonce.dto';
import { UpdateAnnonceDto } from './dto/update-annonce.dto';

@Injectable()
export class AnnoncesService {
  constructor(private prisma: PrismaService) {}

  async create(createAnnonceDto: CreateAnnonceDto) {
    return this.prisma.annonce.create({
      data: createAnnonceDto,
    });
  }

  async findAll() {
    return this.prisma.annonce.findMany();
  }

  async findOne(id: string) {
    return this.prisma.annonce.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateAnnonceDto: UpdateAnnonceDto) {
    return this.prisma.annonce.update({
      where: { id },
      data: updateAnnonceDto,
    });
  }

  async remove(id: string) {
    return this.prisma.annonce.delete({
      where: { id },
    });
  }

  async archive(id: string) {
    return this.prisma.annonce.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async unarchive(id: string) {
    return this.prisma.annonce.update({
      where: { id },
      data: { isArchived: false },
    });
  }

  async findArchived() {
    return this.prisma.annonce.findMany({
      where: { isArchived: true },
    });
  }

  async findActive() {
    return this.prisma.annonce.findMany({
      where: { isArchived: false },
    });
  }
} 