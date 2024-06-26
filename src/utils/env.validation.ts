import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNumber,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsDefined()
  @IsString()
  API_PREFIX: string;

  @IsNumber()
  @Min(5000)
  @Max(65535)
  PORT: number;

  @IsDefined()
  @IsString()
  TYPEORM_HOST: string;

  @IsDefined()
  @IsNumber()
  TYPEORM_PORT: number;

  @IsDefined()
  @IsString()
  TYPEORM_USERNAME: string;

  @IsDefined()
  @IsString()
  TYPEORM_PASSWORD: string;

  @IsDefined()
  @IsString()
  TYPEORM_DATABASE: string;

  @IsDefined()
  @IsString()
  TYPEORM_ENTITIES: string;

  @IsDefined()
  @IsBoolean()
  TYPEORM_SYNCHRONIZE: boolean;

  @IsDefined()
  @IsBoolean()
  TYPEORM_LOGGING: boolean;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
