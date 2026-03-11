import express from 'express';
import path from 'path';
import appConfig from '@shared/configs/app.config.js';

const toolRouter = express.Router();
const appCfg = appConfig!;

const templatePath = path.join(process.cwd(), 'src/shared/templates');

toolRouter.get('/google', (req, res) => {
  req.app.set('views', templatePath);

  res.render('test-google-oauth', {
    googleClientId: appCfg.security.oauth.googleClientId,
    layout: false,
  });
});

toolRouter.get('/guide-google', (req, res) => {
  req.app.set('views', path.join(process.cwd(), 'src/shared/templates'));

  res.render('guide-google', {
    layout: false,
  });
});

toolRouter.get('/facebook', (req, res) => {
  req.app.set('views', templatePath);

  res.render('test-facebook-oauth', {
    facebookAppId: appCfg.security.oauth.facebookAppId,
    layout: false,
  });
});

toolRouter.get('/guide-facebook', (req, res) => {
  req.app.set('views', path.join(process.cwd(), 'src/shared/templates'));

  res.render('guide-facebook', {
    layout: false,
  });
});

export default toolRouter;
