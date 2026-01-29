import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto, UpdateSessionDto, AddDrillToSessionDto } from './dto/session.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateSessionDto) {
    return this.prisma.session.create({
      data: {
        userId,
        title: dto.title,
        date: dto.date ? new Date(dto.date) : null,
        team: dto.team,
        totalDuration: dto.totalDuration,
        theme: dto.theme,
        notes: dto.notes,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.session.findMany({
      where: { userId },
      include: {
        sessionDrills: {
          include: {
            drill: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const session = await this.prisma.session.findFirst({
      where: { id, userId },
      include: {
        sessionDrills: {
          include: {
            drill: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async update(id: number, userId: number, dto: UpdateSessionDto) {
    await this.findOne(id, userId);

    return this.prisma.session.update({
      where: { id },
      data: {
        title: dto.title,
        date: dto.date ? new Date(dto.date) : undefined,
        team: dto.team,
        totalDuration: dto.totalDuration,
        theme: dto.theme,
        notes: dto.notes,
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    return this.prisma.session.delete({
      where: { id },
    });
  }

  async addDrill(sessionId: number, userId: number, dto: AddDrillToSessionDto) {
    await this.findOne(sessionId, userId);

    // Get the next order number
    const maxOrder = await this.prisma.sessionDrill.findFirst({
      where: { sessionId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = maxOrder ? maxOrder.order + 1 : 0;

    return this.prisma.sessionDrill.create({
      data: {
        sessionId,
        drillId: dto.drillId,
        order: nextOrder,
        durationOverride: dto.durationOverride,
        sessionNotes: dto.sessionNotes,
      },
      include: {
        drill: true,
      },
    });
  }

  async updateSessionDrill(
    sessionDrillId: number,
    userId: number,
    dto: Partial<AddDrillToSessionDto>,
  ) {
    const sessionDrill = await this.prisma.sessionDrill.findUnique({
      where: { id: sessionDrillId },
      include: { session: true },
    });

    if (!sessionDrill || sessionDrill.session.userId !== userId) {
      throw new NotFoundException('Session drill not found');
    }

    return this.prisma.sessionDrill.update({
      where: { id: sessionDrillId },
      data: {
        durationOverride: dto.durationOverride,
        sessionNotes: dto.sessionNotes,
        order: dto.order,
      },
      include: {
        drill: true,
      },
    });
  }

  async removeDrill(sessionDrillId: number, userId: number) {
    const sessionDrill = await this.prisma.sessionDrill.findUnique({
      where: { id: sessionDrillId },
      include: { session: true },
    });

    if (!sessionDrill || sessionDrill.session.userId !== userId) {
      throw new NotFoundException('Session drill not found');
    }

    return this.prisma.sessionDrill.delete({
      where: { id: sessionDrillId },
    });
  }
}
