import { ConflictException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import {
  PointPayment,
  POINT_PAYMENT_STATUS_ENUM,
} from './entities/pointPayment.entity';

@Injectable()
export class PointPaymentService {
  constructor(
    @InjectRepository(PointPayment)
    private readonly pointPaymentRepository: Repository<PointPayment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly connection: Connection,
  ) {}

  async checkDuplicate({ impUid }) {
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      const result = await this.pointPaymentRepository.findOne(
        { impUid },
        { lock: { mode: 'pessimistic_write' } },
      );
      if (result) throw new ConflictException('이미 결제되었습니다');
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async checkAlreadyCanceled({ impUid }) {
    const pointPayment = await this.pointPaymentRepository.findOne({
      impUid,
      status: POINT_PAYMENT_STATUS_ENUM.CANCEL,
    });
    if (pointPayment) throw new ConflictException();
  }

  async checkHasCancelablePoint({ impUid, currentUser }) {
    const pointPayment = await this.pointPaymentRepository.findOne({
      impUid,
      user: { id: currentUser.id },
      status: POINT_PAYMENT_STATUS_ENUM.PAYMENT,
    });
    if (!pointPayment)
      throw new UnprocessableEntityException('결제 기록이 존재하지 않습니다.');
    const user = await this.userRepository.findOne({ id: currentUser.id });
    if (user.point < pointPayment.amount)
      throw new UnprocessableEntityException('포인트 부족');
  }

  async cancel({ impUid, amount, currentUser }) {
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      const pointPayment = await this.pointPaymentRepository.create({
        impUid: impUid,
        amount: -amount,
        user: currentUser,
        status: POINT_PAYMENT_STATUS_ENUM.CANCEL,
      });
      await queryRunner.manager.save(pointPayment);
      await queryRunner.commitTransaction();
      return pointPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async create({ 
    impUid, 
    amount, 
    currentUser, 
    status = POINT_PAYMENT_STATUS_ENUM.PAYMENT, 
  }) {
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // 1. pointPayment 테이블에 거래기록 생성
      const pointPayment = this.pointPaymentRepository.create({
        impUid: impUid,
        amount: amount,
        user: currentUser,
        status,
      });
      await queryRunner.manager.save(pointPayment);

      // 2. 유저정보를 조회
      const user = await queryRunner.manager.findOne(
        User,
        { id: currentUser.id },
      );

      // 3. 유저의 돈 업데이트
      const updatedUser = this.userRepository.create({
        ...user,
        point: user.point + amount,
      });

      //4. 최종결과 돌려주기
      await queryRunner.manager.save(updatedUser);
      await queryRunner.commitTransaction();
      return pointPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
