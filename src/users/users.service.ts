import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserDto } from './user.dto';
import { hashSync as bcryptHashSync } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>
  ) {}

  async createUser(newUser: UserDto) {
    const userAlreadyRegistered = await this.findByUsername(newUser.username);

    if (userAlreadyRegistered) {
      throw new HttpException(
        `User '${newUser.username}' already registered`,
        HttpStatus.CONFLICT,
      );
    }

    const dbUser = new UserEntity();
    dbUser.username = newUser.username;
    dbUser.passwordHash = bcryptHashSync(newUser.password, 10);

    const { id, username } = await this.usersRepository.save(dbUser);

    return { id, username };
  }

  async findByUsername(username: string): Promise<UserDto | null> {
    const userFound = await this.usersRepository.findOne({
      where: { username },
    });

    if (!userFound) {
      return null;
    }

    return {
      id: userFound.id,
      username: userFound.username,
      password: userFound.passwordHash,
    };
  }
}
