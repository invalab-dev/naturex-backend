import { Controller } from '@nestjs/common';
import { ResourcesService } from './resources.service.js';
import { UsersService } from '../users/users.service.js';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService, private usersService: UsersService) {}


}
