var https = require('https');
var http = require('http');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./localdb.db');
app.use(express.json());
// error messages or other constants
var err500 = "Internal Server Error: Please try again later";
var HashMap = require('hashmap');
var moment = require('moment');
var dbcreationtime;
var server = http.createServer(app).listen(8090, function() {
    //create db in memory
    db.serialize(function() {
        // integer, float and boolean can be handled by REAL
        db.run("CREATE TABLE if not exists localdb (_id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INT NOT NULL,value1 REAL,value2 REAL,value3 REAL,creationDate INT NOT NULL,lastModificationDate INT NOT NULL)");
        var stmt = db.prepare("INSERT INTO localdb VALUES (?,?,?,?,?,?,?)");
        dbcreationtime = moment().valueOf();
        console.log("Server listening on port 8090");
    });    
	
});
// list all records, potentially could add limit to prevent pulling too large of a response
app.get('/api/list', function(req, res, next){
    //should use db.get to only get first one. there should be no duplicates, so no point to get more
    var getstmt = db.prepare("SELECT * FROM localdb LIMIT ?");
    var limit = 2000;
    getstmt.all([limit],function(err,row){
        var error = {};
        if(err){
            error["error"] = err500;
            res.status(500).json(error);
        }else{
            if(row){
                res.json(row);
            } else{
                error["error"] = "Table is empty or nonexistent";
                res.status(404).json(error);
            }
        }
    });
    
});
//Accepts an id and new values for the db fields
app.put('/api/modify/:recordId', function(request, response){
    var responsejson = {};
    if(request.body && request.params.recordId){
        var toadd = new HashMap();
        if(request.body["timestamp"]) toadd.set("timestmap",request.body["timestamp"]);
        if(request.body["value1"]) toadd.set("value1",request.body["value1"]);
        if(request.body["value2"]) toadd.set("value2",request.body["value2"]);
        if(request.body["value3"]) toadd.set("value3",request.body["value3"]);
        var toupdate = "";
        toadd.forEach(function(value, key) {
            if(toupdate.length==0){
                toupdate = toupdate+ key+" = "+value; 
            } else{
                toupdate = toupdate + ", "+key+" = "+value;
                
            }
        });
        //console.log(toupdate);
        var sql = "UPDATE localdb SET "+toupdate+" WHERE _id = ?";
        var updatestmt = db.prepare(sql);
        updatestmt.run([request.params.recordId], function(err){
            if(err){
                responsejson["error"]="update statement encountered error";
                response.status(404).json(responsejson);
            }else{
                responsejson["status"]="updated localdb successfully";
                response.json(responsejson);
            }
        });
    } else{
        //invalid request status
        responsejson["error"]="invalid request";
        response.status(400).json(responsejson);
    }
});
//Delete: Accepts an id and deletes row with that id, or returns an error if it is not found
app.delete('/api/remove/:recordId', function(request, response){
    var responsejson = {};
    db.serialize(function() {
        if(request.params.recordId==="all"){
            db.run("DELETE FROM localdb", function(err){
               if(err){
                    responsejson["error"] = err500;
                    response.status(500).json(responsejson);
                }else{
                    responsejson["status"] = "Deleted all rows";
                    response.status(200).json(responsejson);
                }
           });
        }else{
            var deletestmt = db.run("DELETE FROM localdb WHERE _id=?",[request.params.recordId], function(err){
                if(err){
                    responsejson["error"] = err500;
                    response.status(500).json(responsejson);
                }else{
                    if(this.changes>0){
                        responsejson["status"] = "Successful deletion";
                        response.status(200).json(responsejson);
                    } else{
                        responsejson["status"] = "Unable to delete nonexistent row";
                        response.status(200).json(responsejson);
                    }
                }

            });
            }
        
    });        
});
// Create a records using specified fields: timestamp, value1, value2, value3
app.post('/api/create', function(request, response){
    var responsejson= {};
    if(request.body){
        var createstmt = db.prepare("INSERT INTO localdb VALUES (NULL,?,?,?,?,?,?)");
        // first param is null and id increments automatically
        var value1 = request.body["value1"] ? request.body["value1"] : 0;
        var value2 = request.body["value2"] ? request.body["value2"] : 0;
        var value3 = request.body["value3"] ? request.body["value3"] : 0;
        var timestamp = request.body["timestamp"] ? request.body["timestamp"] : moment().valueOf();
        var creationdate = moment().valueOf();
        //last modified field is just now
        createstmt.run([timestamp,value1,value2,value3,creationdate,creationdate], function(err){
            if(err){
                //console.log(err);
                responsejson["error"] = err500;
                response.status(500).json(responsejson);
            }else{
                responsejson["status"] = "Successful creation";
                responsejson["id"] = this.lastID;
                response.status(200).json(responsejson);
            }
        });
    }else{
        responsejson["error"]="invalid request";
        response.status(400).json(responsejson);
    }
});
app.get('/api/read/:recordId', function(req, res, next){
    //should use db.get to only get first one. there should be no duplicates, so no point to get more
    var getstmt = db.get("SELECT * FROM localdb WHERE _id=?",[req.params.recordId], function(err, row){
        var error = {};
        if(err){
            error["error"] = err500;
            res.status(500).json(error);
        }else{
            if(row){
                res.json(row);
            } else{
                error["error"] = "Could not find localdb row with id "+req.params.recordId;
                res.status(404).json(error);
            }
        }
    });
    
});
app.get('/api/status', function(req, res){
    var responsejson = {};
    var countstmt = db.get("SELECT COUNT(DISTINCT _id) FROM localdb", function(err,row){
        if(err){
            responsejson["error"] = err500;
            res.status(500).json(error);
        }else{
            if(row){
                responsejson["# unique ids"] = row["COUNT(DISTINCT _id)"];
                responsejson["creationtime"] = dbcreationtime;
                res.json(responsejson);
            } else{
                responsejson["error"] = "Status endpoint error occured";
                res.status(404).json(error);
            }
        }
    });
});
//gets unique number of columns per value
app.get('/api/unique/:columnName', function(req,res){
    var value = req.params.columnName;
    // attempted using prepared statement but the query only counted total columns
    var getunique = db.prepare("SELECT "+value+" AS value, COUNT("+value+") AS countOf FROM localdb GROUP BY "+value);
     getunique.all(function(err,row){
         if(err){
            responsejson["error"] = err500;
            res.status(500).json(error);
        }else{
            if(row){
                res.json(row);
            } else{
                responsejson["error"] = "Error retrieving unique columns by "+req.params.columnName;
                res.status(404).json(error);
            }
        }
     });
});
app.on('close', function () {
  console.log("Closed");
  db.close();
});