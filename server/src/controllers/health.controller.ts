import {type Request, type Response } from 'express';
import { OK } from '../core/success.response.js'; 
import type HealthService from '../services/health.service.js';

class HealthController {
  constructor(private readonly healthService: HealthService ) {}
  getStatus = async (req: Request, res: Response) => {
    const metadata = await this.healthService.getStatus();
    new OK('Get system status successfully', metadata).send(res);
  };
}

export default HealthController;
