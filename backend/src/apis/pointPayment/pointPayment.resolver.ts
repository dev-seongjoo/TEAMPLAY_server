import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/common/auth/gql-user.param';
import { IamportService } from '../iamport/iamport.service';
import { PointPayment } from './entities/pointPayment.entity';
import { PointPaymentService } from './pointPayment.service';

@Resolver()
export class PointPaymentResolver {
  constructor(
    private readonly pointPaymentService: PointPaymentService,
    private readonly iamportservice: IamportService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => PointPayment)
  async createPointPayment(
    @Args('impUid') impUid: string,
    @Args('amount') amount: number,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    //검증로직 필요
    //1. 아임포트에 요청해서 결제 완료 기록이 존재하는지 확인
    const token = await this.iamportservice.getToken();
    await this.iamportservice.checkPaid({ impUid, amount, token });
    //2. pointPayment테이블에는 impUid가 한번만 존재해야 함(중복결제 체크)
    await this.pointPaymentService.checkDuplicate({ impUid }); //디비로 연결되는 지점에 Lock걸어주기 ‼
    return await this.pointPaymentService.create({
      impUid,
      amount,
      currentUser,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => PointPayment)
  async cancelPointPayment(
    @Args('impUid') impUid: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    //1 이미 취소된 건인지
    await this.pointPaymentService.checkAlreadyCanceled({ impUid });

    //2 취소하기에 충분한 포인트 잔액이 남았는지
    await this.pointPaymentService.checkHasCancelablePoint({
      impUid,
      currentUser,
    });

    //3 실제로 아임포트에 취소 요청
    const token = await this.iamportservice.getToken();
    const canceledAmount = await this.iamportservice.cancelPaid({
      impUid,
      token,
    });

    //4 pointTransaction테이블에서 결제 취소 등록하기
    return await this.pointPaymentService.cancel({
      impUid,
      amount: canceledAmount,
      currentUser,
    });
  }
}
