var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); // mongoDB library
var geocoder = require('geocoder'); // geocoder library
// our db model
var Trail = require("../models/model.js");
var flatChildrenArray = [];
/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */
// router.get('/', function(req, res) {
  
//   var jsonData = {
//    'name': 'trailz-of-nyc',
//    'api-status':'OK'
//   }

//   // respond with json data
//   res.json(jsonData)
// });

// simple route to show the pets html

/**
 * POST '/api/create'
 * Receives a POST request of the new user and location, saves to db, responds back
 * @param  {Object} req. An object containing the different attributes of the Person
 * @return {Object} JSON
 */



router.get('/add-trail', function(req,res){
  res.render('add-trail.html');
})

router.post('/api/create/trail', function(req,res){

  console.log('Create a Trail');
  console.log("What we're just trying to get data "+req.body);
  console.log("where my trail title? --> " + req.body.trailTitle)

      // pull out the information from the req.body
      var trailTitle = req.body.trailTitle;
      var title = req.body.title;
      var text = req.body.text;
      var tags = req.body.tags.split(","); // split string into array
      console.log(tags);
      for(var i=0;i<tags.length;i++) tags[i] = tags[i].replace(/^\s+|\s+$/g,'');
      console.log(tags);
      var url = req.body.url;

      // hold all this data in an object
      // this object should be structured the same way as your db model

      var stepObj = {
        title: title,
        text: text,
        tags: tags,
        url: url,
      };
      var trailObj = {
        title: trailTitle,
        steps: [stepObj],
      };

      // now, let's save it to the database
      // create a new step model instance, passing in the object we've created
      var trail = new Trail(trailObj);

      // now, save that step instance to the database
      // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model-save    
      trail.save(function(err,data){
        // if err saving, respond back with error
        if (err){
          var error = {status:'ERROR', message: 'Error saving step'};
          return res.json(error);
        }

        console.log('saved a new step!');
        console.log(data);

        // now return the json data of the new step
        var jsonData = {
          status: 'OK',
          trail: data
        }

        return res.json(jsonData);
    })
});

router.post('/api/add/bookmarks', function(req,res){
    // var bookmarks = req.body.tree;
    console.log("req.body -->"+ JSON.stringify(req))
    // console.log("flatChildrenArray " + depthFirst(bookmarks, 0))    
})

function depthFirst(tree, depth){
        var newDepth = depth
        var branch = tree;
        console.log("enter the depths at " + depth);
        console.log("bookmarks --> "+ branch)
        // check if input tree is has a url, 
        // if it isn't then it is likely a bookmark
        console.log(branch);
        if(branch.url !== undefined) {
            flatChildrenArray.push(branch)
            console.log("pushed " + JSON.stringify(branch) + "to array")
            console.log ("branch.url --> " + branch.url)
            return true
        } else {
            // console.log("wasn't worth pushing this shit " + JSON.stringify(tree))
            console.log("wasn't worth pushing this shit " + branch);
        }
        console.log("tree length " + branch.length);
        if (branch.length == undefined) {
            branch = tree.children
            console.log("children length " + branch.length);
        }
        for (var i = 0; i < branch.length; i++){
            console.log("step " + i)
            if (flatChildArrayCheck(branch[i], flatChildrenArray) == "emptyarray" || branch !== undefined){
                var currentDepth = newDepth + 1;
                // depthFirst(tree[i],currentDepth)
                 console.log("branch[i] " + branch[i]);
                // jQuery.when(depthFirst(tree[Object.keys(tree)[i]], currentDepth)).then(arrayReturn())
                jQuery.when(depthFirst(branch[i], currentDepth)).then(arrayReturn())
                console.log("lets take it to the next level --> " + currentDepth);

            }
        }
            function arrayReturn(){    
                // console.log ("tree[i] ------------------------------> " + JSON.stringify(tree[i]))
                var jsonData = {
                    status: 'OK',
                    trail: flatChildrenArray
                }
                return res.jsonData
            }   
    }

    function flatChildArrayCheck(treeElement, arrayToCheck){
        console.log("check that array of flat children for redundancies")
        if (arrayToCheck.length == 0){
            console.log("emptyarray");
            return "emptyarray"
        }
        for (var i = 0; i < arrayToCheck.length; i++ ){
            if (arrayToCheck[i] == treeElement){
                console.log("true");
                return true;
            } else {
                console.log("false");
                return false;
            }   
        }
    }


