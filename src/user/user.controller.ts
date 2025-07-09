import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './user.dto';

@Controller('user')
export class UserController {

    constructor(private readonly userService:UserService){}

    @Post()
    create(@Body() userDto:UserDto){
        console.log('Incoming :',userDto);
        return this.userService.create(userDto);
    }
}
