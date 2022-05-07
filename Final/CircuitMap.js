

//Main map
const width = 1100;
const height = 600;
var centered;
let zoom = false;
const margin = {t: 0, b: 0, l: 0, r: 0};
const svg = d3.select("#d3-container-CircuitMap")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .attr("viewBox", [0, 0, width, height])

//toolbar
const toolD = {h: 50, w : width}
const tool = d3.select("#d3-container-CircuitMap")
    .append("svg")
    .attr("height", toolD.h)
    .attr("width", toolD.w)
    .attr("viewBox", [0, 0, toolD.w, toolD.h])
tool.append("rect")
    .attr("class", "background")
    .attr("height", toolD.h)
    .attr("width", toolD.w)
const countryLabel = tool.append("text")
    .attr("class", "countryLabel")
    .attr("x", 10)
    .attr("y", toolD.h / 1.5)
    .attr("text-anchor", "left")
    .attr("font-size", "20px")
    .text("Country: None Selected");
const circCountLabel = tool.append("text")
    .attr("class", "circCount")
    .attr("x", 900)
    .attr("y", toolD.h / 1.5)
    .attr("text-anchor", "left")
    .attr("font-size", "20px")
    .text("");

//Race Table
const rtSet = {h: height + toolD.h, w: 500, mT: 10, mB: 10, mL: 10, mR: 10}
const raceTable = d3.select("#d3-container-CircuitMap")
    .append("svg")
    .attr("height", rtSet.h)
    .attr("width", rtSet.w)
    .attr("viewBox", [0, 0, rtSet.w, rtSet.h])
    .style("border", "1px solid black")

var projection = d3.geoEqualEarth()
    .scale(250)
    .center([15, 10])
    .translate([width / 2, height / 2])


var path = d3.geoPath().projection(projection);

// svg.append("rect")
//     .attr("class", "background")
//     .attr("width", width)
//     .attr("height", height)
//     //.attr("fill", "blue")
//     .on("dblclick", reset);

svg.append("text")
    .attr("x", width / 2)
    .attr("y", 100)
    .attr("text-anchor", "middle")
    .attr("font-size", "30px")
    .text("");

const g = svg.append("g");
const circCount = [];

g.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    //.attr("fill", "blue")
    .on("dblclick", reset);

