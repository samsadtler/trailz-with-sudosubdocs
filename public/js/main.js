// CUSTOM JS FILE //
var map; // global map variable
var markers = []; // array to hold map markers
var currentTrail;

function init() {
  renderTrailMap();
}

// add form button event
// when the form is submitted (with a new animal), the below runs
jQuery("#addTrail").submit(function(e){
	console.log('submitting once');
	// first, let's pull out all the values
	// the name form field value
	var trailTitle = jQuery("#trailTitle").val();
	var title = jQuery("#title").val();
	var tags = jQuery("#tags").val();
	var text = jQuery("#text").val();
	var url = jQuery("#url").val();


	// make sure we have a location
	// if(!location || location=="") return alert('We need a location!');
      
  	var data = {
  		trailTitle: trailTitle,
  		title: title,
		text: text,
		url: url,
		tags: tags
  	};

  	console.log("Object to be created in the DB = " + JSON.stringify(data));



	  // e.preventDefault();
  	// return;
	// POST the data from above to our API create route
	  jQuery.ajax({

	  	url : '/api/create/trail',
	  	dataType : 'json',
	  	type : 'POST',
	  	// we send the data in a data object (with key/value pairs)
	  	data : data,
	  	success : function(response){
	  		if(response.status=="OK"){
		  		// success
		  		console.log('create a trail please, but seriously you promised = '+response);
		  		// re-render the map
		  		renderTrailMap();
		  		// now, clear the input fields
		  		jQuery("#addTrail input").val('');
	  		}
	  		else {
	  			alert("something went wrong");
	  		}
	  	},
	  	error : function(err){
	  		// do error checking
	  		alert("something went wrong");
	  		console.error(err);
	  	}
	  }); 

	  // prevents the form from submitting normally
	  e.preventDefault();
	  return false;
});


// add form button event
// when the form is submitted (with a new animal), the below runs
jQuery("#addStep").submit(function(e){
	console.log('addStep submitting once');
	// first, let's pull out all the values
	// the name form field value
	var title = jQuery("#step-title").val();
	var tags = jQuery("#step-tags").val();
	var text = jQuery("#step-text").val();
	var url = jQuery("#step-url").val();

  	var data = {
  		title: title,
		text: text,
		tags: tags,
		url: url,
		trailId: currentTrail
  	};

  	console.log("Object to be created in the DB = " + JSON.stringify(data));

	// POST the data from above to our API create route
	  jQuery.ajax({

	  	url : '/api/create/step',
	  	dataType : 'json',
	  	type : 'POST',
	  	// we send the data in a data object (with key/value pairs)
	  	data : data,
	  	success : function(response){
	  		if(response.status=="OK"){
		  		// // success
		  		// console.log('create a trail please, but seriously you promised = '+response);
		  		// // re-render the map
		  		// renderTrailMap();
		  		// now, clear the input fields
		  		jQuery("#addStep input").val('');
		  		jQuery("#addStep").hide();
		  		jQuery("#step-submit").hide();
		  		renderTrailMap();
	  		}
	  		else {
	  			alert("something went wrong");
	  		}
	  	},
	  	error : function(err){
	  		// do error checking
	  		alert("something went wrong");
	  		console.error(err);
	  	}
	  }); 

	  // prevents the form from submitting normally
	  e.preventDefault();
	  return false;
});


// jQuery("#addForm").submit(function(e){

// 	// first, let's pull out all the values
// 	// the name form field value


	
// 	var title = jQuery("#title").val();
// 	var text = jQuery("#text").val();
// 	var note = jQuery("#note").val();
// 	var tags = jQuery("#tags").val();
// 	var url = jQuery("#url").val();
// 	var location = jQuery("#location").val();

// 	// make sure we have a location
// 	if(!location || location=="") return alert('We need a location!');
      
// 	// POST the data from above to our API create route
//   jQuery.ajax({
// 		url : '/api/create/',
// 		dataType : 'json',
// 		type : 'POST',
// 		// we send the data in a data object (with key/value pairs)
// 		data : {
// 			// title: title,
// 			text: text,
// 			note: note,
// 			tags: tags,
// 			url: url,
// 			location: location
// 		},
// 		success : function(response){
// 			if(response.status=="OK"){
// 	  		// success
// 	  		console.log(response);
// 	  		// re-render the map
// 	  		renderTrailMap();
// 	  		// now, clear the input fields
// 	  		jQuery("#addForm input").val('');
// 			}
// 			else {
// 				alert("something went wrong");
// 			}
// 		},
// 		error : function(err){
// 			// do error checking
// 			alert("something went wrong");
// 				console.error(err);
// 			}
// 		}); 

// 		// prevents the form from submitting normally
// 		e.preventDefault();
// 		return false;
// 	});
	
	
function renderTrailMap() {
	console.log("render that shit");
	jQuery.ajax({
		url : '/api/get/trail',
		dataType : 'json',
		success : function(response) {
			console.log(response);
			console.log("ajax response but I want a response object :-( = " + response);
			console.log("is response empty? " + jQuery.isEmptyObject({response}));	
			var trail = response.trail;
			console.log("ajax response.trail = "+ response.trail);
			console.log("render away!");
			// now, render the animal image/data
			renderTrail(trail);
			// renderSteps(trail);

		},
		error : function(err){
  		// do error checking
  		console.log("something went wrong");
  		console.error(err);
  		}
	})
};

