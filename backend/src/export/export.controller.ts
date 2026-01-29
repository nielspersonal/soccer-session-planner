import { Controller, Get, Param, Res, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { SessionsService } from '../sessions/sessions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(
    private exportService: ExportService,
    private sessionsService: SessionsService,
  ) {}

  @Get('session/:id/pdf')
  async exportSessionPDF(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pdf = await this.exportService.generateSessionPDF(+id, req.user.id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="session-${id}.pdf"`,
      'Content-Length': pdf.length,
    });

    res.send(pdf);
  }

  @Get('session/:id/print')
  async printSession(@Request() req, @Param('id') id: string, @Res() res: Response) {
    const session = await this.sessionsService.findOne(+id, req.user.id);
    const html = this.exportService.generateSessionHTML(session);

    res.set('Content-Type', 'text/html');
    res.send(html);
  }
}
