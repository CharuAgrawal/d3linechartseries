// Set dimensions and margins for the chart
const margin2 = { top: 70, right: 30, bottom: 40, left: 80 };
const width2 = 1200 - margin2.left - margin2.right;
const height2 = 500 - margin2.top - margin2.bottom;

// Set up the x and y scales
const xScale = d3.scaleTime()
  .range([0, width2]);

const yScale = d3.scaleLinear()
  .range([height2, 0]);

// Set up the line generator
const line = d3.line()
  .x(d => xScale(d.date))
  .y(d => yScale(d.population));

// Create the svg2 element and append it to the chart container
const svg = d3.select("#chart-container")
  .append("svg")
  .attr("width", width2 + margin2.left + margin2.right)
  .attr("height", height2 + margin2.top + margin2.bottom)
  .append("g")
  .attr("transform", `translate(${margin2.left},${margin2.top})`);

// create tooltip div

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip");



// Load and process the data
d3.csv("jdi_data_daily.csv").then(data => {
  // Parse the date and convert the population to a number
  const parseDate = d3.timeParse("%Y-%m-%d");
  data.forEach(d => {
    d.date = parseDate(d.date);
    d.population = +d.population;
  });

  // Set the domains for the x and y scales
  xScale.domain(d3.extent(data, d => d.date));
  yScale.domain([65000, d3.max(data, d => d.population)]);

  // Add the x-axis
  svg.append("g")
    .attr("transform", `translate(0,${height2})`)
    .style("font-size", "14px")
    .call(d3.axisBottom(xScale)
      .tickValues(xScale.ticks(d3.timeMonth.every(6))) // Display ticks every 6 months
      .tickFormat(d3.timeFormat("%b %Y"))) // Format the tick labels to show Month and Year
    .call(g => g.select(".domain").remove()) // Remove the x-axis line
    .selectAll(".tick line") // Select all tick lines
    .style("stroke-opacity", 0)
  svg.selectAll(".tick text")
    .attr("fill", "#777");

  // Add vertical gridlines
  svg.selectAll("xGrid")
    .data(xScale.ticks().slice(1))
    .join("line")
    .attr("x1", d => xScale(d))
    .attr("x2", d => xScale(d))
    .attr("y1", 0)
    .attr("y2", height2)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width2", .5);

  // Add the y-axis
  svg.append("g")
    .style("font-size", "14px")
    .call(d3.axisLeft(yScale)
      .ticks((d3.max(data, d => d.population) - 65000) / 5000)
      .tickFormat(d => {
        if (isNaN(d)) return "";
        return `${(d / 1000).toFixed(0)}k`;
      })
      .tickSize(0)
      .tickPadding(10))
    .call(g => g.select(".domain").remove()) // Remove the y-axis line
    .selectAll(".tick text")
    .style("fill", "#777") // Make the font color grayer
    .style("visibility", (d, i, nodes) => {
      if (i === 0) {
        return "hidden"; // Hide the first and last tick labels
      } else {
        return "visible"; // Show the remaining tick labels
      }
    });

  // Add Y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin2.left)
    .attr("x", 0 - (height2 / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#777")
    .style("font-family", "sans-serif")
    .text("Total Population");

  // Add horizontal gridlines
  svg.selectAll("yGrid")
    .data(yScale.ticks((d3.max(data, d => d.population) - 70000) / 5000).slice(1))
    .join("line")
    .attr("x1", 0)
    .attr("x2", width2)
    .attr("y1", d => yScale(d))
    .attr("y2", d => yScale(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width2", .5)

  // Add the line path
  const path = svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width2", 1)
    .attr("d", line);

  // Add a circle element

  const circle = svg.append("circle")
    .attr("r", 0)
    .attr("fill", "steelblue")
    .style("stroke", "white")
    .attr("opacity", .70)
    .style("pointer-events", "none");
  // create a listening rectangle

  const listeningRect = svg.append("rect")
    .attr("width", width2)
    .attr("height", height2);

  // create the mouse move function
  listeningRect.on("mousemove", function (event) {
    const [xCoord] = d3.pointer(event, this);
    const bisectDate = d3.bisector(d => d.date).left;
    const x0 = xScale.invert(xCoord);
    const i = bisectDate(data, x0, 1);
    const d0 = data[i - 1];
    const d1 = data[i];
    const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    const xPos = xScale(d.date);
    const yPos = yScale(d.population);


    // Update the circle position
    circle.attr("cx", xPos)
      .attr("cy", yPos);

    // Add transition for the circle radius
    circle.transition()
      .duration(50)
      .attr("r", 1); // originally 5 

    // add in  our tooltip

    tooltip
      .style("display", "block")
      .style("left", `${xPos + 100}px`)
      .style("top", `${yPos + 50}px`)
      .html(`<strong>Date:</strong> ${d.date.toLocaleDateString()}<br><strong>Population:</strong> ${d.population !== undefined ? (d.population / 1000).toFixed(0) + 'k' : 'N/A'}`)
  });

  // listening rectangle mouse leave function
  listeningRect.on("mouseleave", function () {
    circle.transition()
      .duration(50)
      .attr("r", 0);

    tooltip.style("display", "none");
  });

  // Add the chart title
  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", margin2.left - 115)
    .attr("y", margin2.top - 100)
    .style("font-size", "24px")
    //.style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .text("Prison Populations in the US Have Trended Upward Since Summer 2020");

  // Add the source credit
  svg.append("text")
    .attr("class", "source-credit")
    .attr("x", width2 - 1125)
    .attr("y", height2 + margin2.bottom - 3)
    .style("font-size", "9px")
    .style("font-family", "sans-serif")
    .text("Source: jaildatainitiative.org");

});
