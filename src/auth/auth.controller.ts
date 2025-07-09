import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {

    constructor(private authService:AuthService){}

    @Post('register')
    register(@Body() dto:RegisterDto){
        return this.authService.register(dto);
    }

    @Post('login')
    login(@Body() dto:LoginDto){
        return this.authService.login(dto);
    }

    @Post('refresh')
    refresh(@Body('refresh_token') token:string){
        return this.authService.refreshToken(token);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Request() req){
        return req.user;
    }
}
