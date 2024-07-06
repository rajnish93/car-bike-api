import { PartialType } from '@nestjs/swagger';
import { CreateLoadFileDto } from './create-load-file.dto';

export class UpdateLoadFileDto extends PartialType(CreateLoadFileDto) {}
