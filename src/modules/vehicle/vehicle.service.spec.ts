import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleService } from './vehicle.service';
import { Vehicle, VehicleAvailabilityStatus, VehicleType } from './entities/vehicle.entity';
import { Company } from '../company/entities/company.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

// Mock TypeORM repository
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(), // findOneBy is often used
  merge: jest.fn(),
  remove: jest.fn(),
});

describe('VehicleService', () => {
  let service: VehicleService;
  let vehicleRepository: MockRepository<Vehicle>;
  // let companyRepository: MockRepository<Company>; // Only if directly used in service

  const companyId = 'test-company-id';
  const vehicleId = 'test-vehicle-id';

  const mockVehicle: Vehicle = {
    id: vehicleId,
    make: 'TestMake',
    model: 'TestModel',
    year: 2022,
    color: 'Red',
    registrationNumber: 'TEST123',
    vin: 'TESTVIN1234567890',
    hourlyRate: 10,
    dailyRate: 100,
    availabilityStatus: VehicleAvailabilityStatus.AVAILABLE,
    type: VehicleType.CAR,
    companyId: companyId,
    company: { id: companyId, name: 'Test Company' } as Company, // Mock company relation
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    mileage: 10000,
    locationAddress: "Test Address",
    imageUrl: "test.jpg",
    assign: jest.fn(), // Added dummy method
    validate: jest.fn().mockResolvedValue(undefined), // Added dummy method
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: createMockRepository<Vehicle>(),
        },
        // If CompanyRepository is injected into VehicleService, mock it here too
        // {
        //   provide: getRepositoryToken(Company),
        //   useValue: createMockRepository<Company>(),
        // },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
    vehicleRepository = module.get<MockRepository<Vehicle>>(getRepositoryToken(Vehicle));
    // companyRepository = module.get<MockRepository<Company>>(getRepositoryToken(Company));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateVehicleDto = {
      make: 'NewMake',
      model: 'NewModel',
      year: 2023,
      color: 'Blue',
      registrationNumber: 'NEW123',
      hourlyRate: 12,
      dailyRate: 120,
      type: VehicleType.CAR,
      vin: 'NEWVIN1234567890'
    };

    it('should successfully create a vehicle', async () => {
      const expectedVehicle = { ...mockVehicle, ...createDto, id: 'new-id', companyId };

      vehicleRepository.create.mockReturnValue(expectedVehicle);
      vehicleRepository.save.mockResolvedValue(expectedVehicle);

      const result = await service.create(createDto, companyId);
      expect(result).toEqual(expectedVehicle);
      expect(vehicleRepository.create).toHaveBeenCalledWith({ ...createDto, companyId });
      expect(vehicleRepository.save).toHaveBeenCalledWith(expectedVehicle);
    });
  });

  describe('findAll', () => {
    it('should return an array of vehicles for a specific company', async () => {
      const vehicles = [mockVehicle, { ...mockVehicle, id: 'vehicle2' }];
      vehicleRepository.find.mockResolvedValue(vehicles);

      const result = await service.findAll(companyId);
      expect(result).toEqual(vehicles);
      expect(vehicleRepository.find).toHaveBeenCalledWith({ where: { companyId } });
    });

    it('should return an empty array if no vehicles exist for the company', async () => {
      vehicleRepository.find.mockResolvedValue([]);
      const result = await service.findAll(companyId);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a vehicle if found and belongs to the company', async () => {
      vehicleRepository.findOne.mockResolvedValue(mockVehicle);
      const result = await service.findOne(vehicleId, companyId);
      expect(result).toEqual(mockVehicle);
      expect(vehicleRepository.findOne).toHaveBeenCalledWith({ where: { id: vehicleId, companyId } });
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      vehicleRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(vehicleId, companyId)).rejects.toThrow(NotFoundException);
    });

     it('should throw NotFoundException if vehicle found but belongs to different company (simulated by findOne returning null for specific companyId)', async () => {
      vehicleRepository.findOne.mockResolvedValue(null); // findOne({where: {id, companyId}}) would return null
      await expect(service.findOne(vehicleId, 'different-company-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateVehicleDto = { color: 'Green', mileage: 15000 };
    const updatedVehicle = { ...mockVehicle, ...updateDto };

    it('should successfully update a vehicle', async () => {
      // First findOne call
      vehicleRepository.findOne.mockResolvedValue(mockVehicle);
      // Mock for merge (though not strictly necessary for this test structure if not asserting its call directly)
      vehicleRepository.merge.mockImplementation((vehicle, dto) => Object.assign(vehicle, dto));
      // Mock for save
      vehicleRepository.save.mockResolvedValue(updatedVehicle);
       // Mock for VIN and registration number checks (assume they don't exist)
      vehicleRepository.findOne.mockResolvedValueOnce(mockVehicle); // for the initial findOne
      vehicleRepository.findOne.mockResolvedValue(null); // for VIN/reg checks


      const result = await service.update(vehicleId, updateDto, companyId);

      expect(vehicleRepository.findOne).toHaveBeenCalledWith({ where: { id: vehicleId, companyId } });
      expect(vehicleRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateDto));
      expect(result.color).toEqual('Green');
      expect(result.mileage).toEqual(15000);
    });

    it('should throw NotFoundException if vehicle to update is not found', async () => {
      vehicleRepository.findOne.mockResolvedValue(null);
      await expect(service.update(vehicleId, updateDto, companyId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if VIN is updated and already exists on another vehicle', async () => {
      const conflictingVehicle = { ...mockVehicle, id: 'other-id', vin: 'EXISTINGVIN' };
      vehicleRepository.findOne.mockResolvedValueOnce(mockVehicle); // Initial find
      vehicleRepository.findOne.mockResolvedValueOnce(conflictingVehicle); // VIN check returns existing

      const dtoWithExistingVin: UpdateVehicleDto = { vin: 'EXISTINGVIN' };
      await expect(service.update(vehicleId, dtoWithExistingVin, companyId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if registrationNumber is updated and already exists', async () => {
      const conflictingVehicle = { ...mockVehicle, id: 'other-id', registrationNumber: 'EXISTINGREG' };

      // Setup for the findOne calls sequence
      vehicleRepository.findOne
        .mockResolvedValueOnce(mockVehicle) // First call for findOne(id, companyId)
        .mockResolvedValueOnce(conflictingVehicle); // Second call for findOne({ where: { registrationNumber } })

      const dtoWithExistingReg: UpdateVehicleDto = { registrationNumber: 'EXISTINGREG' };
      await expect(service.update(vehicleId, dtoWithExistingReg, companyId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should successfully remove a vehicle', async () => {
      vehicleRepository.findOne.mockResolvedValue(mockVehicle);
      vehicleRepository.remove.mockResolvedValue(undefined); // remove usually returns void or the removed entity

      await service.remove(vehicleId, companyId);
      expect(vehicleRepository.findOne).toHaveBeenCalledWith({ where: { id: vehicleId, companyId } });
      expect(vehicleRepository.remove).toHaveBeenCalledWith(mockVehicle);
    });

    it('should throw NotFoundException if vehicle to remove is not found', async () => {
      vehicleRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(vehicleId, companyId)).rejects.toThrow(NotFoundException);
    });
  });
});