// edit form button event
// when the form is submitted (with a new animal edit), the below runs
jQuery("#editForm").submit(function(e){

	// first, let's pull out all the values
	// the name form field value
	var title = jQuery("#edit-title").val();
	var text = jQuery("#edit-text").val();
	var note = jQuery("#edit-note").val();
	var tags = jQuery("#edit-tags").val();
	var url = jQuery("#edit-url").val();
	var location = jQuery("#edit-location").val();
	var id = jQuery("#edit-id").val();

	// make sure we have a location
	if(!location || location=="") return alert('We need a location!');
     
  console.log(id);
      
	// POST the data from above to our API create route
  jQuery.ajax({
  	url : '/api/update/'+id,
  	dataType : 'json',
  	type : 'POST',
  	// we send the data in a data object (with key/value pairs)
  	data : {
  		title: title,
		text: text,
		note: note,
		tags: tags,
		url: url,
		location: location
  	},
  	success : function(response){
  		if(response.status=="OK"){
	  		// success
	  		console.log(response);
	  		// re-render the map
	  		renderTrailMap();
	  		// now, close the modal
	  		$('#editModal').modal('hide')
	  		// now, clear the input fields
	  		jQuery("#editForm input").val('');
  		}
  		else {
  			alert("something went wrong");
  		}
  	},
  	error : function(err){
  		// do error checking
  		alert("something went wrong");
  		console.error(err);
  	}
  }); 

	// prevents the form from submitting normally
  e.preventDefault();
  return false;
});

// binds a map marker and infoWindow together on click
// var bindInfoWindow = function(marker, map, infowindow, html) {
//     google.maps.event.addListener(marker, 'click', function() {
//         infowindow.setContent(html);
//         infowindow.open(map, marker);
//     });
// }

function renderSteps(steps){

	// first, make sure the #animal-holder is empty
	jQuery('#step-holder').empty();

	// loop through all the steps and add them in the animal-holder div
	for(var i=0;i<steps.length;i++){
		var htmlToAdd = '<div class="col-md-4 step">'+
			'<h1 class="title">'+steps[i].title+'</h1>'+
			'<ul>'+
				// '<li>Location: <span class="location">'+steps[i].location.name+'</span></li>'+
				'<li>Saved Text: <span class="text">'+steps[i].text+'</span></li>'+
				'<li>URL: <span class="note">'+steps[i].url+'</span></li>'+
				'<li>Tags: <span class="tags">'+steps[i].tags+'</span></li>'+
				'<li class="hide id">'+steps[i]._id+'</li>'+
			'</ul>'+
			'<button type="button" id="'+steps[i]._id+'" onclick="deleteStep(event)">Delete Step</button>'+
			'<button type="button" data-toggle="modal" data-target="#editModal"">Edit Step</button>'+
		'</div>';

		jQuery('#step-holder').prepend(htmlToAdd);

	}
}
function renderTrail(trails){

	// first, make sure the #animal-holder is empty
	jQuery('#trail-holder').empty();

	// loop through all the steps and add them in the animal-holder div
	for(var i=0;i<trails.length;i++){

		var stepsInTrail = '';
		for(var j=0;j<trails[i].steps.length;j++){
			stepsInTrail += 
			'<ul>'+
				'<li>Step Title: <span class="text">'+trails[i].steps[j].title+'</span></li>'+
				'<li>Saved Text: <span class="text">'+trails[i].steps[j].text+'</span></li>'+
				'<li>URL: <span class="url">'+trails[i].steps[j].url+'</span></li>'+
				'<li>Tags: <span class="tags">'+trails[i].steps[j].tags+'</span></li>'+
				'<li class="hide id">'+trails[i].steps[j]._id+'</li>'+
			'</ul>';
		}

		var htmlToAdd = '<div class="col-md-4 trail">'+
			'<h1 class="title">'+trails[i].title+'</h1>'+
			stepsInTrail +
			'<button type="button" id="'+trails[i]._id+'" onclick="addStep(event)">Add Step</button>'+
			'<button type="button" id="'+trails[i]._id+'" onclick="deleteStep(event)">Delete Trail</button>'+
			'<button type="button" data-toggle="modal" data-target="#editModal"">Edit Step</button>'+
		'</div>';

		jQuery('#trail-holder').prepend(htmlToAdd);

	}
}
jQuery('#editModal').on('show.bs.modal', function (e) {
  // let's get access to what we just clicked on
  var clickedButton = e.relatedTarget;
  // now let's get its parent
	var parent = jQuery(clickedButton).parent();

  // now, let's get the values of the pet that we're wanting to edit
  // we do this by targeting specific spans within the parent and pulling out the text
  var title = $(parent).find('.title').text();
  var text = $(parent).find('.text').text();
  var note = $(parent).find('.note').text();
  var tags = $(parent).find('.tags').text();
  var url = $(parent).find('.url').attr('src');
  var location = $(parent).find('.location').text();
  var id = $(parent).find('.id').text();

  // now let's set the value of the edit fields to those values
 	jQuery("#edit-title").val(title);
	jQuery("#edit-text").val(text);
	jQuery("#edit-note").val(note);
	jQuery("#edit-tags").val(tags);
	jQuery("#edit-url").val(url);
	jQuery("#edit-location").val(location);
	jQuery("#edit-id").val(id);

})

function addStep(event){
	console.log('the trail id to add a step to is ' + event.target.id);
	currentTrail = event.target.id;
	jQuery('#addStep').show();
	jQuery('#step-submit').show();
}


function deleteStep(event){
	var targetedId = event.target.id;
	console.log('the trail to delete is ' + targetedId);

	// now, let's call the delete route with AJAX
	jQuery.ajax({
		url : '/api/delete/trail/'+targetedId,
		dataType : 'json',
		success : function(response) {
			// now, let's re-render the steps

			renderTrailMap();

		}
	})

	event.preventDefault();
}

function clearMarkers(){
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null); // clears the markers
  }	
}

// when page is ready, initialize the map!
google.maps.event.addDomListener(window, 'load', init);