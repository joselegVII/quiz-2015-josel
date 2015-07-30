var models = require('../models/models.js');

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
  //Se realiza una búsqueda del elemento quizId
  console.log ('Ejecución de función de "autoload", parámetro: ' + quizId);
  models.Quiz.find(quizId).then(	//Una vez terminada se procesa el resultado
    function(quiz) {
      if (quiz) {									//Se ha encontrado un elemento
        req.quiz = quiz;					//se crea la variable req.quiz con el objeto encontrado
        next();										//Se pasa la ejecución al siguiente MW (show o answer)
      }
      else {											//Si no se encuentra nada: se genera un error
      														//(que procesará el siguiente MW de error)
      	next(new Error('No existe quizId=' + quizId)); 
      }
    }
  ).catch(function(error) { next(error);});
};


// GET /quizes?search
//exports.busqueda = function(req, res) {
//  res.render('quizes/busqueda', {busqueda : req.query.search});
//};

// GET /quizes
exports.index = function(req, res) {
	if(req.query.search) {
//		var search = '%'+(req.query.search || '').replace(/ /g, "%")+'%';
		var search = '%'+(req.query.search || '').trim().replace(/\s/g, "%")+'%';
//		console.log('Búsqueda de preguntas: ' + search);
//		models.Quiz.findAll({where:["pregunta like ?", search],order:'pregunta ASC'})
		models.Quiz.findAll({where:["lower(pregunta) like ?", search.toLowerCase()],order:'pregunta ASC'})
		.then(function(quizes){
			res.render('quizes/search', {quizes: quizes, search : req.query.search.trim()});
			}).catch(function(error) { next(error);});
	} else {
  	models.Quiz.findAll().then(function(quizes) {
  	  res.render('quizes/index.ejs', { quizes: quizes});	
  		}).catch(function(error) {next(error);})
	}
};

// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show', { quiz: req.quiz});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado});
};

