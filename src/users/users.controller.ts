import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { User, UserRole, UsersService } from './users.service.js';
import { UserRoles } from '../auth/guards/jwt-access.guard.js';

export type RequestWithUser = {
  user: User;
} & Request;

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UserRoles(UserRole.ADMIN)
  @Get()
  async listUsers(): Promise<Array<Omit<User, 'password'>>> {
    const users = await this.usersService.findMany();
    return users.map(({ password: _, ...u }) => u);
  }

  @UserRoles(UserRole.ADMIN)
  @Post()
  async createUser(@Body() body: Record<string, any>): Promise<Omit<User, 'password'>> {
    const created = await this.usersService.createOne({
      email: body.email as string,
      password: body.password as string,
      roles: body.roles as UserRole[] | undefined | null,
      name: body.name as string | undefined | null,
      phoneNumber: body.phoneNumber as string | undefined | null,
      bio: body.bio as string | undefined | null,
      organizationId: body.organizationId as string | undefined | null,
      language: body.language as string | undefined | null,
      timezone: body.timezone as string | undefined | null,
    });
    const { password: _, ...insensitive } = created;
    return insensitive;
  }

  @UserRoles(UserRole.ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteOne(id);
    return null;
  }

  @UserRoles(UserRole.ADMIN)
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
