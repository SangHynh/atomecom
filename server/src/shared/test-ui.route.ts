import express from 'express';
import path from 'path';

const router = express.Router();

const templatePath = path.join(process.cwd(), 'src/shared/templates');

router.get('/google', (req, res) => {
  req.app.set('views', templatePath);
  
  res.render('test-google-oauth', { 
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    layout: false 
  });
});

router.get('/guide-google', (req, res) => {
  req.app.set('views', path.join(process.cwd(), 'src/shared/templates'));
  
  res.render('guide-google', { 
    layout: false 
  });
});

router.get('/facebook', (req, res) => {
  req.app.set('views', templatePath);
  
  res.render('test-facebook-oauth', { 
    facebookAppId: process.env.FACEBOOK_APP_ID,
    layout: false 
  });
});

router.get('/guide-facebook', (req, res) => {
  req.app.set('views', path.join(process.cwd(), 'src/shared/templates'));
  
  res.render('guide-facebook', { 
    layout: false 
  });
});

export default router;