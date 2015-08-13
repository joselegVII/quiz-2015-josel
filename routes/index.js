var express = require('express');
var router = express.Router();

// Se añaden referencias hacia los controladores
var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');

// GET home page
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz', errors: (req.session.errors || [])});
});

// Autoload de comandos con :quizId
router.param('quizId', quizController.load);  // autoload :quizId
router.param('commentId', commentController.load);	// autoload :commentId

// Definición de rutas de sesion
router.get('/login',  sessionController.new);			// formulario login
router.post('/login', sessionController.create);	// crear sesión
router.delete('/logout', sessionController.destroy);	// destruir sesión (en el curso se hace con GET)

// GET author
router.get('/author', function(req, res) {
  res.render('author', {errors: (req.session.errors || [])});
});

// Definición de rutas de /quizes
router.get('/quizes',                      quizController.index);
router.get('/quizes/:quizId(\\d+)',        quizController.show);
router.get('/quizes/:quizId(\\d+)/answer', quizController.answer);
router.get('/quizes/new',                  sessionController.loginRequired, quizController.new);
router.post('/quizes/create',              sessionController.loginRequired, quizController.create);
router.get('/quizes/:quizId(\\d+)/edit',   sessionController.loginRequired, quizController.edit);
router.put('/quizes/:quizId(\\d+)',        sessionController.loginRequired, quizController.update);
router.delete('/quizes/:quizId(\\d+)',     sessionController.loginRequired, quizController.destroy);

// Definición de rutas de /comments
router.get('/quizes/:quizId(\\d+)/comments/new',            commentController.new);
router.post('/quizes/:quizId(\\d+)/comments',              commentController.create);
router.put('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish', sessionController.loginRequired, commentController.publish);	//En la doc curso utilizan GET)

module.exports = router;
