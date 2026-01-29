import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DrillsModule } from './drills/drills.module';
import { SessionsModule } from './sessions/sessions.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../frontend/dist/frontend/browser'),
      exclude: ['/api*'],
    }),
    PrismaModule,
    AuthModule,
    DrillsModule,
    SessionsModule,
    ExportModule,
  ],
})
export class AppModule {}
