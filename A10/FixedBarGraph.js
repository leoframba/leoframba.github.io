//SVG
const width = 600;
const height = 400;
const margin = {t: 20, b: 50, l: 220, r: 25};
const svg = d3.select("#d3-container-BoxOfficeGraph")
    .append("svg")
    // .attr("height", height - margin.t - margin.b)
    // .attr("width", width - margin.r - margin.l)
    .attr("height", height)
    .attr("width", width)
    .style("background-color", "none")
    .style("border", "1px solid black")
    .attr("viewBox", [0, 0, width, height]);

d3.csv("BoxOffice.csv").then(movieData => {

    const topTenData = [];
    movieData.forEach(d => {
        d.rank = +d.rank;
        d.lifetime_gross = +d.lifetime_gross;

        if(d.rank <= 10) topTenData.push(d);
    })
    console.log(movieData);

    topTenData.sort((a, b) => d3.descending(a.lifetime_gross, b.lifetime_gross))
    console.log(topTenData);

    //X Scale
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(topTenData, d => d.lifetime_gross)])
        .range([margin.l, width - margin.r])
    //X Axis
    const xTicks = 5;
    const xAxis = d3.axisBottom(xScale)
        .tickSize(0)
        .ticks(xTicks)
        .tickFormat(d3.format(".1s"))
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
        .text("Movies ranked by their gross domestic US sales ($)");
    //Ticks
    for (let i = 1; i < xTicks; i++) {
        let x = i * 200000000;
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
        .domain(topTenData.map(d => d.title))
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
        .data(topTenData)
        .enter()
        .append("rect")
        .attr('x', xScale(0))
        .attr('y', d => yScale(d.title))
        .attr('height', yScale.bandwidth())
        .attr('width', d => xScale(d.lifetime_gross) - xScale(0))
        .style('fill', "cornflowerblue")
        .style("opacity", ".9")

})