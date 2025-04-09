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
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';
import { SearchAnnouncementDto } from './dto/search-announcement.dto';

@Controller('annonces')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createAnnouncementDto: CreateAnnouncementDto, @GetUser() user: any) {
    return this.announcementsService.create(createAnnouncementDto, user.id);
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 15,
  ) {
    return this.announcementsService.findAll(page, limit);
  }

  @Get('/validated')
  findValidated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 15,
  ) {
    return this.announcementsService.findValidated(page, limit);
  }

  @Get('/pending')
  @UseGuards(JwtAuthGuard)
  findPending(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 15,
  ) {
    return this.announcementsService.findPending(page, limit);
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
    @GetUser() user: User,
  ) {
    return this.announcementsService.update(id, updateAnnouncementDto, user.id);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.announcementsService.remove(id, user.id);
  }

  @Post('/:id/archive')
  @UseGuards(JwtAuthGuard)
  archive(@Param('id') id: string, @GetUser() user: User) {
    return this.announcementsService.archive(id, user.id);
  }

  @Post('/:id/unarchive')
  @UseGuards(JwtAuthGuard)
  unarchive(@Param('id') id: string, @GetUser() user: User) {
    return this.announcementsService.unarchive(id, user.id);
  }

  @Post('/:id/validate')
  @UseGuards(JwtAuthGuard)
  validate(@Param('id') id: string) {
    return this.announcementsService.validate(id);
  }

  @Post('/:id/invalidate')
  @UseGuards(JwtAuthGuard)
  invalidate(@Param('id') id: string) {
    return this.announcementsService.invalidate(id);
  }

  @Get('/search')
  async search(
    @Query() searchDto: SearchAnnouncementDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 15,
  ) {
    return this.announcementsService.search(searchDto, page, limit);
  }
} 