import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDrillDto, UpdateDrillDto } from './dto/drill.dto';

@Injectable()
export class DrillsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateDrillDto) {
    return this.prisma.drill.create({
      data: {
        userId,
        title: dto.title,
        objective: dto.objective,
        ageGroup: dto.ageGroup,
        durationMinutes: dto.durationMinutes,
        notes: dto.notes,
        tags: dto.tags || [],
        diagramJson: dto.diagramJson,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.drill.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const drill = await this.prisma.drill.findFirst({
      where: { id, userId },
    });

    if (!drill) {
      throw new NotFoundException('Drill not found');
    }

    return drill;
  }

  async update(id: number, userId: number, dto: UpdateDrillDto) {
    await this.findOne(id, userId);

    return this.prisma.drill.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    return this.prisma.drill.delete({
      where: { id },
    });
  }
}
