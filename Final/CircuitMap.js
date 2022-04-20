

//SVG
const width = 960;
const height = 700;
const margin = {t: 0, b: 0, l: 0, r: 0};
const svg = d3.select("#d3-container-CircuitMap")
    .append("svg")
    .attr("height", height - margin.t - margin.b)
    .attr("width", width - margin.r - margin.l)
    .style("background-color", "silver")
    .attr("viewBox", [0, 0, width, height]);


var projection = d3.geoEqualEarth()
    .scale(200)
    .translate([width / 2, height / 2])


var path = d3.geoPath().projection(projection);

svg.append("text")
    .attr("x", width / 2)
    .attr("y", 100)
    .attr("text-anchor", "middle")
    .attr("font-size", "30px")
    .text("");


Promise.all([
    d3.json("countries.json"),
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

        svg.selectAll("path").data(countries)
            .enter().append("path")
            .attr("class", "countries")
            .attr("d", path)
            .attr("fill", "white");

        const circFlags = svg.selectAll(".flag")
            .data(circData).enter()
            .append("circle", ".flag")
            .attr("class", "flag")
            .attr("r", 2)
            .attr("id", d => d.name)
            .attr("fill", function(d) {
                if (d.covid === "FALSE") {
                    return "Red"
                }else return "Green"
            })

            .attr("transform", function (d) {
                return "translate(" + projection([d.lng, d.lat]) + ")";
            });

        circFlags
            .on("mouseover", hover)
            .on("mouseout", exit)
            .on("click", click);

            function hover(elem){
                var attrs = elem.srcElement.attributes;
                console.log(attrs);
                svg.append("text")
                    .attr("transform", attrs.transform.nodeValue)
                    .attr("id", "hoverText")
                    .attr("pointer-events", "none")
                    .attr("text-anchor", "middle")
                    .attr("font-size", "20px")
                    .text(attrs.id.nodeValue);


            }

            function exit(elem){
                var attrs = elem.srcElement.attributes;
                d3.select("#hoverText").remove();
            }

            function click(elem){
                console.log("pizza");
                var url = "https://stackoverflow.com/questions/13630229/can-i-have-an-onclick-effect-in-css";
                window.location = url;
            }

    })
