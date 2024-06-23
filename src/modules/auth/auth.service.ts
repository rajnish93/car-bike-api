import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthUserDto } from '../users/dto/auth-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    const existingUser = await this.usersService.findByEmail(email);
    console.log('name::', name);
    const names = { firstName: '', lastName: '' };
    if (name) {
      const [firstName, ...rest] = name.split(' ');
      names['firstName'] = firstName;
      if (rest.length != 0) {
        const lastName = rest.join(' ');
        names['lastName'] = lastName;
      }
    }
    const { firstName, lastName } = names;

    console.log('firstName::', firstName);
    console.log('lastName::', lastName);

    if (existingUser) {
      throw new ConflictException('The user is already registered.');
    } else {
      return await this.usersService.create({
        email,
        password,
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      });
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    const isVerified = await bcrypt.compare(password, user.password);

    return isVerified ? user : null;
  }

  async signin(params: AuthUserDto) {
    const user = await this.validateUser(params.email, params.password);

    if (user) {
      const payload = { username: user.id, sub: user.email };

      return {
        access_token: this.jwtService.sign(payload),
      };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
