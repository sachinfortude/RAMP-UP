import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  checkHealth() {
    return { status: 'ok' }; // Simply return a 200 OK response
  }
}
