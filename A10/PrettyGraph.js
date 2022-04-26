

//SVG
const width = 500;
const height = 800;
const margin = {t: 20, b: 50, l: 150, r: 25};
const svg = d3.select("#d3-container-PrettyGraph")
    .append("svg")
    // .attr("height", height - margin.t - margin.b)
    // .attr("width", width - margin.r - margin.l)
    .attr("height", height)
    .attr("width", width)
    .style("background-color", "none")
    .style("border", "1px solid black")
    .attr("viewBox", [0, 0, width, height]);

d3.csv("US_Pop_Data.csv").then(popData =>{

    const barData = [];
    popData.forEach(d => {
        d.Pop2010 = +d.Pop2010;
        d.Pop2019 = +d.Pop2019;

        let index = barData.findIndex(e => d.STNAME === e.id)
        if(index === -1){
            barData.push({ id: d.STNAME, pop2010: d.Pop2010, pop2019: d.Pop2019, growth: 0})
        }else{
            barData[index].pop2010 += d.Pop2010;
            barData[index].pop2019 += d.Pop2019;
        }
    })
    console.log(barData);

    barData.map(function (d) {
        d.growth = (d.pop2019 - d.pop2010) / d.pop2010;
    })
    barData.sort((a, b) => d3.descending(a.growth, b.growth))
    console.log(barData);

    //X Scale
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.growth)])
        .range([margin.l, width - margin.r])
    //X Axis
    const xTicks = 5;
    const xAxis = d3.axisBottom(xScale)
        .tickSize(0)
        .ticks(xTicks)
        .tickFormat(d3.format(".0%"));
    svg.append("g")
        .attr("class", "xAxis")
        .attr("id", 'xAxis')
        .attr('transform', `translate(0, ${height - margin.b})`)
        .call(xAxis)
    //Label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - margin.b + 40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .text("population growth, 2010 to 2019");
    //Ticks
    for(let i = 1; i < xTicks; i++){
        let x = i * 5 / 100;
        svg.append("line")
            .attr("x1", xScale(x))
            .attr("y1", height - margin.b)
            .attr("x2", xScale(x))
            .attr("y2", margin.t)
            .style("stroke", "silver")
            .style("opacity", ".5")
            .style("stroke-width", "2px")

    }


    //YScale
    const yScale = d3.scaleBand()
        .domain(barData.map(d => d.id))
        .range([margin.t, height - margin.b])
        .padding(.2);
    //Y Axis
    const yAxis = d3.axisLeft(yScale)
        .tickSize(0);
    svg.append("g")
        .attr("class", "yAxis")
        .attr("id", 'yAxis')
        .attr('transform', `translate(${margin.l}, 0)`)
        .call(yAxis)

    const bars = svg.selectAll("rect")
        .data(barData)
        .enter()
        .append("rect")
        .attr('x', xScale(0))
        .attr('y', d => yScale(d.id))
        .attr('height', yScale.bandwidth())
        .attr('width', function (d) {
            if (d.growth >= 0) {
                return xScale(d.growth) - xScale(0)
            } else return -(xScale(d.growth) - xScale(0));
        })
        .style('fill', function (d) {
            return d.growth >= 0 ? "forestgreen" : "crimson";
        });

    //ColorScale
    const colorScale = d3.scaleOrdinal()
        .domain(["Increase", "Decrease"])
        .range(["forestgreen", "crimson"])
    const legend = d3.legendColor()
        .scale(colorScale)
        .shapeWidth(15)
        .shapePadding(4);
    svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${400}, ${height - 100})`);
    svg.select(".legend").call(legend);
})