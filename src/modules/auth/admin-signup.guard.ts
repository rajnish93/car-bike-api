import { Injectable, CanActivate } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminSignupGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(): Promise<any> {
    return (await this.usersService.getCount()) === 0;
  }
}
