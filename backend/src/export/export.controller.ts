import { Controller, Get, Param, Res, UseGuards, Request, Query, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { SessionsService } from '../sessions/sessions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/export')
export class ExportController {
  constructor(
    private exportService: ExportService,
    private sessionsService: SessionsService,
  ) {}

  @Get('session/:id/pdf')
  @UseGuards(JwtAuthGuard)
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
  async printSession(
    @Request() req,
    @Param('id') id: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    let userId: number;

    if (req.user) {
      userId = req.user.id;
    } else if (token) {
      const decoded = await this.verifyToken(token);
      userId = decoded.userId;
    } else {
      throw new UnauthorizedException('No authentication provided');
    }

    const session = await this.sessionsService.findOne(+id, userId);
    const html = this.exportService.generateSessionHTML(session);

    res.set('Content-Type', 'text/html');
    res.send(html);
  }

  private async verifyToken(token: string): Promise<{ userId: number }> {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      return { userId: decoded.sub };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
