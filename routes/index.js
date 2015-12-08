var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); // mongoDB library
var geocoder = require('geocoder'); // geocoder library
// our db model
var Trail = require("../models/model.js");
var flatChildrenArray = [];
var tags = [];
var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI('909d2935c04ba8e5001c01e3c1c183d64e0de728');


router.get('/add-trail', function(req,res){
  res.render('add-trail.html');
})

router.post('/api/add/bookmarks', function(req,res){
    var bookmarks = JSON.parse(req.body.tree);
    console.log("parsing bookmarks -->");
    // console.log("flatChildrenArray " + depthFirst(bookmarks, 0))
    var jsonData = depthFirst(bookmarks, 0)
    console.log ("flatChildrenArray --> ", flatChildrenArray)
    convertBookmarks(flatChildrenArray, res);
    testFunction();
    return res.json(jsonData);

})

function convertBookmarks(array, res){
    // console.log("convertBookmarks array -->" + array)
    var bookmarksArray = array;

    var counter = 0;
    var maxCounter = bookmarksArray.length-1;

    parseUrl(0);

    function parseUrl(counter){
        console.log('we are in parseUrl and counter is ' + counter);
        var objectForTrail = {body : {}}
        objectForTrail.body.trailTitle = bookmarksArray[counter].title;
        objectForTrail.body.title = bookmarksArray[counter].title;
        objectForTrail.body.text = "place holder";
        objectForTrail.body.url = bookmarksArray[counter].url;
        objectForTrail.body.tags = "place, holder";
        var searchQuery = bookmarksArray[counter].url;
        checkDb(searchQuery, function(err,data){
            if(err) console.log(err)
            if(data) {
                console.log(data);
                console.log('need to create trail for ' + searchQuery);
                getTags(searchQuery, function(err,response){
                    objectForTrail.body.tags = response
                    if (response){
                        console.log("response from alchemy", response)
                        createTrail2(objectForTrail,function(err,response){
                            counter++;
                            if(counter>=maxCounter) return;
                            else parseUrl(counter);
                        });
                    } else console.log('error in alchemy call')
                })
            }
            else if(!data) {
                console.log(data);
                console.log('we already have ' + searchQuery + ' ....moving along....')
                counter++;
                if(counter>=maxCounter) return;
                else parseUrl(counter);                
            }
        })
    }

    function checkDb(search, callback){
        var searchQuery = {'steps.url': search};
        Trail.find(searchQuery, function(err,data){
            console.log('the data in checkDb is ' + data);
            if(err) return callback(err,null);
            else if(!data || data==null) return callback(null,false);
            else if(data.length==0) return callback(null,true);
            else return callback(null,false)
        })   
    }

    return res.json({'status':'OK'});
}

function getTags(url, callback){
    var newURL = url
    var keywordlist = [];
    var aTags;
    var outputMode = '&outputMode=json';
    console.log('get tags from alchemy')
    alchemy.keywords(newURL+'?html=<required>'+outputMode, {}, function(err, response) {
        if (err) callback(err,null)
        var keywords = response.keywords;
        if (keywords == undefined || keywords.length == 0) return callback(null,"place-holder,for,your,bum,link")
        console.log("keywords!",keywords)
        for(var i = 0; i < keywords.length; i++){
            keywordlist.push(keywords[i].text);
        }
        for (var i=0;i<keywordlist.length;i++){
            if(i< keywordlist.length-2){
                aTags = aTags + keywordlist[i]+",";
            } else {aTags = aTags + keywordlist[i];}
        }
        console.log("tags to be searched in db --> ",aTags)
        callback(null,aTags)
          // Do something with data
    });
      
}

function createTrail2(req, callback){

    console.log('Create a Trail');

    console.log("What we're just trying to get data "+JSON.stringify(req.body));
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
          console.log(error);
        }

        console.log('saved a new step!');
        console.log(data);

        // now return the json data of the new step
        var jsonData = {
          status: 'OK',
          trail: data
        }

        return callback(null,data);
    })
};

// /api/check?url=URL
// check to make sure a url and therefore and entry are not in our database
router.get('/api/check',function(req,res){redundancyCheck(req, res)})
// no longer using this on the server side for searches
// call exists for redundancy checking from front end
function redundancyCheck(req, res){
    console.log("redundancyChecker")
    // console.log("req.query ---> " + JSON.stringify(req.query))
    var url = req.query.url
    // var url = req
    // console.log("url to check ---> " + url)

    var searchQuery = {'steps.url': url}

    Trail.find(searchQuery, function(err,data){
        console.log('we are here 2!');
        console.log('the data is ' + data);
        console.log("res = "+res)
        if(err){
          var error = {status:'ERROR', message: 'I fucked up'};
          if (res == undefined || res == null){
            console.log("return error")
             return error
          } else return res.json(error);
        }

        else if(data.length == 0){
            var noData = {status:'OK', message: 'no entry', data: data};
            if (res == undefined || res == null){
                 console.log("return noData: " + JSON.stringify(noData))
                return noData
            } else return res.json(noData);
        }
        // console.log("Whos data is this? --> " + data);
        
        else {
            var hasData = {
            status:'OK', 
            message: 'heres the data entry',
            data: data
        }
        console.log("return hasData"+ JSON.stringify(hasData))
        if (res == undefined || res == null){
            return hasData
        } else return res.json(hasData);
    }
    })
}

router.post('/api/create/trail', function(req,res){ createTrail(req,res) })

function createTrail(req,res){

    console.log('Create a Trail');

    console.log("What we're just trying to get data "+JSON.stringify(req.body));
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
};

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

function depthFirst(tree, depth){
        var newDepth = depth
        var branch = tree;
        console.log("enter the depths at " + depth);
        // console.log("bookmarks --> "+ branch)
        // check if input tree is has a url, 
        // if it does then it is likely a bookmark
        console.log(branch);
        if(branch.url !== undefined) {
            flatChildrenArray.push(branch)
            // console.log("pushed " + JSON.stringify(branch) + "to array")
            // console.log ("branch.url --> " + branch.url)
            return true
        } else {
            // console.log("wasn't worth pushing this shit " + branch);
        }
        // console.log("tree length " + branch.length);
        if (branch.length == undefined) {
            branch = tree.children
            // console.log("children length " + branch.length);
        }
        for (var i = 0; i < branch.length; i++){
            console.log("step " + i)
            if (flatChildArrayCheck(branch[i], flatChildrenArray) == "emptyarray" || branch !== undefined){
                var currentDepth = newDepth + 1;
                // console.log("branch"+[i] +": "+ branch[i]);
                depthFirst(branch[i], currentDepth)
            }
        }
        var jsonData = {
            status: 'OK',
            trail: flatChildrenArray
        }
        return jsonData  
    }
// used exclusively in depth first search, but is essential
function flatChildArrayCheck(treeElement, arrayToCheck){
    // console.log("check that array of flat children for redundancies")
    if (arrayToCheck.length == 0){
        // console.log("emptyarray");
        return "emptyarray"
    }
    for (var i = 0; i < arrayToCheck.length; i++ ){
        if (arrayToCheck[i] == treeElement){
            // console.log("true");
            return true;
        } else {
            // console.log("false");
            return false;
        }   
    }
}
module.exports = router;
