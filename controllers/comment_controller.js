var models = require('../models/models.js');

// GET /quizes/:quizId/comments/new
exports.new = function(req, res) {
  res.render('comments/new.ejs', {quizid: req.params.quizId, errors: []});
};

// POST /quizes/:quizId/comments
exports.create = function(req, res) {
  var comment = models.Comment.build(
      { texto: req.body.comment.texto,          
        QuizId: req.params.quizId
        });

  comment
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('comments/new.ejs', {quizid: comment.QuizId, errors: err.errors});
      } else {
        comment // save: guarda en DB campo texto de comment
        .save({fields: ["texto", "QuizId"]})	//Para que sólo guarde los campos especificados
        .then( function(){ res.redirect('/quizes/'+req.params.quizId)}) 
      }      // res.redirect: Redirección HTTP a pregunta en la que nos encontrabamos
    }
  ).catch(function(error){next(error)});
  
};
