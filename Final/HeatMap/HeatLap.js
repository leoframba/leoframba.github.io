Promise.all([d3.csv("HeatMap/lapTimes.csv"), d3.csv("HeatMap/Drivers.csv")]).then(([lapData, driverData]) => {
//     Promise.all([d3.csv("lapTimes.csv"), d3.csv("Drivers.csv")]).then(([lapData, driverData]) => {

        console.log(lapData);
    console.log(driverData);
    const width = 1200;
    const height = 900;
    const margin = {t: 125, b: 150, l: 150, r: 100};
    const svg = d3.select("#d3-container-Heatmap")
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .style("background-color", "none")
        .style("border", "1px solid black")
        .attr("viewBox", [0, 0, width, height])
        .append("g")

//Title
    svg.append("text")
        .attr("x", 100)
        .attr("y", 60)
        .attr("text-anchor", "left")
        .style("font-size", "40px")
        .text("Number of Laps Per Position");

    var graphData = driverData.map(function (d) {
        let driver = {id: d.DriverID, name: d.Name, team: d.Team, lapData: [], laps: [], avgPos: 0}
        for (let i = 0; i < 20; i++) {
            driver.lapData.push(0);
        }
        return driver;
    })

    console.log(graphData);

    lapData.forEach(d => {
        d.position = +d.position;

        let i = graphData.findIndex(item => item.id === d.driverId)
        if (i >= 0) {
            graphData[i].lapData[d.position - 1]++;
            graphData[i].laps.push(d.position);
        }
    })

    graphData.forEach(d => {
        d.avgPos = d3.mean(d.laps)
    })

    graphData = graphData.slice().sort((a, b) => d3.ascending(a.avgPos, b.avgPos));
    console.log(graphData);

    const yScale = d3.scaleBand()
        .domain(graphData.map(d => d.name))
        .range([margin.t, height - margin.b])
        .padding(.02);
    const avgScale = d3.scaleBand()
        .domain(graphData.map(d => d3.mean(d.laps)))
        .range([margin.t, height - margin.b])

    //Y Axis
    const yAxis = d3.axisLeft(yScale)
        .tickSize(0);
    svg.append("g")
        .attr("class", "yAxis")
        .attr("id", 'yAxis')
        .style("font-size", "25px")
        .attr('transform', `translate(${margin.l}, 0)`)
        .on("mouseover", function() {
            let d = d3.select("#d3-container-Heatmap").select("#avgPos");
            d.attr("opacity", "1")
        })
        .on("mouseout", function() {
            let d = d3.select("#d3-container-Heatmap").select("#avgPos");
            d.attr("opacity", "0")
        })
        .call(yAxis)

    //Avg Pos
    svg.append("g")
        .attr("class", "yAxis")
        .attr("id", 'avgPos')
        .attr("opacity", "0")
        .style("font-size", "25px")
        .attr('transform', `translate(${width - margin.r}, 0)`)
        .on("mouseover", function() {
            console.log("pizza")
        })
        .call(d3.axisRight(avgScale).tickSize(0).tickFormat(d3.format(".2f")))


    const xScale = d3.scaleBand()
        .domain(d3.range(1, 21))
        .range([margin.l, width - margin.r])
        .padding(.02);
    //X Axis
    const xAxis = d3.axisTop(xScale)
        .tickSize(0);
    svg.append("g")
        .attr("class", "xAxis")
        .attr("id", 'xAxis')
        .style("font-size", "25px")
        .attr('transform', `translate(0, ${margin.t})`)
        .call(xAxis)

    const colorMax = d3.max(graphData.map(d => d3.max(d.lapData)));
    const logScale = d3.scaleLog()
        .domain([1, colorMax])

    const colorScale = d3.scaleSequential(d => d3.interpolateMagma(logScale(d)))

    //Legend
    const legendX = 100;
    const legendY = height - 70;
    svg.append("text")
        .attr("x", 310)
        .attr("y", legendY - 10)
        .attr("text-anchor", "left")
        .style("font-size", "25px")
        .text("Number of Laps");
    for (let i = 0; i < 10; i++) {
        svg.append("rect")
            .attr("x", legendX + 45 + i * 50)
            .attr("y", legendY)
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .style("fill", colorScale(Math.pow(2, i)))
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)

        let test = (Math.pow(2, i)).toString()
        svg.append("text")
            .attr("x", legendX + 63 + i * 50 - i * 1.3)
            .attr("y", legendY + 50)
            .attr("text-anchor", "center")
            .style("font-size", "20px")
            .text(function () {
                if (i === 0) {
                    return "0";
                } else if (i === 9) {
                    return test + "+"
                } else return test;
            });
    }

    //Heatmap
    for (let i = 0; i < graphData.length; i++) {
        for (let p = 0; p < graphData[i].lapData.length; p++) {
            svg.append("rect")
                .attr("x", xScale(p + 1))
                .attr("y", yScale(graphData[i].name))
                .attr("rx", 2)
                .attr("ry", 2)
                .attr("value", graphData[i].lapData[p])
                .attr("width", xScale.bandwidth())
                .attr("height", yScale.bandwidth())
                .style("fill", colorScale(graphData[i].lapData[p]))
                .style("stroke-width", 4)
                .style("stroke", "none")
                .style("opacity", 0.8)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave);
        }


        //Tooltip
        const tooltip = d3.select("#d3-container-Heatmap")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("pointer-events", "none")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        function mouseover(event, elem) {
            tooltip
                .style("opacity", 1)
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }

        function mousemove(event) {
            let lapCount = d3.select(this).attr("value");
            tooltip
                .html("Laps: " + lapCount)
                .style("left", (event.pageX + 9) + "px")
                .style("top", (event.pageY - 43) + "px")
            console.log(document.getElementById("heatmap").offsetTop);
        }

        function mouseleave(elem) {
            tooltip
                .style("opacity", 0)
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
        }

    }


})