Promise.all([
    d3.json("WorldMap.json"),
    d3.csv("circuits.csv")])
    .then(([countData, circData]) => {

        circData.forEach(d => {
            d.lat = +d.lat;
            d.lng = +d.lng;
            d.round = +d.round;

            let i = circCount.findIndex(item => item.id === d.country);
            console.log(i);
            if (i < 0) {
                circCount.push({id: d.country, count: 1});
            }else circCount[i].count++;
        })
        console.log(countData)
        console.log(circData)
        console.log(circCount);

        //Race Table
        const circCols = ["Race #", "Circuit", "Country"]
        const circTable = circData.filter(d => d.round >= 0).map(function (d) {
            return {round: d.round, name: d.name, country: d.country, id: d.circuitId, link: d.link}
        });
        circTable.sort((a, b) => d3.ascending(a.round, b.round));
        console.log(circTable);

        function buildTable(columns, rows, x, y, w, h){
            let rectH = h / (rows + 1);
            let rectW = [.15, .6, .25].map(d => d * w)
            let rectX = x;
            let prevX = 0;
            //Title
            for(let i = 0; i < columns; i++){
                rectX += prevX;
                prevX = rectW[i];
                raceTable.append("rect")
                    .attr("x", rectX)
                    .attr("y", y)
                    .attr("width", rectW[i])
                    .attr("height", rectH)
                    .attr("fill", "white")
                    .attr("stroke", "black")
                    .attr("stroke-width", "0")
                raceTable.append("text")
                    .attr("x", function () {
                        return i === 1 || i === 2 ? rectX + 15 : rectW[i] / 2 + rectX + 5;

                    })
                    .attr("y", rectH / 2 + y + 5)
                    .attr("text-anchor", function () {
                        return i === 1 || i === 2 ? "left" : "middle";
                    })
                    .attr("font-size", "17px")
                    .attr("pointer-events", "none")
                    .style("font-weight", "bold")
                    .text(function () { return circCols[i] })
            }

            //Title line
            raceTable.append("line")
                .attr("x1", 0)
                .attr("y1", rectH)
                .attr("x2", w)
                .attr("y2", rectH)
                .attr("stroke", "black")
                .attr("stroke-width", "1")

            y += rectH;
            rectX = x;
            prevX = 0;

            //Interaction rects
            for(let i = 0; i < rows; i++){
                raceTable.append("rect")
                    .attr("x", x)
                    .attr("y", i * rectH + y)
                    .attr("width", w)
                    .attr("height", rectH)
                    .attr("fill", "none")
                    .attr("stroke", "black")
                    .attr("stroke-width", "0")
                    .attr("link", circTable[i].link)
                    .attr("cursor", "pointer")
                    .attr("pointer-events", "all")
                    .attr("circId", circTable[i].id)
                    .on("mouseover", function (elem) {
                        let d = d3.select(this);
                        d.attr("fill", "#fee8c8");
                        d.attr("stroke-width", "3");
                        console.log(d.attr("circId"));
                        d3.select("#f" + d.attr("circId"))
                            .transition()
                            .duration(200)
                            .attr("r", function () { return zoom ? 3 : 15})
                            .attr("fill", "#fee8c8")
                            .attr("stroke-width", function () { return zoom ? .5 : 2})
                            .attr("stroke", "black")
                    })
                    .on("mouseleave", function (elem) {
                        let d = d3.select(this);
                        d.attr("fill", "none");
                        d.attr("stroke-width", "0");
                        d3.select("#f" + d.attr("circId"))
                            .transition()
                            .duration(200)
                            .attr("r", function () { return zoom ? 1 : 3})
                            .attr("fill", "Green")
                            .attr("stroke-width", "0")


                    })
                    .on("click", function (elem) {
                        window.location = d3.select(this).attr("link");
                    })
            }

            //Table
            for(let i = 0; i < columns; i++) {
                rectX += prevX;
                prevX = rectW[i];
                for (let k = 0; k < rows; k++) {
                    let rectY = y + k * rectH;
                    raceTable.append("rect")
                        .attr("x", rectX)
                        .attr("y", rectY)
                        .attr("width", rectW[i])
                        .attr("height", rectH)
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .attr("stroke-width", "0")
                        .style("pointer-events", "none")

                    raceTable.append("text")
                        .attr("x", function () {
                            return i === 1 || i === 2 ? rectX + 15 : rectW[i] / 2 + rectX + 5;
                        })
                        .attr("y", rectH / 2 + rectY + 5)
                        .attr("text-anchor", function () {
                            return i === 1 || i === 2 ? "left" : "middle";
                        })
                        .attr("font-size", "17px")
                        .attr("pointer-events", "none")
                        .text(function (){
                            if(i === 0){
                                return circTable[k].round.toString();
                            }else if(i === 1){
                                return circTable[k].name;
                            }else{
                                return circTable[k].country;
                            }
                        });
                }
            }
        }
        buildTable(circCols.length, circTable.length, 2, 2, rtSet.w - 3, rtSet.h - 3)

        //Map
        const countries = countData.features;
        console.log(countries);
        var centroids = countries.map(function (feature){
            return path.centroid(feature);
        });
        function showAttr(elem) {
            console.log(elem.srcElement.attributes);
        }

        //Draw Map
        g.selectAll("path")
            .data(countData.features)
            .enter()
            .append("path")
                .attr("class", "countries")
                .attr("d", path)
                .attr("fill", "mintcream")
                .attr("cursor", "pointer")
                .attr("id", d => d.properties.sovereignt)
                .attr("stroke-width", ".2px")
                .attr("centX", function (d) {
                    let centroid = path.centroid(d)
                    return centroid[0];
                })
                    .attr("centY", function (d) {
                        let centroid = path.centroid(d)
                    return centroid[1];
                })
            .on("click", clicked);

        // Tooltip
        const tooltip = d3.select("#d3-container-CircuitMap")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("pointer-events", "none")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("font-size", "15px")

        //Symbols
        const circFlags = g.selectAll(".flag")
            .data(circData).enter()
            .append("circle", ".flag")
            .attr("class", "flag")
            .attr("r", 4)
            .attr("id", d => { return "f" + d.circuitId})
            .attr("name", d => d.name)
            .attr("covid", d => d.covid)
            .attr("country", d => d.country)
            .attr("url", d => d.link)
            .attr("fill", function (d) {
                if (d.covid === "FALSE") {
                    return "Red"
                } else return "Green"
            })

            .attr("transform", function (d) {
                return "translate(" + projection([d.lng, d.lat]) + ")";
            });
        circFlags
            .on("mouseover", mouseover)
            .on("mouseout", mouseleave)
            .on("mousemove", mousemove)
            .on("click", click);

        function hover(elem) {
            var attrs = elem.srcElement.attributes;
            console.log(attrs);
            console.log(attrs.url.nodeValue)
            svg.append("text")
                .attr("transform", attrs.transform.nodeValue)
                .attr("id", "hoverText")
                .attr("pointer-events", "none")
                .attr("text-anchor", "middle")
                .attr("font-size", "20px")
                .text(attrs.id.nodeValue);
        }

        function mouseover () {
            console.log(d3.select(this));
            tooltip
                .style("opacity", 1)
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", function () { return zoom ? "3" : "10"})
                .attr("cursor", "pointer")
        }

        function mousemove(event) {
            let name = d3.select(this).attr("name");
            let country = d3.select(this).attr("country");
            console.log(d3.select(this).attr("covid"));

            if(d3.select(this).attr("covid") === "TRUE") {
                tooltip
                    .html("Country: " + country + "<br>" + "Circuit: " + name)
                    .style("left", (event.pageX + 9) + "px")
                    .style("top", (event.pageY - 43) + "px")
            }else {
                let status = d3.select(this).attr("url");
                tooltip
                    .html("Country: " + country + "<br>" + "Circuit: " + name + "<br>Canceled: " + status)
                    .style("left", (event.pageX + 9) + "px")
                    .style("top", (event.pageY - 43) + "px")
            }
        }

        function mouseleave() {
            tooltip
                .style("opacity", 0)
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", function (){ return zoom ? "1" : "4"})
                .attr("cursor", "pointer")
        }

        function click(elem) {
            var attrs = elem.srcElement.attributes;
            window.location = attrs.url.nodeValue;
        }
    })

