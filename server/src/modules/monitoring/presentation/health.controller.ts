import { type Request, type Response } from 'express';
import { OK } from '@shared/core/success.response.js';
import type HealthService from '../use-cases/health.service.js';

class HealthController {
  constructor(private readonly healthService: HealthService) {}
  getStatus = async (req: Request, res: Response) => {
    const data = await this.healthService.getStatus();
    new OK({ message: 'Get system status successfully', data }).send(res);
  };
}

export default HealthController;
