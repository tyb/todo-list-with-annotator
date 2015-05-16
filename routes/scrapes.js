/**
 * scrotch.io node-web-scraper github'dan alýntýlanmýþtýr.
 * Taha Yavuz Bodur
 * 12.05.2015
 * Empire Strikes Back!
 */

/*
 * INPUT: movie url from imdb
 */
exports.index = function(req, res, next){
    res.render('scrapes', {
      title: 'Scrapers',//,
      movie: {}
      //tasks: tasks || []
    });
};

var cheerio = require('cheerio');
var request = require('request');
exports.imdb = function(req, res, next){
   //if (!req.body.url || req.body.url !== 'true') return next();
   if (!req.body || !req.body.url) {
		  console.log(req.body);
		  return next(new Error('No data provided.'));
   }
   var url = req.body.url; 
   request(url, function(error, response, html) {
	   
	   var json = {title: "", release:"",rating:""};
	   if(!error) {
		   var $ = cheerio.load(html);
		   
		   var title, release, rating;
		   
		   
		   $('.header').filter(function() {
			   
			   //buradaki this ne anlama geliyor?
			   // 1. closure baðlamýnda da deðerlendir bu soruyu. Yani this ile hangi nesne belirtiliyor?
			   // 2. neden doðrudan data = this denmiyor?
			   var data = $(this);
			   
			   title = data.children().first().text();
			   release = data.children().last().children().text();
			   
			   json.title = title;
			   json.release = release;
		   })
		   $('.star-box-giga-star').filter(function() {
			   var data = $(this);
			   rating = data.text();
			   json.rating = rating;
		   })
	   }
	   /*
   	res.contentType('application/json');
	var data = JSON.stringify(json);
	res.header('Content-Length', data.length);
	res.end(data);
	*/
	//var data = JSON.stringify(json);
    res.render('scrapes', {
    	  title: 'Movie Info',
	      movie: json
	});
   })
};
