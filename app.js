 
/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var tasks = require('./routes/tasks');
var scrapes = require('./routes/scrapes');
var http = require('http');
var path = require('path');

var mongoskin = require('mongoskin');
var db = mongoskin.db('mongodb://localhost:27017/todo?auto_reconnect', {safe:true});

/* Taha: todo: express.js ara�t�r 
 * Creating server instance
 * */
var app = express();

/*
 * Taha: veritaban�ndan "tasks" listesini mi al�yor???
 */
app.use(function(req, res, next) {
  req.db = {};
  req.db.tasks = db.collection('tasks');
  next();
})

// Taha. todo: Uygulaman�n ba�l���n� m� set ediyor. app.locals?
/*
 * TODO: app.locals.appname, layout.jade'de kullan�l�yor ve t�m sayfalar onu extend ediyor.
 * view'daki de�i�kenler san�r�m. app.locals'in alt�nda oluyor.
 */
app.locals.appname = 'Express.js Todo App - Taha' + 
	'after rus as node app i npm install jade then  it auto sees jade';
// all environments

/*
 * Taha: setting server instance's properties
 */
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');

/*
 * Taha: todo: Express.js bu view engine'i nas�l g�rebiliyor?
 */ 
app.set('view engine', 'jade');

/*
 * TODO: app.use nas�l �al���yor?
 */
app.use(express.favicon());
app.use(express.logger('dev'));

//Taha.: Ajax post �a�r�lar�nda req.body'nin bo� olmamas� i�in eklendi.
app.use(express.bodyParser());

/*
app.use(bodyParser.urlencoded({
	  extended: true
	}));
	*/

app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: '59B93087-78BC-4EB9-993A-A61FC844F6C9'}));

//Taha.: Ekledi�im Ajax post �a�r�s�nda Forbidden hatas� al�yordu, bu y�zden kald�rd�m bu k�sm�.
//app.use(express.csrf());

/*
 * TODO: LESS-middleware nas�l �al���yor?
 */
app.use(require('less-middleware')({ src: __dirname + '/public', compress: true }));

/*
 * TODO: express static dosyalar� nas�l handle ediyor?
 */
app.use(express.static(path.join(__dirname, 'public')));

/*
 * TODO: res.locals nedir?
 */
app.use(function(req, res, next) {
  res.locals._csrf = req.session._csrf;
  return next();
})

/*
 * TODO: app.router nas�l �al���r?
 */
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*
 * TODO: e�er task_id ile GET iste�i yap�l�rsa, bu callback mi �al��acak?
 * callback sonraki parametre olan taskId'yi nas�l alabiliyor?
 * TaskId'yi 4. parametre olarak verebiliyor. ��nk� bu anonymous function'un g�zelli�i:
 * taskID'yi ben applicate ediyorum a�a��da. bir nevi wrapper olmu� oldu anon. func.
 */
app.param('task_id', function(req, res, next, taskId) {
	
	/*
	 * TODO: en yukar�da en ba�ta, herhangi bir istek olmadan veritaban�ndan t�m tasklar� alm��t�.
	 * Bunlar� bellekte mi tutuyor?
	 * ��nk�. req.db.tasks yukar�da dolmu�tu ve a�a��da bu listeyi findById ile filtreliyor san�r�mm.
	 */
  req.db.tasks.findById(taskId, function(error, task){
    if (error) return next(error);
    
    /*
     * TODO: error s�n�f� object'i nerede tan�ml�.
     */
    if (!task) return next(new Error('Task is not found.'));
    req.task = task;
    
    /*
     * TODO: next() nas�l �al��yor?
     */
    return next();
  });
});

/*
 * TODO: Anasayfaya istek yap�ld���nda �al��an route.
 * routes de�i�keni yukar�da ��yle set edilmi�ti:
 * -var routes = require('./routes');
 * a�a��da routes.index diye eri�ince;
 * routes bir folder bunu mod�l olarak g�r�yor node diyelim,
 * peki index bir property midir bu nesnenin?
 * routes folder'�nda index.js var. onu i�i ��yle:
 * exports.index = function(req, res){
 * 		res.render('index', { title: 'Express.js Todo App' });
 * };
 * Bu durumda exports mod�l sistemiyle routes nesnesine mi referans vermi� oluyor?
 * ve otomatikman index property'si routes'un mu olmu� oluyor.
 * app.get'deki ikinci parametre olan "routes.index" bu durumda fonksiyonun ad� m� oluyor.
 * ve app.get bu verilen fonksiyon ismiyle function application m� yap�yor?
 */
app.get('/', routes.index);

/*
 * GET metodu ile tasks sayfas�na istek geldi�inde:
 * exports.list = function(req, res, next){
  req.db.tasks.find({completed: false}).toArray(function(error, tasks){
    if (error) return next(error);
    res.render('tasks', {
      title: 'Todo List',
      tasks: tasks || []
    });
  });
};
 * TODO: buradaki render metodu, bunun MVC yap�s�nda oldu�unu mu g�sterir?
 * tasks.js bu durumda controller oluyor ve list metoduyla �nce veritaban�na ba�lan�yor.
 * (asl�nda yine req.db.tasks ile i�lem yapt���ndan sanki veritaban�na ba�lanm�yor gibi?)
 * sonra ald��� veriyi i�leyip view'� render ediyor. 
 * JADE de san�r�m burada �al���yor.
 * TODO: pekii, a�a��da 3 tane tasks route'u var, hangisine gidece�ini nas�l biliyor???
 * 
 */
app.get('/tasks', tasks.list);
app.post('/tasks', tasks.markAllCompleted)
app.post('/tasks', tasks.add);

/* 
 * TODO: parametreli POST iste�i i�in route.
 */
app.post('/tasks/:task_id', tasks.markCompleted);
app.del('/tasks/:task_id', tasks.del);
app.get('/tasks/completed', tasks.completed);

app.get('/scrapes',scrapes.index);
app.post('/scrapes',scrapes.imdb);

/*
 * TODO: B�t�n HTTP istek t�rleri(GET, POST vs..) i�in ge�erli bir route mudur?
 * Nas�l �al���yor, app.all nedir?
 * "*" ne anlama geliyor?
 */
app.all('*', function(req, res){
  res.send(404);
})

/*
 * TODO: app.get overloaded galiba?
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
