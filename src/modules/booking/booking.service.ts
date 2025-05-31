import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Brackets, In as TypeOrmIn } from 'typeorm'; // Import In as TypeOrmIn
import { Booking, BookingStatus, PaymentStatus } from './entities/booking.entity';
import { Vehicle, VehicleAvailabilityStatus } from '../vehicle/entities/vehicle.entity';
import { User } from '../users/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // Inject UserRepository if needed for user validation
  ) {}

  async create(createBookingDto: CreateBookingDto, userId: string, requestingCompanyId: string): Promise<Booking> {
    const { vehicleId, startTime, endTime } = createBookingDto;

    const vehicle = await this.vehicleRepository.findOne({ where: { id: vehicleId } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicleId} not found.`);
    }

    // Ensure the vehicle belongs to the company context if requestingCompanyId is relevant for creation
    // This might be the case if a company admin is creating a booking on behalf of a user for one of their vehicles
    // Or, if vehicleId implicitly defines the company. The prompt is a bit ambiguous here.
    // For now, let's assume the vehicle's own companyId is the source of truth.
    const vehicleCompanyId = vehicle.companyId;

    if (vehicle.availabilityStatus !== VehicleAvailabilityStatus.AVAILABLE) {
      throw new ConflictException(`Vehicle with ID ${vehicleId} is not currently available.`);
    }

    // More robust availability check (preventing double bookings)
    const existingBooking = await this.bookingRepository.createQueryBuilder('booking')
      .where('booking.vehicleId = :vehicleId', { vehicleId })
      .andWhere('booking.bookingStatus NOT IN (:...cancelledStatuses)', { cancelledStatuses: [BookingStatus.CANCELLED, BookingStatus.COMPLETED, BookingStatus.PENDING] }) // PENDING might also mean unavailable
      .andWhere(new Brackets(qb => {
        qb.where('booking.startTime < :endTime AND booking.endTime > :startTime', { startTime, endTime });
      }))
      .getOne();

    if (existingBooking) {
      throw new ConflictException(`Vehicle with ID ${vehicleId} is already booked for the requested period.`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (startDate >= endDate) {
      throw new BadRequestException('End time must be after start time.');
    }
    if (startDate < new Date()) {
        throw new BadRequestException('Booking start time cannot be in the past.');
    }


    const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    let totalPrice = 0;

    // Example pricing logic:
    // If duration is less than a day (e.g. 24 hours), use hourly rate. Otherwise use daily.
    // This can be more complex based on business rules.
    const fullDays = Math.floor(durationHours / 24);
    const remainingHours = durationHours % 24;

    if (fullDays > 0) {
        totalPrice += fullDays * vehicle.dailyRate;
    }
    if (remainingHours > 0) {
        // If there are remaining hours, decide if it's cheaper to charge another day or by hour
        if (remainingHours * vehicle.hourlyRate > vehicle.dailyRate && vehicle.dailyRate > 0) {
            totalPrice += vehicle.dailyRate; // Cheaper to charge a full day
        } else {
            totalPrice += remainingHours * vehicle.hourlyRate;
        }
    }

    // Ensure a minimum charge if it's a very short booking, e.g., at least one hour.
    if (durationHours > 0 && totalPrice === 0 && vehicle.hourlyRate > 0) {
        totalPrice = vehicle.hourlyRate; // Minimum one hour charge
    }


    const newBooking = this.bookingRepository.create({
      ...createBookingDto,
      userId,
      companyId: vehicleCompanyId, // Use the vehicle's companyId
      startTime: startDate,
      endTime: endDate,
      totalPrice,
      bookingStatus: BookingStatus.PENDING, // Default status
      paymentStatus: PaymentStatus.PENDING, // Default status
    });

    const savedBooking = await this.bookingRepository.save(newBooking);

    // Update vehicle availability
    vehicle.availabilityStatus = VehicleAvailabilityStatus.BOOKED;
    await this.vehicleRepository.save(vehicle);

    return savedBooking;
  }

  async findUserBookings(userId: string): Promise<Booking[]> {
    return this.bookingRepository.find({ where: { userId }, relations: ['vehicle', 'company'] });
  }

  async findCompanyBookings(companyId: string): Promise<Booking[]> {
    return this.bookingRepository.find({ where: { companyId }, relations: ['vehicle', 'user'] });
  }

  async findOne(id: string, userId: string, userCompanyId?: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id }, relations: ['vehicle', 'user', 'company'] });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found.`);
    }
    // User can access their own booking.
    // Company user (e.g. admin) can access any booking belonging to their company.
    if (booking.userId !== userId && booking.companyId !== userCompanyId) {
      throw new ForbiddenException('You do not have permission to access this booking.');
    }
    return booking;
  }

  async updateStatus(id: string, updateBookingDto: UpdateBookingDto, companyId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id }, relations: ['vehicle'] });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found.`);
    }

    if (booking.companyId !== companyId) {
      throw new ForbiddenException('You do not have permission to update this booking.');
    }

    const { bookingStatus, paymentStatus } = updateBookingDto;

    if (bookingStatus) {
      booking.bookingStatus = bookingStatus;
    }
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    if (bookingStatus === BookingStatus.CANCELLED || bookingStatus === BookingStatus.COMPLETED) {
      if (booking.vehicleId) { // Check if vehicleId exists on booking
        const vehicle = await this.vehicleRepository.findOne({ where: { id: booking.vehicleId }});
        if (vehicle) {
            // Check if other active/confirmed bookings exist for this vehicle before setting to AVAILABLE
            const otherBookings = await this.bookingRepository.count({
                where: {
                    vehicleId: vehicle.id,
                    bookingStatus: TypeOrmIn([BookingStatus.CONFIRMED, BookingStatus.ACTIVE]) // Use TypeOrmIn
                }
            });
            if (otherBookings === 0) {
                 vehicle.availabilityStatus = VehicleAvailabilityStatus.AVAILABLE;
                 await this.vehicleRepository.save(vehicle);
            }
        }
      }
    }

    // If booking confirmed, ensure vehicle is marked BOOKED
    if (bookingStatus === BookingStatus.CONFIRMED || bookingStatus === BookingStatus.ACTIVE) {
        if (booking.vehicle) {
            const vehicle = await this.vehicleRepository.findOne({ where: { id: booking.vehicleId }});
            if (vehicle && vehicle.availabilityStatus !== VehicleAvailabilityStatus.BOOKED) {
                vehicle.availabilityStatus = VehicleAvailabilityStatus.BOOKED;
                await this.vehicleRepository.save(vehicle);
            }
        }
    }


    return this.bookingRepository.save(booking);
  }
}
