import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: 'ok'; service: 'longzhen-api' } {
    return { status: 'ok', service: 'longzhen-api' };
  }
}
