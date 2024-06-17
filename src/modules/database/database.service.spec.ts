import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { DataSource } from 'typeorm';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let configService: ConfigService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService, ConfigService],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return TypeOrm options', () => {
    const typeOrmOptions = service.createTypeOrmOptions();
    expect(typeOrmOptions).toEqual({
      type: 'postgres',
      host: configService.get('TYPEORM_HOST'),
      port: configService.get('TYPEORM_PORT'),
      username: configService.get('TYPEORM_USERNAME'),
      password: configService.get('TYPEORM_PASSWORD'),
      database: configService.get('TYPEORM_DATABASE'),
      entities: [configService.get('TYPEORM_ENTITIES')],
      synchronize: configService.get('TYPEORM_SYNCHRONIZE'),
    });
  });

  it('should connect to the database successfully', async () => {
    dataSource = await new DataSource({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'mydatabase',
    }).initialize();

    expect(dataSource.isInitialized).toBe(true);
  });
});
