var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(methodOverride('_method'));
app.use(partials());	// Para la utilización de un marco en la aplicación (vista 'layout.ejs')
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('Quiz 2015 josel'));
app.use(session());
app.use(express.static(path.join(__dirname, 'public')));

// MW de auto-logout:
app.use(function(req, res, next) {

	var _tiempoMaxCon = 120000;	// Tiempo de desconexión (en milisegundos) - 2 minutos

	//Primero se controla si hay una sesión activa 
	if (req.session.user){

		var fechaAct = new Date;

		if (req.session.ultSolHTTP) {	// Existe la variable 'req.session.ultSolHTTP'
			var fechaUltSolHTTP = new Date(JSON.parse(req.session.ultSolHTTP)); 
			var difSolHTTPms = fechaAct.getTime()-fechaUltSolHTTP.getTime();	//Diferencia en milisegundos
			console.log ('Fecha última solicitud HTTP: ' + fechaUltSolHTTP);
			console.log ('Diferencia (milisegundos): ' + difSolHTTPms);
			if (difSolHTTPms > _tiempoMaxCon){
				console.log ('Han transcurrido más de ' + (_tiempoMaxCon/1000) + 
					' segundos desde la última solicitud HTTP. Se destruye la sesión.');
				delete req.session.user;
				delete req.session.ultSolHTTP;
				req.session.errors = [{"message": 'La sesión ha caducado. '}];
				res.redirect('/login'); // redirección para login
			}
			else{
				console.log ('No han transcurrido más de ' + (_tiempoMaxCon/1000) + 
					' segundos desde la última solicitud HTTP.');
				req.session.ultSolHTTP = JSON.stringify(fechaAct);
				req.session.errors = [];
				next();	// Se pasa el control al siguiente MW
			}
		}
		else{	// Si no existe la variable, se crea (si previamente se ha creado una sesión)
			req.session.ultSolHTTP = JSON.stringify(fechaAct);
			console.log ('Sesión nueva, fecha: ' + fechaAct);
			next();	// Se pasa el control al siguiente MW
		}
	}
	else{	// Si no hay sesión activa, se pasa al siguiente MW
		next();
	}

});

// Helpers dinamicos:
app.use(function(req, res, next) {

  // guardar path en session.redir para despues de login
  if (!req.path.match(/\/login|\/logout/)) {
    req.session.redir = req.path;
  }

  // Hacer visible req.session en las vistas
  res.locals.session = req.session;
  next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors:[]
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors:[]
    });
});


module.exports = app;
