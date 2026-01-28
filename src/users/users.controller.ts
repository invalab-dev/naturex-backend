import { Controller, NotFoundException, Param, Put } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('make-admin/:id')
  async makeAdmin(@Param('id') id: string) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.usersService.updateOne({
      id: id,
      roles: ['ADMIN', ...user.roles],
    });
  }
}
