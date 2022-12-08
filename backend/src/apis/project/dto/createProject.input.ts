import { Field, InputType, Int, OmitType } from '@nestjs/graphql';
import { Project } from '../entities/project.entity';

@InputType()
export class CreateProjectInput extends OmitType(
  Project,
  [
    'id',
    'isComplete',
    'isStart',
    'createdAt',
    'deletedAt',
    'updatedAt',
    'type',
    'location',
    'leader',
    'point',
    'projectToPositions',
    'platforms',
    'boards',
    'tasks',
    'qnas',
    'reviews',
    'projectMembers',
    'chatRoom',
  ],
  InputType,
) {
  @Field(() => String)
  typeId!: string;

  @Field(() => String)
  locationId!: string;

  @Field(() => [String])
  positionIds!: string[];

  @Field(() => [Int])
  numbers!: number[];

  @Field(() => [String])
  platformIds!: string[];
}
