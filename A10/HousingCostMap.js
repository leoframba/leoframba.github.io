

//SVG
const width = 960;
const height = 700;
const margin = {t: 0, b: 0, l: 0, r: 0};
const svg = d3.select("#d3-container-HousingCostMap")
    .append("svg")
    // .attr("height", height - margin.t - margin.b)
    // .attr("width", width - margin.r - margin.l)
    .attr("height", height)
    .attr("width", width)
    .style("background-color", "white")
    .attr("viewBox", [0, 0, width, height]);


const projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

svg.append("text")
    .attr("x", width / 2)
    .attr("y", 100)
    .attr("text-anchor", "middle")
    .attr("font-size", "30px")
    .text("Monthly Cost of Transportation by US State ");


Promise.all([
    d3.json("US.json"),
    d3.csv("StateExp.csv")])
    .then(([jData, csvData]) => {

        const mapData = csvData.map(function (d) {
            return {name: d.State, id: +d.id, houseCost: +d.transportationCost}
        });

        console.log(mapData)

        const states = topojson.feature(jData, jData.objects.states).features;
        console.log(states)


        const colorDomain = d3.extent(mapData, d => d.houseCost);
        const colorScale = d3.scaleLinear()
            .domain(colorDomain)
            .range(["#fee8c8", "#e34a33"])
            .nice();
        const legend = d3.legendColor()
            .scale(colorScale)
            .title("Average Monthly Cost of Transportation ($)")
            .labelFormat(d3.format(""))
            .orient("horizontal")
            .cells(5)
            .shapeWidth(150)
            .shapePadding(4);
        svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${80}, ${height - 80})`);
        svg.select(".legend").call(legend);


        console.log(states);
        svg.selectAll("path")
            .data(states)
            .enter()
            .append("path")
            .attr("class", "state")
            .attr("id", d => d.id)
            .attr("d", path)
            .attr("fill", function (d) {
                let i = mapData.findIndex(k => d.id === k.id);
                return i >= 0 ? colorScale(mapData[i].houseCost) : "white";
            })
            .on("mouseover", hover);

        function hover(e){
            let attrs = e.srcElement.attributes;
            //console.log(attrs.id.nodeValue);
            let i = mapData.findIndex(d => d.id === +attrs.id.nodeValue);
            console.log(attrs.id.nodeValue);
        }


    })