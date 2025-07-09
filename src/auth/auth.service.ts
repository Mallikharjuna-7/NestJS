import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

    constructor(@InjectRepository(UserEntity)
                private userRepo : Repository<UserEntity>,
                private jwtService : JwtService){}

    async register(dto : RegisterDto){

        const exists = await this.userRepo.findOne({where:{email:dto.email}});
        if(exists) throw new ConflictException('Email already registered');

        const hashedPassword = await bcrypt.hash(dto.password,10);
        const user = this.userRepo.create({...dto,password:hashedPassword});
        await this.userRepo.save(user);

        return {message : 'Registration successfull',
                statusCode : 200,
                error:''
        };
    }

    async login(dto : LoginDto){

        const user = await this.userRepo.findOne({where:{email:dto.email}});
        if(!user) throw new UnauthorizedException('Invalid email or password');

        const isMatch = await bcrypt.compare(dto.password,user.password);
        if(!isMatch) throw new UnauthorizedException('Invalid email or password');

        const payload = {sub:user.id, email:user.email};
        
        const accessToken = await this.jwtService.signAsync(payload,{
            secret:'access_secret',
            expiresIn:'15m',
        });

        const refreshToken = await this.jwtService.signAsync(payload,{
            secret:'refresh_secret',
            expiresIn:'30m',
        })

        return  {
            access_token: accessToken,
            refresh_token: refreshToken,
            user:{
                id:user.id,
                firstName:user.firstName,
                lastName:user.lastName,
                email:user.email,
                age:user.age,
            },
        };
    }

    async refreshToken(refresh_token: string){
        try{
            const payload = await this.jwtService.verifyAsync(refresh_token,{ secret:'refresh_secret',});
            
            const newAccessToken = await this.jwtService.signAsync(
                {sub:payload.sub, email:payload.email},{secret:'access-secret',expiresIn:'15m'},
            );

            const newRefreshToken = await this.jwtService.signAsync(
                {sub:payload.sub, email:payload.email},{secret:'refresh-secret',expiresIn:'30m'},
            );

            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            };

        }catch(err){
            throw new UnauthorizedException('invalid refresh token');
        }
    }
}
