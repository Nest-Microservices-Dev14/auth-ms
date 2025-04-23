import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @MessagePattern('auth.register.user')
    register() {
        return 'Register!!'
    }

    @MessagePattern('auth.login.user')
    login() {
        return 'Login!!!'
    }

    @MessagePattern('auth.verify.user')
    verify() {
        return 'verify!!'
    }

}