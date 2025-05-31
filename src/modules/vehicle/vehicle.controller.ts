import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Adjusted path
import { User } from '../../decorators/user/user.decorator'; // Adjusted path
import { Vehicle } from './entities/vehicle.entity';

@ApiTags('Vehicles')
@ApiBearerAuth() // Indicates that JWT is used for authentication
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
@Controller('vehicles') // Route prefix for this controller
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vehicle for the authenticated user\'s company' })
  @ApiResponse({ status: 201, description: 'Vehicle created successfully.', type: Vehicle })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (e.g., VIN already exists).' })
  create(
    @Body() createVehicleDto: CreateVehicleDto,
    @User('companyId') companyId: string, // Extract companyId from JWT payload
  ): Promise<Vehicle> {
    return this.vehicleService.create(createVehicleDto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'List all vehicles for the authenticated user\'s company' })
  @ApiResponse({ status: 200, description: 'List of vehicles.', type: [Vehicle] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@User('companyId') companyId: string): Promise<Vehicle[]> {
    return this.vehicleService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific vehicle by ID for the authenticated user\'s company' })
  @ApiParam({ name: 'id', description: 'Vehicle ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Vehicle details.', type: Vehicle })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Vehicle not found.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @User('companyId') companyId: string,
  ): Promise<Vehicle> {
    return this.vehicleService.findOne(id, companyId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a vehicle for the authenticated user\'s company' })
  @ApiParam({ name: 'id', description: 'Vehicle ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Vehicle updated successfully.', type: Vehicle })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (e.g., VIN already exists on another vehicle).' })
  @ApiResponse({ status: 404, description: 'Vehicle not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @User('companyId') companyId: string,
  ): Promise<Vehicle> {
    return this.vehicleService.update(id, updateVehicleDto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a vehicle for the authenticated user\'s company' })
  @ApiParam({ name: 'id', description: 'Vehicle ID (UUID)', type: String })
  @ApiResponse({ status: 204, description: 'Vehicle deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Vehicle not found.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @User('companyId') companyId: string,
  ): Promise<void> {
    return this.vehicleService.remove(id, companyId);
  }
}
