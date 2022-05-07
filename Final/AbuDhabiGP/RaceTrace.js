Promise.all([
    d3.csv("AbuGP.csv"), d3.csv("Drivers.csv")]).then(([gpData, driverData]) => {

//SVG
    const width = 1200;
    const height = 800;
    const margin = {t: 100, b: 100, l: 50, r: 20};
    const svg = d3.select("#d3-container-RaceTrace")
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .style("background-color", "none")
        .attr("viewBox", [0, 0, width, height]);

    const tableD = {h: 200, w: width, marginL: 50, marginT: 40, marginR: margin.r}
    const table = d3.select("#d3-container-RaceTrace")
        .append("svg")
        .attr("height", tableD.h)
        .attr("width", width)
        .style("background-color", "none")
        .attr("viewBox", [0, 0, tableD.w, tableD.h]);

    //Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.t - 40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("font-size", "40px")
        .text("Race 22 - 2021 Abu Dhabi Grand Prix");



    function makeTeamRect(x, y, w, h, team) {
        table.append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", w)
            .attr("height", h)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("cursor", "pointer")
            .style("pointer-events", "visible")
            .on("click", toggleTeam);
    }

    function makeDriverRect(x, y, w, h, driverId) {
        let i = lineData.findIndex(item => item.id === driverId);
        table.append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", w)
            .attr("height", h)
            .attr("id", "D" + driverId)
            .attr("fill-opacity", function () {
                return i >= 0 ? "1" : "0.3";
            })
            .attr("fill", function () {
                return i >= 0 ? "white" : "red";
            })
            .attr("stroke", "black")
            .attr("cursor", "pointer")
            .style("pointer-events", function () {
                return i >= 0 ? "visible" : "none";
            })
            .on("click", toggleDriver)
            .on("mouseover", highlightDriver)
            .on("mouseout", resetDriver)
    }

    function teamLabel(x, y, text) {
        table.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .style("pointer-events", "none")
            .text(text);
    }

    function legendLine(x, y, w, h, driver) {
        table.append("line")
            .attr("x1", x + 5)
            .attr("y1", y + 10)
            .attr("x2", x + w - 5)
            .attr("y2", y + 10)
            .attr("stroke", driver.color)
            .attr("stroke-width", "5")
            .attr("stroke-dasharray", function () {
                return driver.check === "TRUE" ? 0 : 10
            })
            .style("pointer-events", "none");
    }

    const lineData = []; //line paths
    const lapAvg = []; //Avg laps

    driverData.forEach(d => {
        d.DriverID = +d.DriverID;
    })

    gpData.forEach(d => {
        d.milliseconds = +d.milliseconds;
        d.driverId = +d.driverId;
        d.lap = +d.lap;


        let dIndex = lineData.findIndex(item => item.id === d.driverId);
        if (dIndex === -1) {
            lineData.push({id: d.driverId, lapData: [{lap: 1, mSec: d.milliseconds}]})
        } else {
            let prevTimeD = lineData[dIndex].lapData[lineData[dIndex].lapData.length - 1].mSec;
            lineData[dIndex].lapData.push({lap: d.lap, mSec: prevTimeD + d.milliseconds})
        }

        let lIndex = lapAvg.findIndex(item => item.lap === d.lap);
        if (lIndex === -1) {
            lapAvg.push({lap: d.lap, avg: 0, times: [d.milliseconds]})
        } else {
            lapAvg[lIndex].times.push(d.milliseconds);
        }
    })


    lapAvg.forEach(d => {
        if (d.lap === 1) {
            d.avg = d3.mean(d.times);
        } else {
            d.avg = lapAvg[d.lap - 2].avg + d3.median(d.times);
        }
    })
    console.log(lapAvg);


    const yExtentArr = [];
    lineData.forEach(i => {
        i.lapData.forEach(d => {
            d.mSec = (lapAvg[d.lap - 1].avg - d.mSec) / 1000;
            yExtentArr.push(d.mSec);
        })
    })
    console.log(lineData);

    //xScale
    const xScale = d3.scaleLinear()
        .domain([1, lapAvg.length])
        .range([margin.l, width - margin.r]);

    //Yscale
    let yExtent = d3.extent(yExtentArr);
    let yPad = 1.15;
    const yScale = d3.scaleLinear()
        .domain([yExtent[0], yExtent[1]])
        .range([height - margin.b, margin.t]);

    const x_axis = d3.axisBottom(xScale)
        .ticks(20)
        .tickSize(-height + margin.t + margin.b)
    svg.append("g")
        .attr("class", "axis")
        .attr("id", 'x_axis')
        .attr('transform', `translate(0, ${height - margin.b})`)
        .call(x_axis)
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 50)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .text("Lap Number");

    //Yaxis
    const y_axis = d3.axisLeft(yScale)
        .tickSize(-width + margin.r + margin.l)
    svg.append("g")
        .attr("class", "axis")
        .attr("id", 'y_axis')
        .attr('transform', `translate(${margin.l}, 0)`)
        .call(y_axis)
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2.5)
        .attr("y", margin.l - 35)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .text("Delta Time(s)");

    const makeLine = d3.line()
        .curve(d3.curveLinear)
        .x(d => xScale(d.lap))
        .y(d => yScale(d.mSec));

    //safety car
    svg.append("rect")
        .attr("x", xScale(53))
        .attr("y", margin.t)
        .attr("height", height - margin.t - margin.b)
        .attr("width", xScale(57) - xScale(53))
        .attr("fill", "yellow")
        .attr("opacity", ".2")
        .attr("stroke", "none");

    //Finish Line
    let lastLap = lapAvg.length;
    svg.append("line")
        .attr("x1", xScale(lastLap))
        .attr("y1", height - margin.b)
        .attr("x2", xScale(lastLap))
        .attr("y2", margin.t)
        .attr('stroke-width', '4')
        .attr("opacity", ".8")
        .attr('stroke', "black")
        .attr("stroke-dasharray", "10");
    svg.append("line")
        .attr("x2", xScale(lastLap) + 5)
        .attr("y2", height - margin.b)
        .attr("x1", xScale(lastLap) + 5)
        .attr("y1", margin.t)
        .attr('stroke-width', '4')
        .attr("opacity", ".8")
        .attr('stroke', "black")
        .attr("stroke-dasharray", "10");
    svg.append("line")
        .attr("x1", xScale(lastLap) + 10)
        .attr("y1", height - margin.b)
        .attr("x2", xScale(lastLap) + 10)
        .attr("y2", margin.t)
        .attr('stroke-width', '4')
        .attr("opacity", ".8")
        .attr('stroke', "black")
        .attr("stroke-dasharray", "10");

    //Ghost car line
    svg.append("line")
        .attr("x1", margin.l)
        .attr("y1", yScale(0))
        .attr("x2", width - margin.r)
        .attr("y2", yScale(0))
        .attr('stroke-width', '2')
        .attr("opacity", ".5")
        .attr('stroke', "black")
        .attr("stroke-dasharray", "20");

    //Append driver paths
    for (let i = 0; i < lineData.length; i++) {
        let di = driverData.findIndex(item => item.DriverID === lineData[i].id);
        svg.append('path')
            .attr('fill', 'none')
            .attr('stroke-width', '2')
            .attr("class", "driverPath")
            .attr("id", "D" + lineData[i].id)
            .attr("visibility", "visible")
            .attr("stroke-dasharray", function () {
                return driverData[di].Check === "TRUE" ? "0" : "10";
            })
            .attr('stroke', function () {
                return driverData[di].Color;
            })
            .attr('d', makeLine(lineData[i].lapData))
    }

    const driverByTeam = [];
    driverData.forEach(d => {
        let i = driverByTeam.findIndex(item => item.team === d.Team);
        if (i === -1) {
            driverByTeam.push({
                team: d.Team,
                color: d.Color,
                mates: [{id: d.DriverID, name: d.Name, color: d.Color, check: d.Check}]
            })
        } else {
            driverByTeam[i].mates.push({id: d.DriverID, name: d.Name, color: d.Color, check: d.Check})
        }
    })

    const rectW = (tableD.w - tableD.marginR - tableD.marginL) / 10;
    const rectH = (tableD.h - tableD.marginT) / 2;

    for (let i = 0; i < 10; i++) {
        let x = tableD.marginL + i * rectW;
        makeTeamRect(x, 3, rectW, tableD.marginT - 3, driverByTeam[i].mates.map(d => d.id));
        teamLabel(x + rectW / 2, tableD.marginT / 2 + 5, driverByTeam[i].team);
        for (let k = 0; k < 2; k++) {
            let y = tableD.marginT + k * rectH;
            makeDriverRect(x, y, rectW, rectH, driverByTeam[i].mates[k].id)
            teamLabel(x + rectW / 2, tableD.marginT + y - 10, driverByTeam[i].mates[k].name);
            legendLine(x, y, rectW, rectH, driverByTeam[i].mates[k])
        }
    }

    //Interaction
    function toggleTeam(elem) {
        const attr = elem.srcElement.attributes;
        console.log(attr)
    }

    function toggleDriver(elem) {
        const attr = elem.srcElement.attributes;
        console.log(attr)
        const currPath = d3.select("#" + attr.id.nodeValue);

        if (currPath.attr("visibility") === "visible") {
            currPath.attr("visibility", "hidden");
            d3.select(this).attr("fill-opacity", ".3")
            d3.select(this).attr("fill", "red");
        } else {
            currPath.attr("visibility", "visible");
            d3.select(this).attr("fill", "white");
            d3.select(this).attr("fill-opacity", "1")
        }
    }

    function highlightDriver(elem) {
        const attr = elem.srcElement.attributes;
        console.log(attr)
        const currPath = d3.select("#" + attr.id.nodeValue);
        if (attr.fill.nodeValue !== "red") {
            d3.selectAll(".driverPath")
                .attr("opacity", ".2");

            currPath.attr('opacity', '1')
            currPath.attr('stroke-width', '6')
        }
    }

    function resetDriver(elem) {
        d3.selectAll(".driverPath")
            .attr("opacity", "1")
            .attr("stroke-width", "2");
    }

})
