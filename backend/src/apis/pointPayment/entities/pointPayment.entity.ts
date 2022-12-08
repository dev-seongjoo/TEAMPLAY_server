import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { User } from "src/apis/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum POINT_PAYMENT_STATUS_ENUM {
    PAYMENT = 'PAYMENT',
    CANCEL = 'CANCEL'
}
registerEnumType(POINT_PAYMENT_STATUS_ENUM, {
    name: 'POINT_PAYMENT_STATUS_ENUM'
})

@Entity()
@ObjectType()
export class PointPayment {
    @PrimaryGeneratedColumn('uuid')
    @Field(() => String)
    id: string;

    @Column()
    @Field(() => String, {nullable: true})
    impUid: string;

    @Column()
    @Field(() => Int)
    amount: number;
    
    @Column({type:'enum', enum: POINT_PAYMENT_STATUS_ENUM })
    @Field(() => POINT_PAYMENT_STATUS_ENUM)
    status: POINT_PAYMENT_STATUS_ENUM;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User)
    user: User;
}