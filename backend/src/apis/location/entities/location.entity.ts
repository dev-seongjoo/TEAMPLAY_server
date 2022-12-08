import { Field, ObjectType } from '@nestjs/graphql';
import { Region } from 'src/apis/region/entities/region.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Location {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @Column()
  @Field(() => String)
  name!: string;

  @ManyToOne(() => Region, { cascade: true, onDelete: 'CASCADE' })
  @Field(() => Region)
  region!: Region;
}
