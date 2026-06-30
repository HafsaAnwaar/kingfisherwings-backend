import { plainToInstance } from 'class-transformer';
import { User } from '@prisma/client';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {

  static toEntity(user: User): UserEntity {

    return plainToInstance(
      UserEntity,
      user,
      {
        excludeExtraneousValues: true,
      },
    );

  }

  static toEntities(
    users: User[],
  ): UserEntity[] {

    return users.map((user) =>
      this.toEntity(user),
    );

  }

}