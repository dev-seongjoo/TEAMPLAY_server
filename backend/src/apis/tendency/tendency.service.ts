import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tendency } from './entities/tendency.entity';

@Injectable()
export class TendencyService {
  constructor(
    @InjectRepository(Tendency)
    private readonly tendencyRepository: Repository<Tendency>,
  ) {}

  async findAll() {
    return await this.tendencyRepository.find();
  }

  async create({ name }) {
    return await this.tendencyRepository.save({ name });
  }
}
