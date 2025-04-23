import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/envs';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {

	const logger = new Logger('AuthMS - Main');

	const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,
		{
			transport: Transport.NATS,
			options: {
				servers: envs.natsServer
		},
			
		}
	);

	await app.listen();
	logger.log(`Auth Microservice Running on port ${ envs.PORT }`);
}
bootstrap();
