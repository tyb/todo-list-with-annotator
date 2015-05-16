
/*
 * GET users listing.
 */

exports.list = function(req, res, next){
  req.db.tasks.find({completed: false}).toArray(function(error, tasks){
    if (error) return next(error);
    res.render('tasks', {
      title: 'Todo List',
      tasks: tasks || []
    });
  });
};

exports.add = function(req, res, next){
  if (!req.body || !req.body.name) {
	  console.log(req.body);
	  return next(new Error('No data provided.'));
  }
  req.db.tasks.save({
    name: req.body.name,
    
    completed: false,
    /*
    	function() {
    	res.method='get';
    	res.status(301);
    	res.redirect('/tasks');
    }
    */
    
    //completed:false 
  }, function(error, task){
    if (error) return next(error);
    if (!task) return next(new Error('Failed to save.'));
    console.info('Added %s with id=%s', task.name, task._id);
    
    var ajax = req.xhr; //false
    //console.info('req' + req); prints []object Object]
    //console.info(ajax);
    //console.info('x');
    
    if(ajax) {
    	console.info('ajax');
        //res.status(301).json({'msg':'redirect','location':'/tasks'});
    	res.contentType('application/json');
    	var data = JSON.stringify('/tasks');
    	res.header('Content-Length', data.length);
    	res.end(data);
    
    }
    else {
        req.method = 'get';
        res.status(301).redirect('/tasks');
        //Or if you prefer plain text
        //res.status(333).send("Redirect");
    }
    //res.writeHead(301, {location: '/tasks'});
    //res.end();
    //console.log(res);
    /*
    res.method='get';
    res.status(301);
    res.redirect('/tasks');
    /*
    res.send({
        retStatus : retStatus,
        redirectTo: '/tasks',
        msg : 'Just go there please' // this should help
      });
      */
  })
};

exports.markAllCompleted = function(req, res, next) {
  if (!req.body.all_done || req.body.all_done !== 'true') return next();
  req.db.tasks.update({
    completed: false
  }, {$set: {
    completed: true
  }}, {multi: true}, function(error, count){
    if (error) return next(error);
    console.info('Marked %s task(s) completed.', count);
    res.redirect('/tasks');
  })
};

exports.completed = function(req, res, next) {
  req.db.tasks.find({completed: true}).toArray(function(error, tasks) {
    res.render('tasks_completed', {
      title: 'Completed',
      tasks: tasks || []
    });
  });
};

exports.markCompleted = function(req, res, next) {
  if (!req.body.completed) return next(new Error('Param is missing'));
  req.db.tasks.updateById(req.task._id, {$set: {completed: req.body.completed === 'true'}}, function(error, count) {
    if (error) return next(error);
    if (count !==1) return next(new Error('Something went wrong.'));
    console.info('Marked task %s with id=%s completed.', req.task.name, req.task._id);
    res.redirect('/tasks');
  })
};

exports.del = function(req, res, next) {
  req.db.tasks.removeById(req.task._id, function(error, count) {
    if (error) return next(error);
    if (count !==1) return next(new Error('Something went wrong.'));
    console.info('Deleted task %s with id=%s completed.', req.task.name, req.task._id);
    res.send(200);
  });
};