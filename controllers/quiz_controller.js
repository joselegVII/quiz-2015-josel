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

// GET /quizes
exports.index = function(req, res) {
	if(req.query.search) {
		var search = '%'+(req.query.search || '').trim().replace(/\s/g, "%")+'%';
		models.Quiz.findAll({where:["lower(pregunta) like ?", search.toLowerCase()],order:'tema, pregunta ASC'})
		.then(function(quizes){
			res.render('quizes/search', {quizes: quizes, search : req.query.search.trim(), errors:[]});
			}).catch(function(error) { next(error);});
	} else {
  	models.Quiz.findAll({order:'tema ASC'}).then(function(quizes) {
  	  res.render('quizes/index.ejs', { quizes: quizes, errors:[]});
  		}).catch(function(error) {next(error);})
	}
};

// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show', { quiz: req.quiz, errors:[]});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors:[]});
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build(
    {pregunta: "Pregunta", respuesta: "Respuesta", tema: "Humanidades"}
  );

  res.render('quizes/new', {quiz: quiz, indiceTematico: models.indiceTematico().temas(), errors:[]});
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

  quiz
  .validate()	//Función de sequelize que comprueba la validez de los datos
  .then(
    function(err){
      if (err) {	//Si hay error se muestra el mensaje en la misma vista de creación
        res.render('quizes/new', {quiz: quiz, indiceTematico: models.indiceTematico().temas(), errors: err.errors});
      } else {	//Si no hay error...
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta", "tema"]})
        .then( function(){ res.redirect('/quizes')}) 
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  );
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, indiceTematico: models.indiceTematico().temas(), errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta		= req.body.quiz.pregunta;
  req.quiz.respuesta	= req.body.quiz.respuesta;
  req.quiz.tema				= req.body.quiz.tema;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, indiceTematico: models.indiceTematico().temas(), errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta", "tema"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  );
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};

