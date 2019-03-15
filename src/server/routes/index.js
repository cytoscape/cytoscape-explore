import express from 'express';
import { NODE_ENV } from '../env';

const router = express.Router();

// GET home page
router.get('/', function(req, res) {
  res.render('index.html');
});

// GET debug mode style demo page
if( NODE_ENV !== 'production' ){
  router.get('/style-demo', function(req, res) {
    res.render('style-demo.html');
  });
}

module.exports = router;
