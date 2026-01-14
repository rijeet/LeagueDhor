import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserService } from '../../APP.BLL/user/user.service';
import { CreateUserDto } from '../../APP.Shared/dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
}
