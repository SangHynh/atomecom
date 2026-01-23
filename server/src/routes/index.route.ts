import express from 'express';
import healthRouter from './health.route.js';

const router = express.Router();

router.get('/', (req, res) => res.send('Hello Kitty!'));
router.use(healthRouter);

export default router;