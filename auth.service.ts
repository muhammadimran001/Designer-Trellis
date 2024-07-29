import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signup(signupDto: SignupDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    return this.prisma.user.create({
      data: {
        ...signupDto,
        password: hashedPassword,
        state: 'active', // or another default value
        employees: signupDto.numOfEmployees,
      },
    });
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });
    if (user && await bcrypt.compare(loginDto.password, user.password)) {
      const payload = { email: user.email };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } else {
      throw new Error('Invalid credentials');
    }
  }
}
