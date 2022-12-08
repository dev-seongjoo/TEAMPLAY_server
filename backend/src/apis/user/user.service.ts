import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from '../position/entities/position.entity';
import { Tendency } from '../tendency/entities/tendency.entity';
import { Type } from '../type/entities/type.entity';
import { User } from './entities/user.entity';
import axios from 'axios';
import bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    @InjectRepository(Tendency)
    private readonly tendencyRepository: Repository<Tendency>,
    @InjectRepository(Type)
    private readonly typeRepository: Repository<Type>,
  ) {}

  async findOne({ email }) {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['tendencys', 'position', 'types'],
    });
  }

  async findAll({ page }) {
    return await this.userRepository.find({
      relations: ['tendencys', 'position'],
      take: 15,
      skip: 15 * (page - 1),
    });
  }

  checkValidationEmail({ email }) {
    return email.includes('@') && email.includes('.');
  }

  getToken(mycount) {
    return String(Math.floor(Math.random() * 10 ** mycount)).padStart(mycount, '0');
  }

  getTemplateToken({ mytoken }) {
    return `
      <html>
        <body>
          <h3>팀플 회원가입 인증번호는 ${mytoken}입니다.</h3>
        </body>
      </html>
    `;
  }

  async sendEmail({ email, template }) {
    const appKey = process.env.EMAIL_APP_KEY;
    const XSecretKey = process.env.EMAIL_X_SECRET_KEY;
    const sender = process.env.EMAIL_SENDER;

    await axios.post(
      `https://api-mail.cloud.toast.com/email/v2.0/appKeys/${appKey}/sender/mail`,
      {
        senderAddress: sender,
        title: `팀플레이 이메일 인증번호입니다.`,
        body: template,
        receiverList: [
          {
            receiveMailAddr: email,
            receiveType: 'MRT0',
          },
        ],
      },
      {
        headers: {
          'X-Secret-Key': XSecretKey,
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    );
  }

  async checkUser(email) {
    const users = await this.userRepository.findOne({
      email,
    });
    if (users) throw new ConflictException('중복된 이메일 입니다.');
  }

  async create({ createUserInput }) {
    return await this.userRepository.save(createUserInput);
  }

  async updateByOnboard({ id, updateUserOnboardInput }) {
    const { positionId, tendencyId, typeId, career } = updateUserOnboardInput;

    const position = await this.positionRepository.findOne({ id: positionId });
    if (!position) throw new BadRequestException('존재하지 않는 포지션입니다.');

    const tendencys = await Promise.all(tendencyId.map(e => this.tendencyRepository.findOne({ id: e })));
    if (!tendencys.every(e => e)) throw new BadRequestException('존재하지 않는 성향입니다.');

    const types = await Promise.all(typeId.map(e => this.typeRepository.findOne({ id: e })));
    if (!types.every(e => e)) throw new BadRequestException('존재하지 않는 분야입니다.');

    const user = await this.userRepository.findOne({ id });
    const newUser = {
      ...user,
      career,
      position,
      tendencys,
      types,
      imgUrl: updateUserOnboardInput.imgUrl,
    };
    return await this.userRepository.save(newUser);
  }

  async update({ id, name, password, changePassword }) {
    const user = await this.userRepository.findOne({ id });
    const isAuthenticated = await bcrypt.compare(password, user.password);
    if (!isAuthenticated) throw new UnauthorizedException('비밀번호가 틀립니다.');
    const pwd = await bcrypt.hash(changePassword, 10);
    const newUser = {
      ...user,
      name,
      password: pwd,
    };
    return await this.userRepository.save(newUser);
  }

  async delete({ id }) {
    const result = await this.userRepository.softDelete({ id });
    return result.affected ? true : false;
  }

  async deleteHard({ email }) {
    const result = await this.userRepository.delete({ email });
    return result.affected ? true : false;
  }
}
