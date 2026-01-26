import { Injectable } from '@nestjs/common';
import { PrismaService } from '@time-tracking-app/database';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHello(): Promise<string> {
    const users = await this.prisma.user.findMany();
    return 'Hello, Viso Academy! + Users in database: ' + users.length;
  }
}
