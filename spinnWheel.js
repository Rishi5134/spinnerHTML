var padding = {top:20, right:40, bottom:0, left:0},
            w = 500 - padding.left - padding.right, //420
            h = 500 - padding.top  - padding.bottom, //480
            r = Math.min(w, h)/2, //210
            rotation = 0,
            oldrotation = 0,
            picked = 100000,
            oldpick = [],
            color = d3.scale.category20();
        var data = [
                    {"label":"20%",  "value":20,  "question":"20% OFF"}, 
                    {"label":"10%",  "value":10,  "question":"10% OFF"}, 
                    {"label":"5%",  "value":5,  "question":"5% OFF"}, 
                    {"label":"30%",  "value":30,  "question":"30% OFF"}, 
                    {"label":"50%",  "value":50,  "question":"50% OFF"}, 
                    {"label":"1%",  "value":1,  "question":"1% OFF"}, 
                    {"label":"0%",  "value":0,  "question":"0% OFF"}, 
                    {"label":"10%",  "value":10,  "question":"10% OFF"}, 
       ];
        var svg = d3.select('#chart')
            .append("svg")
            .data([data])
            .attr("width",  w + padding.left + padding.right)
            .attr("height", h + padding.top + padding.bottom)
        var container = svg.append("g")
            .attr("class", "submitSpin")
            .attr("transform", "translate(" + (w/2 + padding.left) + "," + (h/2 + padding.top) + ")")
        var vis = container
            .append("g");
            
        var pie = d3.layout.pie().sort(null).value(function(d){return 1;});
        // declare an arc generator function
        var arc = d3.svg.arc().outerRadius(r);
        // select paths, use arc generator to draw
        var arcs = vis.selectAll("g.slice")
            .data(pie)
            .enter()
            .append("g")
            .attr("class", "slice")
            
        arcs.append("path")
            .attr("fill", function(d, i){ return color(i); })
            .attr("d", function (d) { return arc(d); })
        // add the text
        arcs.append("text").attr("transform", function(d){
                d.innerRadius = 0;
                d.outerRadius = r;
                d.angle = (d.startAngle + d.endAngle)/2;
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")translate(" + (d.outerRadius -20) +")";
            })
            .attr("text-anchor", "end")
            .attr('class','spinText')
            .text( function(d, i) {
                return data[i].label;
            });
        container.on("click", spin);
    
        function spin(d){

            try {
                
            if (document.getElementById('spinner-email').value == '') {
                return alert("Enter Email to spin");
            }
            d.preventDefault();  
            container.on("click", null);
            //all slices have been seen, all done
            console.log("OldPick: " + oldpick.length, "Data length: " + data.length);
            if(oldpick.length == data.length){
                console.log("done");
                container.on("click", null);
                return;
            }
            if(oldpick.length > 0){
                console.log("done");
                container.on("click", null);
                alert('Spin completed!!')
                return;
            }
            var  ps       = 360/data.length,
                 pieslice = Math.round(1440/data.length),
                 rng      = Math.floor((Math.random() * 1440) + 360);
                
            rotation = (Math.round(rng / ps) * ps);
            
            picked = Math.round(data.length - (rotation % 360)/ps);
            picked = picked >= data.length ? (picked % data.length) : picked;
            if(oldpick.indexOf(picked) !== -1){
                d3.select(this).call(spin);
                return;
            } else {
                oldpick.push(picked);
            }
            rotation += 90 - Math.round(ps/2);
            vis.transition()
                .duration(3000)
                .attrTween("transform", rotTween)
                .each("end", function(){
                    //mark question as seen
                    d3.select(".slice:nth-child(" + (picked + 1) + ") path")
                        .attr("fill", "transparent");
                    //populate question
                    d3.select("#question h1")
                        .text(data[picked].question);
                    d3.select("#spinnerCode")
                        .attr('value',data[picked].question);
                    oldrotation = rotation;
              
                    /* Get the result value from object "data" */
                    console.log(data[picked].value)
              
                    /* Comment the below line for restrict spin to sngle time */
                    container.on("click", spin);
                });
            } catch (error) {
                console.log(error);
            }

        }
        //make arrow
        svg.append("g")
            .attr("transform", "translate(" + 460 + "," + ((h/2)+padding.top) + ")")
            .append("path")
            .attr("d", "M-" + (r*.30) + ",0L0," + (r*.10) + "L0,-" + (r*.10) + "Z")
            .style({"fill":"red"});
        //draw spin circle
        container.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 80)
            .style({"fill":"white"});

        //spin text
        container.append("text")
            .attr("x", 0)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .text("SPIN")
            .style({"font-weight":"bold", "font-size":"30px"});
        
        
        function rotTween(to) {
          var i = d3.interpolate(oldrotation % 360, rotation);
          return function(t) {
            return "rotate(" + i(t) + ")";
          };
        }
        
        
        function getRandomNumbers(){
            var array = new Uint16Array(1000);
            var scale = d3.scale.linear().range([360, 1440]).domain([0, 100000]);
            if(window.hasOwnProperty("crypto") && typeof window.crypto.getRandomValues === "function"){
                window.crypto.getRandomValues(array);
                console.log("works");
            } else {
                //no support for crypto, get crappy random numbers
                for(var i=0; i < 1000; i++){
                    array[i] = Math.floor(Math.random() * 100000) + 1;
                }
            }
            return array;
        }
  
     
        document.getElementById('submitSpin').addEventListener('click', spin);