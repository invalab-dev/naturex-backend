import { Controller, Param, Put } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('make-admin/:id')
  async makeAdmin(@Param('id') id: string) {
    await this.usersService.updateOne({ id: id, role: 'ADMIN' });
  }
}
