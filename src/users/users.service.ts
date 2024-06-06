import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findOne(queryFilter: FindOneOptions<User>) {
    return this.userRepository.findOne(queryFilter);
  }

  findAll(queryFilter): Promise<User[]> {
    return this.userRepository.find(queryFilter);
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username: username },
    });
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(newUser);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne({ where: { id } });

    const { password } = updateUserDto;
    if (password) {
      updateUserDto.password = await bcrypt.hash(password, 10);
    }

    const updateUserData = {
      ...user,
      ...updateUserDto,
    };
    await this.userRepository.update(id, updateUserData);

    return this.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete({ id });
  }
}
