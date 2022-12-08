import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamportService } from '../iamport/iamport.service';
import { User } from '../user/entities/user.entity';
import { PointPayment } from './entities/pointPayment.entity';
import { PointPaymentResolver } from './pointPayment.resolver';
import { PointPaymentService } from './pointPayment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PointPayment, //
      User,
    ]),
  ],
  providers: [
    PointPaymentResolver, //
    PointPaymentService,
    IamportService,
  ],
})
export class PointPaymentModule {}
