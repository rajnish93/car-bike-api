import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './utils/env.validation';
import { DatabaseModule } from './modules/database/database.module';
import { GroupsModule } from './modules/groups/groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      cache: true,
      expandVariables: true,
      isGlobal: true,
    }),
    DatabaseModule,
    GroupsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
