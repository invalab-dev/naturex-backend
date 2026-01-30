import { Controller, NotFoundException, Param, Patch } from '@nestjs/common';
import { User, UserRole, UsersService } from './users.service.js';
import { Request } from 'express';

export type RequestWithUser = {
  user: User;
} & Request;

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('make-admin/:id')
  async makeAdmin(@Param('id') id: string) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.usersService.updateOne({
      id: id,
      roles: [UserRole.ADMIN, ...user.roles],
    });
  }
}
