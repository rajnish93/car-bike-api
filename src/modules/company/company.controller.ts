import {
  Controller,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { AdminSignupGuard } from 'src/modules/auth/admin-signup.guard';
import { CompanyAdminDto } from './dto/company-admin.dto';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOkResponse({ type: DeleteResult })
  @ApiNotFoundResponse({ description: 'Entity with given ID not found' })
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }

  @UseGuards(AdminSignupGuard)
  @Post('setup-admin')
  async setupAdmin(@Body() companyAdminDto: CompanyAdminDto) {
    return await this.companyService.setupAdmin(companyAdminDto);
  }
}
