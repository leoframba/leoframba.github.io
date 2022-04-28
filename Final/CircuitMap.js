

//SVG
const width = 1200;
const height = 550;
var centered;
const margin = {t: 0, b: 0, l: 0, r: 0};
const svg = d3.select("#d3-container-CircuitMap")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .attr("viewBox", [0, 0, width, height]);

const toolD = {h: 50, w : width}
const tool = d3.select("#d3-container-CircuitMap")
    .append("svg")
    .attr("height", toolD.h)
    .attr("width", toolD.w)
    .attr("viewBox", [0, 0, toolD.w, toolD.h]);
tool.append("rect")
    .attr("class", "background")
    .attr("height", toolD.h)
    .attr("width", toolD.w)
    .attr("fill", "black")
var label = tool.append("text")
    .attr("class", "countryLabel")
    .attr("x", 10)
    .attr("y", toolD.h / 1.5)
    .attr("text-anchor", "left")
    .attr("font-size", "20px")
    .text("Country: None Selected");


var projection = d3.geoEqualEarth()
    .scale(225)
    .center([0, 10])
    .translate([width / 2, height / 2])


var path = d3.geoPath().projection(projection);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white")
    .on("dblclick", reset);

svg.append("text")
    .attr("x", width / 2)
    .attr("y", 100)
    .attr("text-anchor", "middle")
    .attr("font-size", "30px")
    .text("");

const g = svg.append("g");

Promise.all([
    d3.json("WorldMap.json"),
    d3.csv("circuits.csv")])
    .then(([countData, circData]) => {

        circData.forEach(d => {
            d.lat = +d.lat;
            d.lng = +d.lng;
        })
        console.log(countData)
        console.log(circData)

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
                .attr("fill", "white")
                .attr("cursor", "pointer")
                .attr("id", d => d.properties.sovereignt)
                .attr("stroke-width", ".5px")
                .attr("centX", function (d) {
                    let centroid = path.centroid(d)
                    return centroid[0];
                })
                    .attr("centY", function (d) {
                        let centroid = path.centroid(d)
                    return centroid[1];
                })
            .on("click", clicked);

        // //Test Centroids
        // g.selectAll("circle")
        //     .data(centroids)
        //     .enter()
        //     .append("circle")
        //     .attr("cx", d => d[0])
        //     .attr("cy", d => d[1])
        //     .attr("r", 2)
        //     .attr("location", d => d)
        //     .style("fill", "Black")
        //     .on("click", showAttr);

        const circFlags = g.selectAll(".flag")
            .data(circData).enter()
            .append("circle", ".flag")
            .attr("class", "flag")
            .attr("r", 3)
            .attr("id", d => d.name)
            .attr("url", d => d.link)
            .attr("title", "This is a flag")
            .attr("fill", function (d) {
                if (d.covid === "FALSE") {
                    return "Red"
                } else return "Green"
            })

            .attr("transform", function (d) {
                return "translate(" + projection([d.lng, d.lat]) + ")";
            });
        circFlags
            .on("mouseover", hover)
            .on("mouseout", exit)
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

        function exit(elem) {
            var attrs = elem.srcElement.attributes;
            d3.select("#hoverText").remove();
        }

        function click(elem) {
            var attrs = elem.srcElement.attributes;
            window.location = attrs.url.nodeValue;
        }

        function hoverCountry(elem) {
            var attrs = elem.srcElement.attributes;
            console.log(attrs);
        }

    })

const zoomSettings = {
    duration: 3000,
    ease: d3.easeCubicOut,
    zoomLevel: 4.5
};

function clicked(elem) {
    let x;
    let y;
    let zoomLevel;
    var attrs = elem.srcElement.attributes;
    console.log("elem =" + elem.x);
    console.log("centered =" + centered);
    console.log(attrs);

    if (elem && centered !== attrs.centX.nodeValue) {
        let centroid = [parseInt(attrs.centX.nodeValue), parseInt(attrs.centY.nodeValue)];
        x =  centroid[0];
        y =  centroid[1];
        console.log(x + " " + y);
        zoomLevel = zoomSettings.zoomLevel;
        centered = attrs.centX.nodeValue;
        g.selectAll(".countries")
            .attr("fill", "white")
            .attr("stroke-width", ".1px");
        g.selectAll(".flag")
            .transition()
            .duration(1000)
            .attr("r", .8);
        setTimeout(function(){
        }, 20);
        attrs.fill.nodeValue = "#fee8c8";
        attrs["stroke-width"].nodeValue = ".3px"

        tool.select(".countryLabel")
            .text("Country: " + attrs.id.nodeValue)

        g.transition()
            .duration(1000)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + zoomLevel + ")translate(" + -x + "," + -y + ")")

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
        .attr("fill", "white")
        .attr("stroke-width", ".5px");
    g.selectAll(".flag")
        .transition()
        .duration(1000)
        .attr("r", 3);
    tool.select(".countryLabel")
        .text("Country: None Selected")
}
