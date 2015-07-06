var express = require('express');
var router = express.Router();

// Se añade referencia hacia el controlador
var quizController = require('../controllers/quiz_controller');

// GET home page
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz' });
});

// GET question & GET answer
router.get('/quizes/question', quizController.question);
router.get('/quizes/answer',   quizController.answer);

module.exports = router;
