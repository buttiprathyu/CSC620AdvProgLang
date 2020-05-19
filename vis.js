(function() {
    let dataForChart;
    let keys = ["rooms", "homes"];

    var url = "http://localhost:3000/dataForChart";
	fetch(url)
		.then(checkStatus)
		.then(function(responseText) {
            data = JSON.parse(responseText);

            var svg = d3.select("#chart"),
                margin = {top: 35, left: 35, bottom: 0, right: 0},
                width = 650 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;
        
            data.forEach(function(d) {
                d.total = d3.sum(keys, k => +d[k]);
                return d;
            });
            var xScale = d3.scaleBand()
                .domain(data.map(function(d){return d.location;}))
                .range([margin.left, width - margin.right])
                .padding(0.1);

            var stack = d3.stack()
                .keys(["rooms", "homes"])
                .order(d3.stackOrderNone)
                .offset(d3.stackOffsetNone);

            var series = stack(data);

            var yScale = d3.scaleLinear()
                .domain([0,d3.max(series, d => d3.max(d, d=> d[1]))])
                .range([height - margin.bottom, margin.top]);

            var color = d3.scaleOrdinal()
                .range(["steelblue", "darkorange"])
                .domain(keys);
            
            var xAxis = svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .attr("class", "x-axis");
        
            var yAxis = svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .attr("class", "y-axis");

            var speed = 0;
            
            svg.selectAll(".y-axis").transition().duration(speed)
                .call(d3.axisLeft(yScale).ticks(null, "s"));
                
            svg.selectAll(".x-axis").transition().duration(speed)
                .call(d3.axisBottom(xScale).tickSizeOuter(0));

            var group = svg.selectAll("g.layer")
                .data(d3.stack().keys(keys)(data), d => d.key);
            
            group.exit().remove()

            group.enter().append("g")
                .classed("layer", true)
                .attr("fill", d => color(d.key));

            var bars = svg.selectAll("g.layer").selectAll("rect")
                .data(d => d, e => e.data.location);
    
            bars.exit().remove();
    
            bars.enter().append("rect")
                .attr("width", xScale.bandwidth())
                .merge(bars)
                .on("click", function(d) {
                    var location = document.getElementById("location");
                    if(location.innerHTML != ''){
                        location.innerHTML ='';
                        location.innerHTML += d.data.location;
                    } else {
                        location.innerHTML += d.data.location;
                    }
                                        
                    getAirbnb(d.data.location);
                    getRestoPlaces(d.data.location);
                })
                .transition().duration(speed)
                .attr("x", d => xScale(d.data.location))
                .attr("y", d => yScale(d[1]))
                .attr("height", d => yScale(d[0]) - yScale(d[1]));
            
            var text = svg.selectAll(".text")
                .data(data, d => d.location);
    
            text.exit().remove();
    
            text.enter().append("text")
                .attr("class", "text")
                .attr("text-anchor", "middle")
                .merge(text)
                .transition().duration(speed)
                .attr("x", d => xScale(d.location) + xScale.bandwidth() / 2)
                .attr("y", d => yScale(d.total) - 5)
                .text(d => d.total);


            var legend = svg.selectAll(".legend")
                .data(color.domain().slice().reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
          
          
            legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .attr("fill", color);
            
            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) { return d; });
           
        })
        .catch(function(error) {
            console.log(error);
        });

    var getRestoPlaces = function(location){
        fetch("http://localhost:3000/placesList")
		.then(checkStatus)
		.then(function(responseText) {
            let placesData = JSON.parse(responseText);
            var places = document.getElementById("places");
            var resto = document.getElementById("resto");
            if(places.innerHTML != ''){
                places.innerHTML = '';
            }
            if(resto.innerHTML != ''){
                resto.innerHTML = '';
            }
            for(var i=0;i<placesData.length;i++){
                if(placesData[i].Location===location){
                    var place = placesData[i].Places;
                    for(var j=0;j<place.length;j++){
                        var node = document.createElement("li");
                        var textnode = document.createTextNode(place[j]);
                        node.appendChild(textnode);
                        document.getElementById("places").appendChild(node);
                    }

                    var resto = placesData[i].Resto;
                    
                    for(var k=0;k<resto.length;k++){
                        var node = document.createElement("li");
                        var textnode = document.createTextNode(resto[k]);
                        node.appendChild(textnode);
                        document.getElementById("resto").appendChild(node);
                    }
                }
            }
		})
		.catch(function(error) {
			console.log(error);
        });
        
    }

    var getAirbnb = function(location){
        fetch("http://localhost:3000/sort")
		.then(checkStatus)
		.then(function(responseText) {
            let airbnbData = JSON.parse(responseText);
            var airbnb = document.getElementById("airbnb");
            if(airbnb.innerHTML != ''){
                airbnb.innerHTML = '';
            }
            for(var i=0;i<airbnbData.length;i++){
                if(airbnbData[i].location===location){
                    var stay = airbnbData[i].top;
                    for(var j=0;j<stay.length;j++){
                        var node = document.createElement("li");
                        var textnode = document.createTextNode(stay[j].name + ' - ' + stay[j].room_type + ' - $' + stay[j].price);
                        node.appendChild(textnode);
                        document.getElementById("airbnb").appendChild(node);
                    }
                }
            }
		})
		.catch(function(error) {
			console.log(error);
        });
    }
        
    function checkStatus(response) {  
        if (response.status >= 200 && response.status < 300) {  
            return response.text();
        } else if (response.status == 404) {
            // sends back a different error when we have a 404 than when we have
            // a different error
            return Promise.reject(new Error("Sorry, we couldn't find that page")); 
        } else {  
            return Promise.reject(new Error(response.status+": "+response.statusText)); 
        } 
    }
})();



