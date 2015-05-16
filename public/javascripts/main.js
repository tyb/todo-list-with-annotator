$(document).ready(function() {
	
  //var ann = Annotator(document.body);
  //ann.setupPlugins();
  
  jQuery(function ($) {
	    $('#mycontent').annotator();
	});
  
  var $alert = $('.alert');
  this.alert = $alert;
  $alert.hide();
  
  /*
  $('div').on('click','.annotator-adder',function(event, data){
	    $alert.html(data)
	    $alert.addClass('alert-danger');
	    $alert.show();
	  });
	  */
  function ServiceFailed(result) {
	  alert('Service call failed: ' + result.status + '' + result.statusText);
	  Type = null; Url = null; Data = null; ContentType = null; DataType = null; ProcessData = null;
	  }
  
  function printObject(o) {
	  var out = '';
	  for (var p in o) {
	    out += p + ': ' + o[p] + '\n';
	  }
	  alert(out);
	}
  
  
  // Event handler 2 defa çalýþýyordu, engellemek için bu yöntemi kullandým,
  // ama nasýl bir mekanizma oldu ya da 2 defa çalýþmasýnýn sebebi neydi onu detaylý araþtýrmam lazým.
  $( "body" )
  .undelegate('a.annotator-save', "click", saveComment)
  .delegate('a.annotator-save', "click", saveComment);
  
  //$('div').on('click','a.annotator-save',saveComment);
  
  function saveComment(event, data){
	  //alert($('.annotator_field_0').val());
	    $target = $(event.target);
	    
	    
	    
	   // printObject($target);
	    var jsondataResource = JSON.stringify(
	    		{name: $('#annotator-field-0').val(), 
	    		//	name: 'hakan',
	    		//name: $('.annotator_field_0').val(),
	    		allowed: true});
	    var that = this;
	    $.ajax({
	      contentType: 'application/json',
	      //async: false,
	      type: 'POST',
	      url: '/tasks',
	      /*
	      xhrFields: {
	          withCredentials: true
	       },
	      /*
	      xhr: function() {
	    	  xhr = jQuery.ajaxSettings.xhr();
	      },
	      //xhr: true,
	      //data: {
	        //_csrf: $target.attr('data-csrf');
	        
	      //},
	      */
	      data: jsondataResource,
	      dataType: 'json', //Expected data format from server
	      //context:this,
	      processdata: true, //True or False
	      //crossDomain: true, //bunu kaldýrýnca server'da req.xhr'ý görebildi.
	      //success: function (msg, textStatus, xmlHttp) {
	        //  result = msg;
	      //},
	      success: function(data, textStatus, req ) {
	        //$target.parent().parent().remove();
	    	  alert('success');
	          $alert.trigger('success', 'Taha: Comment added as a task!');
	    	  //if(data.msg==="redirect") window.location = data.location;
	    	  window.location = data
	      },
	      
	      /*
	      error: function(xhr,status,error) {
	    	//  alert('error');
	    	//  alert(printObject(this));
	    	//  alert(printObject(that));
	        //that.alert.trigger('error', JSON.parse(xhr.responseText) + JSON.parse(error));
	    	alert(status);
	    	  
	        alert(JSON.parse(xhr.responseText));
	      }
	      */
	      error: function (jqXHR, textStatus, errorThrown) {
	          alert('error ' + textStatus + " " + errorThrown);
	          //alert(jqXHR.responseJSON);
	          //alert(printObject(jqXHR));
	          success = false;
	          //if (jqXHR.responseJSON.msg==="redirect") window.location = data.responseJSON.location;
	          //window.location = jqXHR;
	      }
	      
	      
	      //error: ServiceFailed
	    })
	  }
  
  
  $alert.on('error', function(event, data){
    $alert.html(data)
    $alert.addClass('alert-danger');
    $alert.show();
  });
  $alert.on('success', function(event, data) {
    $alert.html(data);
    $alert.addClass('alert-info');
    $alert.show();
  })
  $('.task-delete').click(function(event) {
    $target = $(event.target)
    $.ajax({
      type: 'DELETE',
      url: '/tasks/' + $target.attr('data-task-id'),
      data: {
        _csrf: $target.attr('data-csrf')
      },
      success: function(response) {
        $target.parent().parent().remove();
        $alert.trigger('success', 'Task was removed.');
      },
      error: function(error) {
        $alert.trigger('error', error);
      }
    })
  });
})