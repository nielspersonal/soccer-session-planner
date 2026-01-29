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
import { SessionsService } from './sessions.service';
import { CreateSessionDto, UpdateSessionDto, AddDrillToSessionDto } from './dto/session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Request() req, @Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(req.user.id, createSessionDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.sessionsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.sessionsService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    return this.sessionsService.update(+id, req.user.id, updateSessionDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.sessionsService.remove(+id, req.user.id);
  }

  @Post(':id/drills')
  addDrill(
    @Request() req,
    @Param('id') id: string,
    @Body() addDrillDto: AddDrillToSessionDto,
  ) {
    return this.sessionsService.addDrill(+id, req.user.id, addDrillDto);
  }

  @Patch('drills/:sessionDrillId')
  updateSessionDrill(
    @Request() req,
    @Param('sessionDrillId') sessionDrillId: string,
    @Body() updateDto: Partial<AddDrillToSessionDto>,
  ) {
    return this.sessionsService.updateSessionDrill(+sessionDrillId, req.user.id, updateDto);
  }

  @Delete('drills/:sessionDrillId')
  removeDrill(@Request() req, @Param('sessionDrillId') sessionDrillId: string) {
    return this.sessionsService.removeDrill(+sessionDrillId, req.user.id);
  }
}
