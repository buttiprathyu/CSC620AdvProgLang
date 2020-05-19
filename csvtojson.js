(function() {
    const fs = require('fs'); 
    fs.readFile('nyc.csv', (err, data) => { 
        if (err){
            throw err;
        }  
        csvtojson(data.toString()); 
    }) 
})();


function csvtojson(csv){
    const start = new Date;
    var lines = csv.split("\r");
    var result = [];
    
    for(let i = 0; i<lines.length; i++){
        lines[i] = lines[i].replace(/\s/,'')//deletes all blanks
    }
    
    var headers=lines[0].split(',');
        
    for(var i=1;i<lines.length-1;i++){
        var obj = {};
        var currentline=lines[i].split(",");
        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }
    const finish = new Date;
    console.log("Execution Time",(finish-start));
    const fs = require('fs'); 
    fs.writeFile('output.json', JSON.stringify(result), (err) => { 
        // In case of a error throw err. 
        if (err) throw err; 
    }); 
    //return result; //JSON
}