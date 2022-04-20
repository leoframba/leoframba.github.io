


//SVG
const width = 1050;
const height = 900;
const margin = {t: 100, b: 200, l: 100, r: 100};
const svg = d3.select("#d3-container-RaceTrace")
    .append("svg")
    .attr("height", height - margin.t - margin.b)
    .attr("width", width - margin.r - margin.l)
    .style("background-color", "silver")
    .attr("viewBox", [0, 0, width, height]);

Promise.all([
d3.csv("HungGP.csv"), d3.csv("Drivers.csv")]).then(([gpData, driverData]) => {

    const lineData = []; //line paths
    const lapAvg =[]; //Avg laps

    driverData.forEach(d => {
        d.DriverID = +d.DriverID;
    })

    gpData.forEach(d => {
        d.milliseconds = +d.milliseconds;
        d.driverId = + d.driverId;
        d.lap = +d.lap;



        let dIndex = lineData.findIndex(item => item.Id === d.driverId);
        if(dIndex === -1){
            lineData.push({Id: d.driverId, lapData: [{lap: 1, mSec: d.milliseconds}]})
        }else{
            let prevTimeD = lineData[dIndex].lapData[lineData[dIndex].lapData.length - 1].mSec;
            lineData[dIndex].lapData.push({lap: d.lap, mSec: prevTimeD + d.milliseconds})
        }

        let lIndex = lapAvg.findIndex(item => item.lap === d.lap);
        if(lIndex === -1){
            lapAvg.push({lap: d.lap, avg: 0, times: [d.milliseconds]})
        }else{
            lapAvg[lIndex].times.push(d.milliseconds);
        }
    })


    lapAvg.forEach(d => {
        if(d.lap === 1){
            d.avg = d3.mean(d.times);
        }else{
            d.avg = lapAvg[d.lap - 2].avg + d3.mean(d.times);
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

    let colorDomain = [];
    driverData.forEach(d => {
        let index = colorDomain.indexOf(d.Name);
        if(index === -1){
            colorDomain.push(d.Name)
        }
    });

    let colorRange = [];
    for(let i = 0; i < colorDomain.length; i++){
        let index = driverData.findIndex(item => item.Name === colorDomain[i])
        colorRange.push(driverData[index].Color);
    }
    console.log(colorRange);

    console.log(colorDomain);
    //ColorScale
    const colorScale = d3.scaleOrdinal()
        .domain(colorDomain)
        .range(colorRange);
    const legend = d3.legendColor()
        .scale(colorScale)
        .title("Drivers")
        .orient("horizontal")
        .cells(11)
        .shapeWidth(40)
        .shapePadding(2);
    svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${margin.r}, ${height - margin.b / 2})`);
    svg.select(".legend").call(legend);


    //Yscale
    let yExtent = d3.extent(yExtentArr);
    console.log(yExtent);
    let yPad = 1.15;
    const yScale = d3.scaleLinear()
        .domain([yExtent[0], yExtent[1]])
        .range([height - margin.b, margin.t]);

    const x_axis = d3.axisBottom(xScale)
        .ticks(15);
    svg.append("g")
        .attr("class", "axis")
        .attr("id", 'x_axis')
        .attr('transform', `translate(0, ${height - margin.b})`)
        .call(x_axis)
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - margin.b / 1.3)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .text("Lap");

    //Yaxis
    const y_axis = d3.axisLeft(yScale);
    svg.append("g")
        .attr("class", "axis")
        .attr("id", 'y_axis')
        .attr('transform', `translate(${margin.l}, 0)`)
        .call(y_axis)
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2.5)
        .attr("y", margin.l - 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .text("Delta Time(s)");

    const makeLine = d3.line()
        .curve(d3.curveLinear)
        .x(d => xScale(d.lap))
        .y(d => yScale(d.mSec));

    //Finish line
    const lapCount = lapAvg.length;
    svg.append("line")
        .attr("x1", xScale(lapCount))
        .attr("y1", height - margin.b)
        .attr("x2", xScale(lapCount))
        .attr("y2", margin.t)
        .attr('stroke-width', '4')
        .attr("opacity", ".8")
        .attr('stroke', "black")
        .attr("stroke-dasharray", "10");
    svg.append("line")
        .attr("x2", xScale(lapCount) + 5)
        .attr("y2", height - margin.b)
        .attr("x1", xScale(lapCount) + 5)
        .attr("y1", margin.t)
        .attr('stroke-width', '4')
        .attr("opacity", ".8")
        .attr('stroke', "black")
        .attr("stroke-dasharray", "10");
    svg.append("line")
        .attr("x1", xScale(lapCount) + 10)
        .attr("y1", height - margin.b)
        .attr("x2", xScale(lapCount) + 10)
        .attr("y2", margin.t)
        .attr('stroke-width', '4')
        .attr("opacity", ".8")
        .attr('stroke', "black")
        .attr("stroke-dasharray", "10");

    svg.append("line")
        .attr("x1", margin.l)
        .attr("y1", yScale(0))
        .attr("x2", width - margin.r)
        .attr("y2", yScale(0))
        .attr('stroke-width', '2')
        .attr("opacity", ".5")
        .attr('stroke', "black")
        .attr("stroke-dasharray", "20");

    for(let i = 0; i < lineData.length; i++){
        svg.append('path')
            .attr('fill', 'none')
            .attr('stroke-width', '1.5')
            .attr("opacity", "1")
            .attr("stroke-dasharray", function () {
                let index = driverData.findIndex(item => item.DriverID === lineData[i].Id);
                console.log(index);
                if(driverData[index].Check === "TRUE"){
                    return "0";
                }else return "5";
            })
            .attr('stroke', function () {
                let index = driverData.findIndex(item => item.DriverID === lineData[i].Id);
                return driverData[index].Color;
            })
            .attr('d', makeLine(lineData[i].lapData))
    }

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.t / 1.5)
        .attr("text-anchor", "middle")
        .attr("font-size", "30px")
        .text("2021 Hungarian Grand Prix");

})
