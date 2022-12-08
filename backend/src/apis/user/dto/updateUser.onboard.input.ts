import { Field, InputType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@InputType()
export class UpdateUserOnboardInput extends PickType(User, ['career', 'imgUrl'], InputType) {
  @Field(() => [String])
  tendencyId: string[];

  @Field(() => String)
  positionId: string;

  @Field(() => [String])
  typeId: string[];
}
