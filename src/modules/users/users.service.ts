import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateLoadFileDto } from '../load-file/dto/create-load-file.dto';
import { LoadFileService } from '../load-file/load-file.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly loadFileService: LoadFileService,
  ) {}

  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async create(userParams: Partial<User>): Promise<Partial<User>> {
    const { email, firstName, lastName, password } = userParams;
    // Create a new user entity based on the DTO
    const newUser = this.usersRepository.create({
      email,
      firstName,
      lastName,
      password,
    });

    // Save the new user to the database
    const savedUser = await this.usersRepository.save(newUser);

    return this.stripSensitiveFields(savedUser);
  }

  private stripSensitiveFields(user: User): Partial<User> {
    const sensitiveFields = ['password', 'status', 'source', 'avatarId'];
    for (const field of sensitiveFields) {
      delete user[field];
    }
    return user;
  }

  async addAvatar(userId: string, imageBuffer: Buffer, filename: string) {
    // Find the user by userId
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException(`User with id ${userId} not found`);
    }

    // Save the new avatar file
    const createFileDto = new CreateLoadFileDto();
    createFileDto.filename = filename;
    createFileDto.data = imageBuffer;
    const avatar = await this.loadFileService.create(createFileDto);

    const oldAvatarId = user.avatarId;
    // Update the user's avatarId
    user.avatarId = avatar.id;
    await this.usersRepository.update(userId, { avatarId: avatar.id });

    // Remove the previous avatar file if exists
    if (oldAvatarId) {
      await this.loadFileService.remove(oldAvatarId);
    }

    return { message: 'Avatar updated successfully' };
  }

  async getUserInfo(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    return {
      userId: user.id,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
    };
  }
}
