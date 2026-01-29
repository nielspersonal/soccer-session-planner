import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DrillsService } from './drills.service';
import { CreateDrillDto, UpdateDrillDto } from './dto/drill.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/drills')
@UseGuards(JwtAuthGuard)
export class DrillsController {
  constructor(private readonly drillsService: DrillsService) {}

  @Post()
  create(@Request() req, @Body() createDrillDto: CreateDrillDto) {
    return this.drillsService.create(req.user.id, createDrillDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.drillsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.drillsService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDrillDto: UpdateDrillDto,
  ) {
    return this.drillsService.update(+id, req.user.id, updateDrillDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.drillsService.remove(+id, req.user.id);
  }
}
