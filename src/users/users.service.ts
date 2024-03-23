import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  save(createUserDto: CreateUserDto) {
    return this.prisma.user.upsert({
      where: createUserDto,
      create: createUserDto,
      update: createUserDto,
    });
  }

  findOne(email: string, password: string) {
    return this.prisma.user.findUnique({ where: { email, password } });
  }
}
