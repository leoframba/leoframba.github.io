Promise.all([
    d3.csv("ItalianGP.csv"), d3.csv("Drivers.csv"), d3.csv("status.csv"), d3.csv("ItalianResults.csv")]).then(([gpData, driverData, statusData, resultsData]) => {

//SVG
    console.log(statusData);
    console.log(resultsData);
    const width = 1200;
    const height = 800;
    const margin = {t: 100, b: 100, l: 50, r: 20};
    const svg = d3.select("#d3-container-RaceTrace")
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .style("background-color", "none")
        .attr("viewBox", [0, 0, width, height]);

    //Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.t - 40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("font-size", "40px")
        .text("Race 14 - 2021 Italian Grand Prix");

    const lineData = []; //line paths
    const lapAvg = []; //Avg laps

    driverData.forEach(d => {
        d.DriverID = +d.DriverID;
        d.order = +d.order;
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
        .domain([1, lapAvg.length + .5])
        .range([margin.l, width - margin.r]);

    //Yscale
    let yExtent = d3.extent(yExtentArr);
    const yScale = d3.scaleLinear()
        .domain([yExtent[0], yExtent[1] + 5])
        .range([height - margin.b, margin.t]);

    //Xaxis
    const x_axis = d3.axisBottom(xScale)
        .ticks(25)
        .tickSize(-height + margin.t + margin.b)
    svg.append("g")
        .attr("class", "axis")
        .attr("id", 'x_axis')
        .attr('transform', `translate(0, ${height - margin.b})`)
        .style("font-size", "15px")
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
        .style("font-size", "15px")
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
    let scLaps = [25, 31]
    svg.append("rect")
        .attr("x", xScale(scLaps[0]))
        .attr("y", margin.t)
        .attr("height", height - margin.t - margin.b)
        .attr("width", xScale(scLaps[1]) - xScale(scLaps[0]))
        .attr("fill", "yellow")
        .attr("id", "sc")
        .attr("fill-opacity", ".2")
        .attr("stroke", "none");
    svg.append("rect")
        .attr("x", xScale(4))
        .attr("y", height - 65)
        .attr("height", 30)
        .attr("width", xScale(10) - xScale(4))
        .attr("fill", "yellow")
        .attr("fill-opacity", ".2")
        .attr("stroke", "black")
        .on("mouseover", function () {
            let d = d3.select("#sc");
            d.attr("stroke", "black")
            d.attr("stroke-width", "2px")
            d3.selectAll(".driverPath")
                .attr("opacity", ".2")
        })
        .on("mouseout", function () {
            let d = d3.select("#sc");
            d.attr("stroke", "none")
            d.attr("stroke-width", "2px")
            d3.selectAll(".driverPath")
                .attr("opacity", "1")
        })
    //sc2
    //safety car
    // let scLaps2 = [46, 48]
    // svg.append("rect")
    //     .attr("x", xScale(scLaps2[0]))
    //     .attr("y", margin.t)
    //     .attr("height", height - margin.t - margin.b)
    //     .attr("width", xScale(scLaps2[1]) - xScale(scLaps2[0]))
    //     .attr("fill", "yellow")
    //     .attr("id", "sc")
    //     .attr("fill-opacity", ".2")
    //     .attr("stroke", "none");
    // svg.append("rect")
    //     .attr("x", xScale(4))
    //     .attr("y", height - 65)
    //     .attr("height", 30)
    //     .attr("width", xScale(10) - xScale(4))
    //     .attr("fill", "yellow")
    //     .attr("fill-opacity", ".2")
    //     .attr("stroke", "black")
    //     .on("mouseover", function () {
    //         let d = d3.selectAll("#sc");
    //         d.attr("stroke", "black")
    //         d.attr("stroke-width", "2px")
    //         d3.selectAll(".driverPath")
    //             .attr("opacity", ".2")
    //     })
    //     .on("mouseout", function () {
    //         let d = d3.selectAll("#sc");
    //         d.attr("stroke", "none")
    //         d.attr("stroke-width", "2px")
    //         d3.selectAll(".driverPath")
    //             .attr("opacity", "1")
    //     })
    svg.append("text")
        .attr("x", xScale(4) + (xScale(10) - xScale(4)) / 2)
        .attr("y", height - 45)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("pointer-events", "none")
        .text("Safety Car");
    //RedFlag
    // svg.append("line")
    //     .attr("x1", xScale(48))
    //     .attr("y1", margin.t)
    //     .attr("x2", xScale(48))
    //     .attr("y2", height - margin.t)
    //     .attr("id", "rf")
    //     .attr("opacity", "1")
    //     .attr("stroke", "red")
    //     .attr("stroke-dasharray", "2");
    let red = svg.append("rect")
        .attr("x", xScale(12))
        .attr("y", height - 65)
        .attr("height", 30)
        .attr("width", xScale(10) - xScale(4))
        .attr("fill", "red")
        .attr("fill-opacity", ".2")
        .attr("stroke", "red")
        .attr("stroke-width", "2")
        .attr("stroke-dasharray", "3")
        .on("mouseover", function () {
            let d = d3.selectAll("#rf");
            d.attr("stroke-width", "4px")
            d.attr("stroke-dasharray", "0")
            d3.selectAll(".driverPath")
                .attr("opacity", ".2")
        })
        .on("mouseout", function () {
            let d = d3.selectAll("#rf");
            d.attr("stroke-width", "2px")
            d.attr("stroke-dasharray", "3")
            d3.selectAll(".driverPath")
                .attr("opacity", "1")
        })

    svg.append("text")
        .attr("x", xScale(12) + (xScale(10) - xScale(4)) / 2)
        .attr("y", height - 45)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("pointer-events", "none")
        .text("Red Flag");





    //Finish Line
    let lastLap = lapAvg.length + .3;
    svg.append("line")
        .attr("x1", xScale(lastLap))
        .attr("y1", height - margin.b)
        .attr("x2", xScale(lastLap))
        .attr("y2", margin.t)
        .attr('stroke-width', '6')
        .attr("opacity", ".8")
        .attr('stroke', "black")
        .attr("stroke-dasharray", "10");
    svg.append("line")
        .attr("x2", xScale(lastLap) + 5)
        .attr("y2", height - margin.b)
        .attr("x1", xScale(lastLap) + 5)
        .attr("y1", margin.t)
        .attr('stroke-width', '6')
        .attr("opacity", ".8")
        .attr('stroke', "black")
        .attr("stroke-dasharray", "10");
    svg.append("line")
        .attr("x1", xScale(lastLap) + 10)
        .attr("y1", height - margin.b)
        .attr("x2", xScale(lastLap) + 10)
        .attr("y2", margin.t)
        .attr('stroke-width', '6')
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
            .attr("id", "P" + lineData[i].id)
            .attr("visibility", "visible")
            .attr("clip-path", "url(#clip)")
            .attr("stroke-dasharray", function () {
                console.log(di + " " + lineData[i].id)
                return driverData[di].Check === "TRUE" ? "0" : "10";
            })
            .attr('stroke', function () {
                return driverData[di].Color;
            })
            .attr('d', makeLine(lineData[i].lapData))
    }

    //Clip
    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", margin.l)
        .attr("y", margin.t)
        .attr("width", width - margin.l - margin.r)
        .attr("height", height - margin.t - margin.b);

    //Legend
    const legendSet = {h: 150, w: width - margin.l - margin.r, marginL: 0, marginT: 0, marginR: margin.r}
    const legend = d3.select("#d3-container-RaceTrace")
        .append("svg")
        .attr("height", legendSet.h)
        .attr("width", legendSet.w)
        .style("background-color", "none")
        .style("border", "1px solid black")
        .style("margin-left", "50px")
        .style("margin-top", "-20px")
        .attr("viewBox", [0, 0, legendSet.w, legendSet.h]);

    function buildLegend(columns, rows, x, y, w, h) {
        let rectH = h / rows;
        let rectW = w / columns;
        let pizza = 0;
        //Interaction rects
        for(let i = 0; i < columns; i++) {
            let rectX = x + i * rectW;
            for (let k = 0; k < rows; k++) {
                let rectY = y + k * rectH;
                legend.append("rect")
                    .attr("x", rectX)
                    .attr("y", rectY)
                    .attr("width", rectW)
                    .attr("height", rectH)
                    .attr("fill", function () { return legs[pizza].laps > 0 ? "none" : "red"})
                    .attr("fill-opacity", function () { return legs[pizza].laps > 0 ? "1" : ".3"})
                    .attr("toggle", "on")
                    .attr("driverId", legs[pizza].id)
                    .attr("id", "L" + legs[pizza].id)
                    .attr("stroke", "black")
                    .attr("stroke-width", function () { return legs[pizza].laps > 0 ? "0" : "3"})
                    .attr("cursor", "pointer")
                    .attr("pointer-events", function () { return legs[pizza].laps > 0 ? "all" : "none"})
                    .on("click", function (elem) {
                        let d = d3.select(this);
                        let currPath = d3.select("#P" + d.attr("driverId"));
                        let t = d3.select("#T" + d.attr("driverId"));

                        if (currPath.attr("visibility") === "visible") {
                            currPath.attr("visibility", "hidden");
                            d.attr("fill-opacity", ".3")
                            d.attr("fill", "red");
                            d.attr("toggle", "off")
                            t.attr("fill-opacity", ".3")
                            t.attr("fill", "red");
                            t.attr("toggle", "off")
                        } else {
                            currPath.attr("visibility", "visible");
                            d.attr("fill", "none");
                            d.attr("fill-opacity", "1")
                            d.attr("toggle", "on")
                            t.attr("fill", "none");
                            t.attr("fill-opacity", "1")
                            t.attr("toggle", "on")
                        }
                    })
                    .on("mouseover", function (elem) {
                        let d = d3.select(this);
                        let t = d3.select("#T" + d.attr("driverId"));
                        if (d.attr("toggle") === "on") {
                            d.attr("fill", "#fee8c8")
                            d.attr("stroke-width", "3")
                            t.attr("fill", "#fee8c8")
                            t.attr("stroke-width", "3")
                        }

                        const currPath = d3.select("#P" + d.attr("driverId"));
                        if (d.attr("toggle") === "on") {
                            d3.selectAll(".driverPath")
                                .attr("opacity", ".2");

                            currPath.attr('opacity', '1')
                            currPath.attr('stroke-width', '6')
                        }
                    })
                    .on("mouseout", function () {
                        let d = d3.select(this);
                        let t = d3.select("#T" + d.attr("driverId"));
                        console.log(d.attr("toggle"));
                        if (d.attr("toggle") === "on") {
                            d.attr("fill", "none")
                            d.attr("stroke-width", "0")
                            t.attr("fill", "none")
                            t.attr("stroke-width", "0")
                        }

                        d3.selectAll(".driverPath")
                            .attr("opacity", "1")
                            .attr("stroke-width", "2");
                    })
                pizza++;
            }
        }

        //Table
        pizza = 0;
        for (let i = 0; i < columns; i++) {
            let rectX = x + i * rectW;
            for (let k = 0; k < rows; k++) {
                let rectY = y + k * rectH;
                legend.append("text")
                    .attr("x", rectX + rectW / 2)
                    .attr("y", rectY + rectH / 2 - 5)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "20px")
                    .attr("pointer-events", "none")
                    .text(legs[pizza].name);
                legend.append("line")
                    .attr("x1", rectX + 10)
                    .attr("y1", rectY + rectH / 2 + 5)
                    .attr("x2", rectX + rectW - 10)
                    .attr("y2", rectY + rectH / 2 + 5)
                    .attr("stroke", legs[pizza].color)
                    .attr("stroke-width", "6")
                    .attr("stroke-dasharray", function () {
                        return legs[pizza].check === "TRUE" ? 0 : 10
                    })
                    .style("pointer-events", "none");
                pizza++;
            }
        }
    }

    console.log(driverData);
    const results = [];
    resultsData.forEach(d => {
        d.driverId = +d.driverId;
        let i = results.findIndex(item => item.id === d.driverId)
        if (i < 0){
            let dI = driverData.findIndex(item => item.DriverID === d.driverId);
            let sI = statusData.findIndex(item => item.statusId === d.statusId);
            console.log(dI + " " + d.driverId);
            results.push({
                id: d.driverId,
                name: driverData[dI].Name,
                team: driverData[dI].Team,
                laps: d.laps,
                grid: d.grid,
                pos: d.position,
                status: statusData[sI].status,
                color: driverData[dI].Color,
                check: driverData[dI].Check,
                order: driverData[dI].order
            })
        }
    })
    let legs = [...results]
    legs.sort((a,b) => d3.ascending(a.order, b.order))
    buildLegend(10, 2, 1, 1, legendSet.w - 1, legendSet.h - 2)

    function resetDriver(elem) {
        d3.selectAll(".driverPath")
            .attr("opacity", "1")
            .attr("stroke-width", "2");
    }

    //RaceTable
    const rtSet = {h: height + legendSet.h - margin.t - 20, w: 500, mT: 10, mB: 10, mL: 10, mR: 10}
    const raceTable = d3.select("#d3-container-RaceTrace")
        .append("svg")
        .attr("height", rtSet.h)
        .attr("width", rtSet.w)
        .attr("viewBox", [0, 0, rtSet.w, rtSet.h])
        .style("border", "1px solid black")
        .style("margin-top", "100px")


    const resultCol = ["Place", "Driver", "Team", "Grid", "Laps", "Status"];
    function buildTable(columns, rows, x, y, w, h){
        let rectH = h / (rows + 1);
        let rectW = [.1, .2, .22, .12 , .12 , .1].map(d => d * w)
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
                    return i === 1 || i === 2 ? rectX + 10 : rectW[i] / 2 + rectX + 5;
                })
                .attr("y", rectH / 2 + y + 5)
                .attr("text-anchor", function () {
                    return i === 0 || i === 3 || i === 4 ? "middle" : "left";
                })
                .attr("font-size", "18px")
                .attr("pointer-events", "none")
                .style("font-weight", "bold")
                .text(function () { return resultCol[i] })
        }

        //Title line
        raceTable.append("line")
            .attr("x1", 0)
            .attr("y1", rectH)
            .attr("x2", rtSet.w)
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
                .attr("fill", function () { return results[i].laps > 0 ? "none" : "red"})
                .attr("fill-opacity", function () { return results[i].laps > 0 ? "1" : ".3"})
                .attr("toggle", "on")
                .attr("driverId", results[i].id)
                .attr("id", "T" + results[i].id)
                .attr("stroke", "black")
                .attr("stroke-width", function () { return results[i].laps > 0 ? "0" : "3"})
                .attr("cursor", "pointer")
                .attr("pointer-events", function () { return results[i].laps > 0 ? "all" : "none"})
                .on("click", function(elem){
                    let d = d3.select(this);
                    let currPath = d3.select("#P" + d.attr("driverId"));
                    let l = d3.select("#L" + d.attr("driverId"));

                    if (currPath.attr("visibility") === "visible") {
                        currPath.attr("visibility", "hidden");
                        d.attr("fill-opacity", ".3")
                        d.attr("fill", "red");
                        d.attr("toggle", "off")
                        l.attr("fill-opacity", ".3")
                        l.attr("fill", "red");
                        l.attr("toggle", "off")
                    } else {
                        currPath.attr("visibility", "visible");
                        d.attr("fill", "none");
                        d.attr("fill-opacity", "1")
                        d.attr("toggle", "on")
                        l.attr("fill", "none");
                        l.attr("fill-opacity", "1")
                        l.attr("toggle", "on")
                    }
                })
                .on("mouseover", function (elem){
                    let d = d3.select(this);
                    let l = d3.select("#L" + d.attr("driverId"));
                    if(d.attr("toggle") === "on") {
                        d.attr("fill", "#fee8c8")
                        d.attr("stroke-width", "3")
                        l.attr("fill", "#fee8c8")
                        l.attr("stroke-width", "3")
                    }

                    const currPath = d3.select("#P" + d.attr("driverId"));
                    if (d.attr("toggle") === "on") {
                        d3.selectAll(".driverPath")
                            .attr("opacity", ".2");

                        currPath.attr('opacity', '1')
                        currPath.attr('stroke-width', '6')
                    }
                })
                .on("mouseout", function (){
                    let d = d3.select(this);
                    let l = d3.select("#L" + d.attr("driverId"));
                    if(d.attr("toggle") === "on") {
                        d.attr("fill", "none")
                        d.attr("stroke-width", "0")
                        l.attr("fill", "none")
                        l.attr("stroke-width", "0")
                    }

                    d3.selectAll(".driverPath")
                        .attr("opacity", "1")
                        .attr("stroke-width", "2");
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
                        return i === 1 || i === 2 ? rectX + 10 : rectW[i] / 2 + rectX + 5;
                    })
                    .attr("y", rectH / 2 + rectY + 5)
                    .attr("text-anchor", function () {
                        return i === 0 || i === 3 || i === 4 ? "middle" : "left";
                    })
                    .attr("font-size", "18px")
                    .attr("pointer-events", "none")
                    .text(function (){
                        switch (i) {
                            case 0: return results[k].pos === "\\N" ? "--" : results[k].pos.toString();
                            case 1: return results[k].name;
                            case 2: return results[k].team;
                            case 3: return results[k].grid;
                            case 4: return results[k].laps;
                            case 5: return results[k].status;
                        }
                    });
            }
        }
    }
    buildTable(resultCol.length, results.length, 3, 3, rtSet.w - 3, rtSet.h - 3)

    console.log(results)
})
