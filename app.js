 
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

/* Taha: todo: express.js araþtýr 
 * Creating server instance
 * */
var app = express();

/*
 * Taha: veritabanýndan "tasks" listesini mi alýyor???
 */
app.use(function(req, res, next) {
  req.db = {};
  req.db.tasks = db.collection('tasks');
  next();
})

// Taha. todo: Uygulamanýn baþlýðýný mý set ediyor. app.locals?
/*
 * TODO: app.locals.appname, layout.jade'de kullanýlýyor ve tüm sayfalar onu extend ediyor.
 * view'daki deðiþkenler sanýrým. app.locals'in altýnda oluyor.
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
 * Taha: todo: Express.js bu view engine'i nasýl görebiliyor?
 */ 
app.set('view engine', 'jade');

/*
 * TODO: app.use nasýl çalýþýyor?
 */
app.use(express.favicon());
app.use(express.logger('dev'));

//Taha.: Ajax post çaðrýlarýnda req.body'nin boþ olmamasý için eklendi.
app.use(express.bodyParser());

/*
app.use(bodyParser.urlencoded({
	  extended: true
	}));
	*/

app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: '59B93087-78BC-4EB9-993A-A61FC844F6C9'}));

//Taha.: Eklediðim Ajax post çaðrýsýnda Forbidden hatasý alýyordu, bu yüzden kaldýrdým bu kýsmý.
//app.use(express.csrf());

/*
 * TODO: LESS-middleware nasýl çalýþýyor?
 */
app.use(require('less-middleware')({ src: __dirname + '/public', compress: true }));

/*
 * TODO: express static dosyalarý nasýl handle ediyor?
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
 * TODO: app.router nasýl çalýþýr?
 */
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*
 * TODO: eðer task_id ile GET isteði yapýlýrsa, bu callback mi çalýþacak?
 * callback sonraki parametre olan taskId'yi nasýl alabiliyor?
 * TaskId'yi 4. parametre olarak verebiliyor. Çünkü bu anonymous function'un güzelliði:
 * taskID'yi ben applicate ediyorum aþaðýda. bir nevi wrapper olmuþ oldu anon. func.
 */
app.param('task_id', function(req, res, next, taskId) {
	
	/*
	 * TODO: en yukarýda en baþta, herhangi bir istek olmadan veritabanýndan tüm tasklarý almýþtý.
	 * Bunlarý bellekte mi tutuyor?
	 * Çünkü. req.db.tasks yukarýda dolmuþtu ve aþaðýda bu listeyi findById ile filtreliyor sanýrýmm.
	 */
  req.db.tasks.findById(taskId, function(error, task){
    if (error) return next(error);
    
    /*
     * TODO: error sýnýfý object'i nerede tanýmlý.
     */
    if (!task) return next(new Error('Task is not found.'));
    req.task = task;
    
    /*
     * TODO: next() nasýl çalþýyor?
     */
    return next();
  });
});

/*
 * TODO: Anasayfaya istek yapýldýðýnda çalýþan route.
 * routes deðiþkeni yukarýda þöyle set edilmiþti:
 * -var routes = require('./routes');
 * aþaðýda routes.index diye eriþince;
 * routes bir folder bunu modül olarak görüyor node diyelim,
 * peki index bir property midir bu nesnenin?
 * routes folder'ýnda index.js var. onu içi þöyle:
 * exports.index = function(req, res){
 * 		res.render('index', { title: 'Express.js Todo App' });
 * };
 * Bu durumda exports modül sistemiyle routes nesnesine mi referans vermiþ oluyor?
 * ve otomatikman index property'si routes'un mu olmuþ oluyor.
 * app.get'deki ikinci parametre olan "routes.index" bu durumda fonksiyonun adý mý oluyor.
 * ve app.get bu verilen fonksiyon ismiyle function application mý yapýyor?
 */
app.get('/', routes.index);

/*
 * GET metodu ile tasks sayfasýna istek geldiðinde:
 * exports.list = function(req, res, next){
  req.db.tasks.find({completed: false}).toArray(function(error, tasks){
    if (error) return next(error);
    res.render('tasks', {
      title: 'Todo List',
      tasks: tasks || []
    });
  });
};
 * TODO: buradaki render metodu, bunun MVC yapýsýnda olduðunu mu gösterir?
 * tasks.js bu durumda controller oluyor ve list metoduyla önce veritabanýna baðlanýyor.
 * (aslýnda yine req.db.tasks ile iþlem yaptýðýndan sanki veritabanýna baðlanmýyor gibi?)
 * sonra aldýðý veriyi iþleyip view'ý render ediyor. 
 * JADE de sanýrým burada çalýþýyor.
 * TODO: pekii, aþaðýda 3 tane tasks route'u var, hangisine gideceðini nasýl biliyor???
 * 
 */
app.get('/tasks', tasks.list);
app.post('/tasks', tasks.markAllCompleted)
app.post('/tasks', tasks.add);

/* 
 * TODO: parametreli POST isteði için route.
 */
app.post('/tasks/:task_id', tasks.markCompleted);
app.del('/tasks/:task_id', tasks.del);
app.get('/tasks/completed', tasks.completed);

app.get('/scrapes',scrapes.index);
app.post('/scrapes',scrapes.imdb);

/*
 * TODO: Bütün HTTP istek türleri(GET, POST vs..) için geçerli bir route mudur?
 * Nasýl çalýþýyor, app.all nedir?
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
