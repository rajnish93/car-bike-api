import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Brackets, In as TypeOrmIn } from 'typeorm';
import { BookingService } from './booking.service';
import { Booking, BookingStatus, PaymentStatus } from './entities/booking.entity';
import { Vehicle, VehicleAvailabilityStatus, VehicleType } from '../vehicle/entities/vehicle.entity';
import { User } from '../users/entities/user.entity';
import { Company } from '../company/entities/company.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';

// Mock TypeORM repository
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>> & {
  createQueryBuilder: jest.Mock; // Add this line
};

const createMockRepository = <T = any>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({ // Mock implementation of createQueryBuilder
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
  })),
});


describe('BookingService', () => {
  let service: BookingService;
  let bookingRepository: MockRepository<Booking>;
  let vehicleRepository: MockRepository<Vehicle>;
  let userRepository: MockRepository<User>;

  const userId = 'test-user-id';
  const companyId = 'test-company-id';
  const vehicleId = 'test-vehicle-id';
  const bookingId = 'test-booking-id';

  const mockUser: User = {
    id: userId,
    email: 'test@example.com',
    companyId: companyId,
    firstName: 'Test',
    lastName: 'User',
    password: 'hashedpassword', //
    status: 'ACTIVE' as any,
    source: 'INVITE' as any,
    phone: '1234567890',
    hashPassword: jest.fn().mockResolvedValue(undefined), // Added
    company: null, // Will be set below for clarity, or use mockCompanyEntity if user must have company
    groupId: 'test-group-id', // Added
    group: null, // Added, assuming Group entity mock not needed for these tests
    bookings: [], // Added
    avatar: null, // Added optional relation
    avatarId: null, // Added optional relation
    // other optional fields like designation can be omitted
    assign: jest.fn(),
    validate: jest.fn().mockResolvedValue(undefined),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;


  const mockCompanyEntity: Company = {
    id: companyId,
    name: 'Test Company',
    companySize: '10-50',
    groups: [],
    users: [/* mockUser could be added here if needed */], // mockUser needs company prop set
    vehicles: [],
    bookings: [],
    assign: jest.fn(),
    validate: jest.fn().mockResolvedValue(undefined),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Company;

  // Assign company to mockUser if it's mandatory and used
  mockUser.company = mockCompanyEntity;

  const mockVehicle: Vehicle = {
    id: vehicleId,
    make: 'TestMake',
    model: 'TestModel',
    year: 2022,
    color: 'Red', // Added
    registrationNumber: 'TESTV123', // Added
    hourlyRate: 10,
    dailyRate: 50,
    availabilityStatus: VehicleAvailabilityStatus.AVAILABLE,
    type: VehicleType.CAR,
    companyId: companyId,
    company: mockCompanyEntity, // Use more complete mock
    bookings: [],
    assign: jest.fn(),
    validate: jest.fn().mockResolvedValue(undefined),
    createdAt: new Date(), // Added
    updatedAt: new Date(), // Added
  } as Vehicle;

  const mockBooking: Booking = {
    id: bookingId,
    userId,
    vehicleId,
    companyId,
    startTime: new Date('2024-01-01T10:00:00Z'),
    endTime: new Date('2024-01-01T12:00:00Z'),
    totalPrice: 20,
    bookingStatus: BookingStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PAID,
    user: mockUser,
    vehicle: mockVehicle,
    company: mockCompanyEntity, // Added
    assign: jest.fn(),
    validate: jest.fn().mockResolvedValue(undefined),
    createdAt: new Date(), // Added
    updatedAt: new Date(), // Added
  } as Booking;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: getRepositoryToken(Booking), useValue: createMockRepository<Booking>() },
        { provide: getRepositoryToken(Vehicle), useValue: createMockRepository<Vehicle>() },
        { provide: getRepositoryToken(User), useValue: createMockRepository<User>() },
        // CompanyRepository is not directly injected in BookingService based on current implementation
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingRepository = module.get(getRepositoryToken(Booking));
    vehicleRepository = module.get(getRepositoryToken(Vehicle));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    let createDto: CreateBookingDto;
    let startTime: string;
    let endTime: string;

    beforeEach(() => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 1); // Tomorrow
        startDate.setHours(10, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 2); // 2 hours later

        startTime = startDate.toISOString();
        endTime = endDate.toISOString();

        createDto = { vehicleId, startTime, endTime };
      });


    it('should successfully create a booking', async () => {
      vehicleRepository.findOne.mockResolvedValue(mockVehicle);
      userRepository.findOne.mockResolvedValue(mockUser);
      bookingRepository.create.mockImplementation(dto => ({ ...dto, id: 'new-booking-id' } as Booking));
      bookingRepository.save.mockImplementation(booking => Promise.resolve(booking as Booking));
      vehicleRepository.save.mockResolvedValue({ ...mockVehicle, availabilityStatus: VehicleAvailabilityStatus.BOOKED });

      // Mock for availability check
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // No existing booking
      };
      bookingRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);


      const result = await service.create(createDto, userId, companyId);

      expect(result).toBeDefined();
      expect(result.totalPrice).toEqual(2 * mockVehicle.hourlyRate); // 2 hours * 10
      expect(vehicleRepository.findOne).toHaveBeenCalledWith({ where: { id: vehicleId } });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(bookingRepository.create).toHaveBeenCalled();
      expect(bookingRepository.save).toHaveBeenCalled();
      expect(vehicleRepository.save).toHaveBeenCalledWith(expect.objectContaining({ availabilityStatus: VehicleAvailabilityStatus.BOOKED }));
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      vehicleRepository.findOne.mockResolvedValue(null);
      await expect(service.create(createDto, userId, companyId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user not found', async () => {
      vehicleRepository.findOne.mockResolvedValue({ ...mockVehicle, availabilityStatus: VehicleAvailabilityStatus.AVAILABLE });
      userRepository.findOne.mockResolvedValue(null); // User not found
      bookingRepository.createQueryBuilder.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // No overlap
      } as any);
      await expect(service.create(createDto, userId, companyId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if vehicle is not available (status BOOKED)', async () => {
      vehicleRepository.findOne.mockResolvedValue({ ...mockVehicle, availabilityStatus: VehicleAvailabilityStatus.BOOKED });
      await expect(service.create(createDto, userId, companyId)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if vehicle is not available (status MAINTENANCE)', async () => {
      vehicleRepository.findOne.mockResolvedValue({ ...mockVehicle, availabilityStatus: VehicleAvailabilityStatus.MAINTENANCE });
      await expect(service.create(createDto, userId, companyId)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if start time is after end time', async () => {
      const invalidDto: CreateBookingDto = { ...createDto, startTime: endTime, endTime: startTime };
      vehicleRepository.findOne.mockResolvedValue({ ...mockVehicle, availabilityStatus: VehicleAvailabilityStatus.AVAILABLE });
      userRepository.findOne.mockResolvedValue(mockUser);
      bookingRepository.createQueryBuilder.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // No overlap
      } as any);
      await expect(service.create(invalidDto, userId, companyId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if start time is in the past', async () => {
        const pastStartTime = new Date();
        pastStartTime.setDate(pastStartTime.getDate() -1);
        const pastEndTime = new Date(pastStartTime);
        pastEndTime.setHours(pastEndTime.getHours() + 2);

        const invalidDto: CreateBookingDto = { ...createDto, startTime: pastStartTime.toISOString(), endTime: pastEndTime.toISOString() };
        vehicleRepository.findOne.mockResolvedValue({ ...mockVehicle, availabilityStatus: VehicleAvailabilityStatus.AVAILABLE });
        userRepository.findOne.mockResolvedValue(mockUser);
        bookingRepository.createQueryBuilder.mockReturnValueOnce({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null), // No overlap
          } as any);
        await expect(service.create(invalidDto, userId, companyId)).rejects.toThrow(BadRequestException);
      });

    it('should throw ConflictException if vehicle is already booked for the period', async () => {
      vehicleRepository.findOne.mockResolvedValue({ ...mockVehicle, availabilityStatus: VehicleAvailabilityStatus.AVAILABLE });
      userRepository.findOne.mockResolvedValue(mockUser);

      // This test *specifically* checks for overlap, so getOne returns an existing booking
      bookingRepository.createQueryBuilder.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockBooking),
      } as any);

      await expect(service.create(createDto, userId, companyId)).rejects.toThrow(ConflictException);
    });

    it('should correctly calculate totalPrice for a duration over 24 hours (daily rate)', async () => {
        const longStartDate = new Date();
        longStartDate.setDate(longStartDate.getDate() + 1);
        longStartDate.setHours(10,0,0,0);
        const longEndDate = new Date(longStartDate);
        longEndDate.setDate(longEndDate.getDate() + 2); // 2 full days
        longEndDate.setHours(longEndDate.getHours() + 2); // + 2 hours

        const longCreateDto: CreateBookingDto = {
            vehicleId,
            startTime: longStartDate.toISOString(),
            endTime: longEndDate.toISOString(),
          };

        vehicleRepository.findOne.mockResolvedValue({ ...mockVehicle, availabilityStatus: VehicleAvailabilityStatus.AVAILABLE });
        userRepository.findOne.mockResolvedValue(mockUser);
        bookingRepository.create.mockImplementation(dto => ({ ...dto, id: 'new-booking-id' } as Booking));
        bookingRepository.save.mockImplementation(booking => Promise.resolve(booking as Booking));
        vehicleRepository.save.mockResolvedValue({ ...mockVehicle, availabilityStatus: VehicleAvailabilityStatus.BOOKED });

        bookingRepository.createQueryBuilder.mockReturnValueOnce({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null), // No overlap
          } as any);

        const result = await service.create(longCreateDto, userId, companyId);
        // Expected: (2 days * 50) + (2 hours * 10) = 100 + 20 = 120
        expect(result.totalPrice).toEqual( (2 * mockVehicle.dailyRate) + (2 * mockVehicle.hourlyRate) );
      });

      it('should correctly calculate totalPrice when remaining hours * hourlyRate is more than dailyRate', async () => {
        const vehicleWithDifferentRates = { ...mockVehicle, hourlyRate: 30, dailyRate: 100, availabilityStatus: VehicleAvailabilityStatus.AVAILABLE };
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
        startDate.setHours(10,0,0,0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1); // 1 full day
        endDate.setHours(endDate.getHours() + 4); // + 4 hours

        const dto: CreateBookingDto = {
            vehicleId,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
          };

        vehicleRepository.findOne.mockResolvedValue(vehicleWithDifferentRates);
        userRepository.findOne.mockResolvedValue(mockUser);
        bookingRepository.create.mockImplementation(dto_impl => ({ ...dto_impl, id: 'new-booking-id' } as Booking));
        bookingRepository.save.mockImplementation(booking => Promise.resolve(booking as Booking));

        bookingRepository.createQueryBuilder.mockReturnValueOnce({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null) // No overlap
        } as any);

        const result = await service.create(dto, userId, companyId);
        // Expected: (1 day * 100) + (charge for 1 more day for remaining 4 hours) = 100 + 100 = 200
        expect(result.totalPrice).toEqual(vehicleWithDifferentRates.dailyRate + vehicleWithDifferentRates.dailyRate);
      });

  });

  describe('findUserBookings', () => {
    it('should return bookings for a specific user', async () => {
      const bookings = [mockBooking, { ...mockBooking, id: 'booking2' }];
      bookingRepository.find.mockResolvedValue(bookings);
      const result = await service.findUserBookings(userId);
      expect(result).toEqual(bookings);
      expect(bookingRepository.find).toHaveBeenCalledWith({ where: { userId }, relations: ['vehicle', 'company'] });
    });
  });

  describe('findCompanyBookings', () => {
    it('should return bookings for a specific company', async () => {
      const bookings = [mockBooking, { ...mockBooking, id: 'booking2' }];
      bookingRepository.find.mockResolvedValue(bookings);
      const result = await service.findCompanyBookings(companyId);
      expect(result).toEqual(bookings);
      expect(bookingRepository.find).toHaveBeenCalledWith({ where: { companyId }, relations: ['vehicle', 'user'] });
    });
  });

  describe('findOne', () => {
    it('should return a booking if found and user owns it', async () => {
      bookingRepository.findOne.mockResolvedValue(mockBooking);
      const result = await service.findOne(bookingId, userId, 'other-company-id'); // User owns, companyId doesn't match
      expect(result).toEqual(mockBooking);
    });

    it('should return a booking if found and user is part of booking company', async () => {
      bookingRepository.findOne.mockResolvedValue(mockBooking);
      const result = await service.findOne(bookingId, 'other-user-id', companyId); // User doesn't own, but companyId matches
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException if booking not found', async () => {
      bookingRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(bookingId, userId, companyId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own and is not part of booking company', async () => {
      bookingRepository.findOne.mockResolvedValue(mockBooking);
      await expect(service.findOne(bookingId, 'other-user-id', 'other-company-id')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    const updateDto: UpdateBookingDto = { bookingStatus: BookingStatus.CONFIRMED };

    it('should successfully update booking status', async () => {
      const bookingToUpdate = { ...mockBooking, bookingStatus: BookingStatus.PENDING, vehicle: mockVehicle };
      const updatedBooking = { ...bookingToUpdate, ...updateDto };

      bookingRepository.findOne.mockResolvedValue(bookingToUpdate);
      bookingRepository.save.mockResolvedValue(updatedBooking);
      vehicleRepository.findOne.mockResolvedValue(mockVehicle); // For vehicle status update logic
      vehicleRepository.save.mockResolvedValue(mockVehicle); // For vehicle status update logic

      const result = await service.updateStatus(bookingId, updateDto, companyId);
      expect(result.bookingStatus).toEqual(BookingStatus.CONFIRMED);
      expect(bookingRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateDto));
    });

    it('should set vehicle status to AVAILABLE if booking CANCELLED and no other bookings', async () => {
      const bookingToCancel = { ...mockBooking, vehicleId: mockVehicle.id, vehicle: mockVehicle, bookingStatus: BookingStatus.ACTIVE };

      bookingRepository.findOne.mockResolvedValue(bookingToCancel);
      bookingRepository.save.mockResolvedValue({ ...bookingToCancel, bookingStatus: BookingStatus.CANCELLED });
      vehicleRepository.findOne.mockResolvedValue(mockVehicle);
      bookingRepository.count.mockResolvedValue(0); // No other active/confirmed bookings
      vehicleRepository.save.mockResolvedValue({ ...mockVehicle, availabilityStatus: VehicleAvailabilityStatus.AVAILABLE });

      await service.updateStatus(bookingId, { bookingStatus: BookingStatus.CANCELLED }, companyId);

      expect(vehicleRepository.save).toHaveBeenCalledWith(expect.objectContaining({ availabilityStatus: VehicleAvailabilityStatus.AVAILABLE }));
    });

    it('should NOT set vehicle status to AVAILABLE if booking CANCELLED but other bookings exist', async () => {
        const bookingToCancel = { ...mockBooking, vehicleId: mockVehicle.id, vehicle: mockVehicle, bookingStatus: BookingStatus.ACTIVE };

        bookingRepository.findOne.mockResolvedValue(bookingToCancel);
        bookingRepository.save.mockResolvedValue({ ...bookingToCancel, bookingStatus: BookingStatus.CANCELLED });
        vehicleRepository.findOne.mockResolvedValue(mockVehicle);
        bookingRepository.count.mockResolvedValue(1); // Other active/confirmed bookings exist
        // vehicleRepository.save should NOT be called to make vehicle AVAILABLE
        // vehicleRepository.save.mockClear(); // Clear previous calls if any

        await service.updateStatus(bookingId, { bookingStatus: BookingStatus.CANCELLED }, companyId);

        // Check that vehicleRepository.save was called for booking, but not necessarily to change status to available
        // The vehicle status would remain BOOKED due to other bookings.
        // This test focuses on it *not* becoming AVAILABLE.
        // A more precise test would be to check if save was called with BOOKED or if it wasn't called with AVAILABLE.
        expect(vehicleRepository.save).not.toHaveBeenCalledWith(expect.objectContaining({ availabilityStatus: VehicleAvailabilityStatus.AVAILABLE }));
      });


    it('should set vehicle status to BOOKED if booking CONFIRMED and vehicle was AVAILABLE', async () => {
        const vehicleAvailable = { ...mockVehicle, availabilityStatus: VehicleAvailabilityStatus.AVAILABLE};
        const bookingToConfirm = { ...mockBooking, vehicleId: vehicleAvailable.id, vehicle: vehicleAvailable, bookingStatus: BookingStatus.PENDING };

        bookingRepository.findOne.mockResolvedValue(bookingToConfirm);
        bookingRepository.save.mockResolvedValue({ ...bookingToConfirm, bookingStatus: BookingStatus.CONFIRMED });
        vehicleRepository.findOne.mockResolvedValue(vehicleAvailable); // Vehicle is currently AVAILABLE
        vehicleRepository.save.mockResolvedValue({ ...vehicleAvailable, availabilityStatus: VehicleAvailabilityStatus.BOOKED });

        await service.updateStatus(bookingId, { bookingStatus: BookingStatus.CONFIRMED }, companyId);

        expect(vehicleRepository.save).toHaveBeenCalledWith(expect.objectContaining({ availabilityStatus: VehicleAvailabilityStatus.BOOKED }));
      });

    it('should throw NotFoundException if booking to update is not found', async () => {
      bookingRepository.findOne.mockResolvedValue(null);
      await expect(service.updateStatus(bookingId, updateDto, companyId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if company does not own the booking', async () => {
      bookingRepository.findOne.mockResolvedValue(mockBooking); // mockBooking belongs to companyId
      await expect(service.updateStatus(bookingId, updateDto, 'other-company-id')).rejects.toThrow(ForbiddenException);
    });
  });
});
