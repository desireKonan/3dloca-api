import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AnnoncesService } from './annonces.service';
import { CreateAnnonceDto } from './dto/create-annonce.dto';
import { UpdateAnnonceDto } from './dto/update-annonce.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';

@Controller('annonces')
export class AnnoncesController {
  constructor(private readonly annoncesService: AnnoncesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createAnnonceDto: CreateAnnonceDto, @GetUser() user: User) {
    return this.annoncesService.create(createAnnonceDto, user.id);
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 15,
  ) {
    return this.annoncesService.findAll(page, limit);
  }

  @Get('validated')
  findValidated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 15,
  ) {
    return this.annoncesService.findValidated(page, limit);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  findPending(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 15,
  ) {
    return this.annoncesService.findPending(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.annoncesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateAnnonceDto: UpdateAnnonceDto,
    @GetUser() user: User,
  ) {
    return this.annoncesService.update(id, updateAnnonceDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.annoncesService.remove(id, user.id);
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard)
  archive(@Param('id') id: string, @GetUser() user: User) {
    return this.annoncesService.archive(id, user.id);
  }

  @Post(':id/unarchive')
  @UseGuards(JwtAuthGuard)
  unarchive(@Param('id') id: string, @GetUser() user: User) {
    return this.annoncesService.unarchive(id, user.id);
  }

  @Post(':id/validate')
  @UseGuards(JwtAuthGuard)
  validate(@Param('id') id: string) {
    return this.annoncesService.validate(id);
  }

  @Post(':id/invalidate')
  @UseGuards(JwtAuthGuard)
  invalidate(@Param('id') id: string) {
    return this.annoncesService.invalidate(id);
  }
} 