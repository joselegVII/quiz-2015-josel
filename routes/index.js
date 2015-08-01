var express = require('express');
var router = express.Router();

// Se añade referencia hacia el controlador
var quizController = require('../controllers/quiz_controller');

// GET home page
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz' });
});

// Autoload de comandos con :quizId
router.param('quizId', quizController.load);  // autoload :quizId

// GET author
router.get('/author', function(req, res) {
  res.render('author', {});
});

// Definición de rutas de /quizes
router.get('/quizes',                      quizController.index);
router.get('/quizes/:quizId(\\d+)',        quizController.show);
router.get('/quizes/:quizId(\\d+)/answer', quizController.answer);
router.get('/quizes/new',                  quizController.new);
router.post('/quizes/create',              quizController.create);

module.exports = router;
