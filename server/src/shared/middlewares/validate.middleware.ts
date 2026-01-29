import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '@shared/core/asyncHandler.js';

export const validate = (schema: any) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // St1: Validate and parse data
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // St2: Set parsed data to request
    req.body = parsed.body;
    if (parsed.query) Object.assign(req.query, parsed.query);
    if (parsed.params) Object.assign(req.params, parsed.params);
    next();
  });
