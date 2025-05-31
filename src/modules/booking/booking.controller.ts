import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch, // Changed from Put to Patch for partial updates
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query, // For company bookings if not part of path
  ForbiddenException, // Import ForbiddenException
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../../decorators/user/user.decorator'; // Assuming path to User decorator
import { Booking } from './entities/booking.entity';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully.', type: Booking })
  @ApiResponse({ status: 400, description: 'Invalid input (e.g., time conflict, invalid dates).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Vehicle or User not found.' })
  @ApiResponse({ status: 409, description: 'Vehicle not available for the selected period.' })
  create(
    @Body() createBookingDto: CreateBookingDto,
    @User('id') userId: string,
    @User('companyId') userCompanyId: string, // companyId of the user, might be used if user is an admin creating for their company
  ): Promise<Booking> {
    // The service's `create` method takes userId and a `requestingCompanyId`.
    // If the user is a regular user, their own companyId might not be relevant here,
    // as the vehicle's companyId will be used.
    // If the user is a company admin creating a booking, userCompanyId could be used for validation.
    // For now, passing userCompanyId as the third param, service logic will determine its use.
    return this.bookingService.create(createBookingDto, userId, userCompanyId);
  }

  @Get('/user')
  @ApiOperation({ summary: 'Get all bookings for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user bookings.', type: [Booking] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findUserBookings(@User('id') userId: string): Promise<Booking[]> {
    return this.bookingService.findUserBookings(userId);
  }

  // Endpoint for company to get its bookings.
  // Requires companyId from user token, not as a path param, to ensure security.
  @Get('/company')
  @ApiOperation({ summary: 'Get all bookings for the authenticated user\'s company' })
  @ApiResponse({ status: 200, description: 'List of company bookings.', type: [Booking] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (user does not belong to a company or no companyId in token).' })
  findCompanyBookings(@User('companyId') companyId: string): Promise<Booking[]> {
    if (!companyId) {
        throw new ForbiddenException('User is not associated with a company.');
    }
    return this.bookingService.findCompanyBookings(companyId);
  }

  // Alternative for system admin to get bookings for any company by companyId in path
  // This would require a different role/guard (e.g. AdminGuard)
  // For now, sticking to user's own company via token

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Booking details.', type: Booking })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (user does not own this booking or is not part of the booking\'s company).' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @User('id') userId: string,
    @User('companyId') userCompanyId: string, // companyId of the user from token
  ): Promise<Booking> {
    return this.bookingService.findOne(id, userId, userCompanyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking status (e.g., confirm, cancel)' })
  @ApiParam({ name: 'id', description: 'Booking ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Booking status updated successfully.', type: Booking })
  @ApiResponse({ status: 400, description: 'Invalid input for status.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (user cannot update this booking, not part of company).' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @User('companyId') companyId: string, // Action performed by a company user
  ): Promise<Booking> {
    if (!companyId) {
        throw new ForbiddenException('User is not associated with a company to perform this action.');
    }
    return this.bookingService.updateStatus(id, updateBookingDto, companyId);
  }
}