//Zoom
const zoomSettings = {
    duration: 3000,
    ease: d3.easeCubicOut,
    zoomLevel: 4.5
};

function clicked(elem) {
    console.log(elem);
    let x;
    let y;
    let zoomLevel;
    let d = d3.select(this);
    var attrs = elem.srcElement.attributes;
    // console.log("elem =" + elem.x);
    // console.log("centered =" + centered);
    // // console.log(attrs);

    if (elem && centered !== d.attr("centX")) {
        let centroid = [parseInt(d.attr("centX")), parseInt(d.attr("centY"))];
        x =  centroid[0];
        y =  centroid[1];
        //Todo fix shit code for centroid
        if(d.attr("id") === "Russia"){
            x -= 100;
            y += 20;
        }else if(d.attr("id") === "Brazil"){
            y += 20;
        }

        zoomLevel = zoomSettings.zoomLevel;
        centered = d.attr("centX");
        g.selectAll(".countries")
            .attr("fill", "mintcream")
            .attr("stroke-width", ".1px");
        g.selectAll(".flag")
            .transition()
            .duration(1000)
            .attr("r", "1");
        setTimeout(function(){
        }, 20);
        d.attr("fill", "#fee8c8");
        d.attr("stroke-width", ".2px");

        //Toolbar
        let country = d.attr("id");
        let i = circCount.findIndex(item => item.id === country);
        let count = i >= 0 ? circCount[i].count : 0;

        tool.select(".countryLabel")
            .text("Country: " + country)
        tool.select(".circCount")
            .text("Number of Circuits: " + count)

        g.transition()
            .duration(1000)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + zoomLevel + ")translate(" + -x + "," + -y + ")")
        zoom = true;
    } else {
       reset();
    }
}

function reset(){
    centered = null;
    g.transition()
        .duration(1000)
        .attr("transform", "scale(" + 1 + ")")
    g.selectAll(".countries")
        .transition()
        .duration(1000)
        .attr("fill", "mintcream")
        .attr("stroke-width", ".2px");
    g.selectAll(".flag")
        .transition()
        .duration(1000)
        .attr("r", 4);
    tool.select(".countryLabel")
        .text("Country: None Selected")
    tool.select(".circCount")
        .text("");
    zoom = false;
}
