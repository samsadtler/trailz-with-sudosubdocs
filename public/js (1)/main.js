// CUSTOM JS FILE //
var map; // global map variable
var markers = []; // array to hold map markers

function init() {
  
  // set some default map details, initial center point, zoom and style
  var mapOptions = {
    center: new google.maps.LatLng(40.74649,-74.0094), // NYC
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  
  // create the map and reference the div#map-canvas container
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  
  // get the steps (ajax) 
  // and render them on the map
  renderPlaces();
}

// add form button event
// when the form is submitted (with a new animal), the below runs
jQuery("#addForm").submit(function(e){

	// first, let's pull out all the values
	// the name form field value
	var title = jQuery("#title").val();
	var text = jQuery("#text").val();
	var note = jQuery("#note").val();
	var tags = jQuery("#tags").val();
	var url = jQuery("#url").val();
	var location = jQuery("#location").val();

	// make sure we have a location
	if(!location || location=="") return alert('We need a location!');
      
	// POST the data from above to our API create route
  jQuery.ajax({
  	url : '/api/create',
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
	  		renderPlaces();
	  		// now, clear the input fields
	  		jQuery("#addForm input").val('');
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

// get Animals JSON from /api/get
// loop through and populate the map with markers
var renderPlaces = function() {
	var infowindow =  new google.maps.InfoWindow({
	    content: ''
	});

	jQuery.ajax({
		url : '/api/get',
		dataType : 'json',
		success : function(response) {

			console.log("ajax response"+response);
			steps = response.step;
			// first clear any existing markers, because we will re-add below
			clearMarkers();
			markers = [];
			console.log("ajax response.steps"+response.step);
			// now, loop through the steps and add them as markers to the map
			for(var i = 0 ; i < steps.length; i++){

				var latLng = {
					lat: steps[i].location.geo[1], 
					lng: steps[i].location.geo[0]
				}

				// make and place map maker.
				var marker = new google.maps.Marker({
				    map: map,
				    position: latLng,
				    title : steps[i].title + "<br>" + steps[i].text + "<br>" + steps[i].location.name
				});

				bindInfoWindow(marker, map, infowindow, '<b>'+steps[i].title + "</b> ("+steps[i].text+") <br>" + steps[i].location.name);
				
				// keep track of markers
				markers.push(marker);
			}
			console.log("render away!");
			// now, render the animal image/data
			renderSteps(steps);

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
	  		renderPlaces();
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
var bindInfoWindow = function(marker, map, infowindow, html) {
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(html);
        infowindow.open(map, marker);
    });
}

function renderSteps(steps){

	// first, make sure the #animal-holder is empty
	jQuery('#step-holder').empty();

	// loop through all the steps and add them in the animal-holder div
	for(var i=0;i<steps.length;i++){
		var htmlToAdd = '<div class="col-md-4 step">'+
			'<img class="url" src="'+steps[i].url+'">'+
			'<h1 class="title">'+steps[i].title+'</h1>'+
			'<ul>'+
				'<li>Location: <span class="location">'+steps[i].location.name+'</span></li>'+
				'<li>Saved Text: <span class="text">'+steps[i].text+'</span></li>'+
				'<li>Note: <span class="note">'+steps[i].note+'</span></li>'+
				'<li>Tags: <span class="tags">'+steps[i].tags+'</span></li>'+
				'<li class="hide id">'+steps[i]._id+'</li>'+
			'</ul>'+
			'<button type="button" id="'+steps[i]._id+'" onclick="deleteStep(event)">Delete Step</button>'+
			'<button type="button" data-toggle="modal" data-target="#editModal"">Edit Step</button>'+
		'</div>';

		jQuery('#step-holder').prepend(htmlToAdd);

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


function deleteStep(event){
	var targetedId = event.target.id;
	console.log('the step to delete is ' + targetedId);

	// now, let's call the delete route with AJAX
	jQuery.ajax({
		url : '/api/delete/'+targetedId,
		dataType : 'json',
		success : function(response) {
			// now, let's re-render the steps

			renderPlaces();

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