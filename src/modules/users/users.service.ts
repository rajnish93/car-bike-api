import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async create(userParams: Partial<User>): Promise<User> {
    const { email, firstName, lastName, password } = userParams;
    // Create a new user entity based on the DTO
    const newUser = this.usersRepository.create({
      email,
      firstName,
      lastName,
      password,
    });

    // Save the new user to the database
    return await this.usersRepository.save(newUser);
  }
}