router.post('/api/create/step', function(req,res){

  console.log(req.body);

  console.log("the trail to add the step to is " + req.body.trailId);

  var trailId = req.body.trailId;
  var title = req.body.title;
  var text = req.body.text;
  var tags = req.body.tags.split(","); // split string into array
  for(var i=0;i<tags.length;i++) tags[i] = tags[i].replace(/^\s+|\s+$/g,'');
  var url = req.body.url;

  var stepObj = {
    title: title,
    text: text,
    tags: tags,
    url: url,
  };

  Trail.findByIdAndUpdate(trailId, {$push: {"steps": stepObj}}, function(err,data){
        // if err saving, respond back with error
        if (err){
          var error = {status:'ERROR', message: 'Error saving step'};
          return res.json(error);
        }

        console.log('saved a new step!');
        console.log(data);

        // now return the json data of the new step
        var jsonData = {
          status: 'OK',
          trail: data
        }

        return res.json(jsonData);

  })
})

router.get('/api/get/trail', function(req, res){
  console.log("route: /api/get/trail")
  console.log("What we're just trying to get data "+req.body);
  // mongoose method to find all, see http://mongoosejs.com/docs/api.html#model_Model.find
  Trail.find(function(err, data){
    // if err or no animals found, respond with error 
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find milk and cookies'};
      return res.json(error);
    }

    // otherwise, respond with the data 

    var jsonData = {
      status: 'OK',
      trail: data
    } 

    res.json(jsonData);

  })
})

router.post('/api/update/trail/:id', function(req,res){

  console.log(req.body);

  var trailId = req.params.id;

  console.log('the trail we want to update is ' + trailId);
})

router.post('/api/update/trail/:id', function(req, res){

   var requestedId = req.param('id');

   var dataToUpdate = {}; // a blank object of data to update

    // pull out the information from the req.body and add it to the object to update
    var title, text, note, url, location; 

    // we only want to update any field if it actually is contained within the req.body
    // otherwise, leave it alone.
    if(req.body.title) {
      title = req.body.title;
      // add to object that holds updated data
      dataToUpdate['title'] = title;
    }
    if(req.body.text) {
      text = req.body.text;
      // add to object that holds updated data
      dataToUpdate['text'] = text;
    }
    if(req.body.note) {
      note = req.body.note;
      // add to object that holds updated data
      dataToUpdate['note'] = note;
    }
    if(req.body.url) {
      url = req.body.url;
      // add to object that holds updated data
      dataToUpdate['url'] = url;
    }

    var tags = []; // blank array to hold tags
    if(req.body.tags){
      tags = req.body.tags.split(","); // split string into array
      // add to object that holds updated data
      dataToUpdate['tags'] = tags;
    }

    // if(req.body.location) {
    //   location = req.body.location;
    // }

    // if there is no location, return an error
    // if(!location) return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})

    // now, let's geocode the location
      step.findByIdAndUpdate(requestedId, dataToUpdate, function(err,data){
        // if err saving, respond back with error
        if (err){
          var error = {status:'ERROR', message: 'Error updating step'};
          return res.json(error);
        }

        console.log('updated the step!');
        console.log(data);

        // now return the json data of the new person
        var jsonData = {
          status: 'OK',
          step: data
        }

        return res.json(jsonData);

      })
    // geocoder.geocode(location, function (err,data) {


    //   // if we get an error, or don't have any results, respond back with error
    //   if (!data || data==null || err || data.status == 'ZERO_RESULTS'){
    //     var error = {status:'ERROR', message: 'Error finding location'};
    //     return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})
    //   }

    //   // else, let's pull put the lat lon from the results
    //   var lon = data.results[0].geometry.location.lng;
    //   var lat = data.results[0].geometry.location.lat;

    //   // now, let's add this to our step object from above
    //   dataToUpdate['location'] = {
    //     geo: [lon,lat], // need to put the geo co-ordinates in a lng-lat array for saving
    //     name: data.results[0].formatted_address // the location name
    //   }

    //   console.log('the data to update is ' + JSON.stringify(dataToUpdate));

    //   // now, update that step
    //   // mongoose method findByIdAndUpdate, see http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate  
    

    // });     

})

/**
 * GET '/api/delete/:id'
 * Receives a GET request specifying the step to delete
 * @param  {String} req.param('id'). The animalId
 * @return {Object} JSON
 */

router.get('/api/delete/trail/:id', function(req, res){

  var requestedId = req.param('id');

  // Mongoose method to remove, http://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove
  Trail.findByIdAndRemove(requestedId,function(err, data){
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find that step to delete'};
      return res.json(error);
    }

    // otherwise, respond back with success
    var jsonData = {
      status: 'OK',
      message: 'Successfully deleted id ' + requestedId
    }

    res.json(jsonData);

  })

})

// /api/search?tags=tag+1,tag+2,tag+3
router.get('/api/search',function(req,res){
  console.log(req.query.tags);

  var tags = req.query.tags.split(',');

  console.log(tags);

  var searchQuery = {'steps.tags':{ $in: tags}}
  Trail.find(searchQuery, function(err,data){
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find that step to delete'};
      return res.json(error);
    }
    console.log(data);
    res.json(data);
  })
})


module.exports = router;
