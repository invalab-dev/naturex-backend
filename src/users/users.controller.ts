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
import { PostgresService } from '../postgres.service.js';

export type RequestWithUser = {
  user: User;
} & Request;

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly pg: PostgresService,
  ) {}

  @UserRoles(UserRole.ADMIN)
  @Get()
  async listUsers(): Promise<Array<Omit<User, 'password'> & { role: 'admin' | 'customer'; userId: string; orgId?: string | null }>> {
    const users = await this.usersService.findMany();
    // Map orgId code for FE convenience
    const orgRows = await this.pg.sql`SELECT id, code FROM organizations`;
    const orgMap = new Map<string, string>();
    for (const r of orgRows as any[]) orgMap.set(String(r.id), String(r.code));

    return users.map(({ password: _, ...u }) => {
      const isAdmin = u.roles.includes(UserRole.ADMIN);
      const orgId = u.organizationId ? orgMap.get(String(u.organizationId)) ?? null : null;
      return {
        ...(u as any),
        userId: u.id,
        role: isAdmin ? 'admin' : 'customer',
        orgId,
      };
    });
  }

  @UserRoles(UserRole.ADMIN)
  @Post()
  async createUser(@Body() body: Record<string, any>): Promise<Omit<User, 'password'> & { role: 'admin' | 'customer'; userId: string; orgId?: string | null }>{
    // Accept both `roles` (preferred) and `role` (contract-02 FE convenience)
    let roles: UserRole[] | undefined | null = body.roles as any;
    if (!roles && body.role) {
      roles = body.role === 'admin' ? [UserRole.ADMIN] : [UserRole.USER];
    }

    // Accept orgId code and map to organization_id
    let organizationId: string | undefined | null = body.organizationId as any;
    if (!organizationId && body.orgId) {
      const res = await this.pg.sql`SELECT id FROM organizations WHERE code = ${body.orgId as string}`;
      const row = (res as any[]).at(0);
      organizationId = row ? String(row.id) : null;
    }

    const created = await this.usersService.createOne({
      email: body.email as string,
      password: body.password as string,
      roles,
      name: body.name as string | undefined | null,
      phoneNumber: body.phoneNumber as string | undefined | null,
      bio: body.bio as string | undefined | null,
      organizationId,
      language: body.language as string | undefined | null,
      timezone: body.timezone as string | undefined | null,
    });

    const orgCodeRes = created.organizationId
      ? await this.pg.sql`SELECT code FROM organizations WHERE id = ${created.organizationId}`
      : [];
    const orgId = (orgCodeRes as any[]).at(0)?.code ?? null;

    const { password: _, ...insensitive } = created;
    const isAdmin = insensitive.roles.includes(UserRole.ADMIN);
    return {
      ...(insensitive as any),
      userId: insensitive.id,
      role: isAdmin ? 'admin' : 'customer',
      orgId,
    };
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
