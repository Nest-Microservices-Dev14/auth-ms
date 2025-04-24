import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RegisterUserDto } from './dto/register.user.dto';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login.user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config/envs';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly jwtService: JwtService
    ){
        super();
    }
    
    onModuleInit() {
        this.$connect();
        this.logger.log('MongoDB Connected');
    }

    async signJWT( payload: JwtPayload ) {
        return this.jwtService.sign( payload );
    }

    async registerUser( registerUserDto: RegisterUserDto ){
        const { email, name, password } = registerUserDto;
        try {
            const user = await this.user.findUnique({
                where: { email }
            });
    
            if( user ) {
                throw new RpcException({
                    status: 400,
                    message: 'User already exists'
                });
            }
            
            const newUser = await this.user.create({
                data: {
                    email,
                    name,
                    password: bcrypt.hashSync( password, 10 )
                }
            });
    
            const { password: _, ...rest } = newUser;
    
            return {
                user: rest,
                token: await this.signJWT( rest )
            }
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async loginUser( loginUserDto: LoginUserDto ){
        const { email, password } = loginUserDto;
        try {
            const user = await this.user.findUnique({
                where: { email }
            });

            if( !user ) {
                throw new RpcException({
                    status: 400,
                    message: 'User/Password not valid'
                });
            }
            
            const isPasswordValid = bcrypt.compareSync( password, user.password );
            if( !isPasswordValid ){
                throw new RpcException({
                    status: 400,
                    message: 'User/Password not valid'
                });
            
            }

            const { password: _, ...rest } = user;

            return {
                user: rest,
                token: await this.signJWT( rest )
            }

        } catch (error) {
            throw new RpcException(error);
        }
    }

    async verifyToken( token: string ) {
        try {
            const { sub, iat, exp, ...user } = this.jwtService.verify(token,{
                secret: envs.jwtSecret
            });

            return {
                user,
                token: await this.signJWT( user )
            }
        } catch (error) {
            throw new RpcException({
                status: 401,
                message:'Invalid token'
            });
        }
    }

}