import { ConfigService as BaseConfigService } from '@nestjs/config';
import { Expose, Type, plainToInstance } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsPositive,
  IsString,
  validateSync,
} from 'class-validator';
import { mapValidationErrors } from 'src/common/validation-error.helper';

class Config {
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  MONGODB_URI: string;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  BULLMQ_HOST: string;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsPositive()
  @Type(() => Number)
  BULLMQ_PORT: number;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  API_KEY: string;
}

export class ConfigService extends BaseConfigService {
  private readonly appConfig: Config = new Config();

  constructor() {
    super();
    const config = plainToInstance(Config, process.env, {
      excludeExtraneousValues: true,
    });

    const errors = validateSync(config, {
      skipMissingProperties: false,
      whitelist: true,
    });

    if (errors.length > 0) {
      console.error(`Config validation error: ${mapValidationErrors(errors)}`);
      process.exit(1);
    }

    this.appConfig = config;
  }

  get config(): Config {
    return this.appConfig;
  }
}
