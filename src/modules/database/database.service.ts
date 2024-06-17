import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('TYPEORM_HOST'),
      port: this.configService.get('TYPEORM_PORT'),
      username: this.configService.get('TYPEORM_USERNAME'),
      password: this.configService.get('TYPEORM_PASSWORD'),
      database: this.configService.get('TYPEORM_DATABASE'),
      entities: [this.configService.get('TYPEORM_ENTITIES')],
      synchronize: this.configService.get('TYPEORM_SYNCHRONIZE'), // Ensure synchronize is false in production
      logging: this.configService.get('TYPEORM_LOGGING'), // Enable logging to see TypeORM queries and connection logs
    };
  }
}
