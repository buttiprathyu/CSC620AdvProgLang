const express = require("express");
const app = express();
const fs = require("fs");
const _ = require("lodash");
app.use(express.static('public'));

app.get('/dataForChart', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
    let json = fs.readFileSync("output.json", 'utf8');
    var cities = ["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"];
    var finalObj = [];
    for(var j=0;j<cities.length;j++){
        finalObj.push(processData(JSON.parse(json), cities[j]));
    }
    res.send(finalObj);
});

app.get('/sort', function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    let json = fs.readFileSync("output.json", 'utf8');
    var cities = ["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"];
    var finalObj = [];
    for(var j=0;j<cities.length;j++){
        finalObj.push({"location":cities[j],"top": sortData(JSON.parse(json), cities[j])});
    }
    res.send(finalObj);
});

app.get('/placesList', function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    let json = fs.readFileSync("data.json", 'utf8');
    res.send(json);
});

function processData(data, city){
    var resultObj = {};
    var houseCount = 0;
    var roomCount = 0;
    for(var i=0;i<data.length;i++){
        if(data[i].neighbourhood_group === city){
            if(data[i].room_type === 'Private room' || data[i].room_type === "Shared room"){
                roomCount++;
            } else {
                houseCount++;
            }
        } 
    }
    resultObj = {"location": city,"rooms":roomCount,"homes":houseCount};
    return resultObj;
}

function sortData(data, city){
    var resultObj = [];
    var cityObj = [];
    for(var i=0;i<data.length;i++){
        if(data[i].neighbourhood_group === city){
            cityObj.push(data[i]);
        } 
    }
    //console.log(_.orderBy(cityObj,['price'],['asc']));
    resultObj = _.slice(cityObj,0,5); 
    return resultObj;
}


app.listen(3000);