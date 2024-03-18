// Your data
var data = [
    { date: new Date("Wed Oct 11 2023 00:00:00 GMT+0200"), count: 10 },
    { date: new Date("Thu Oct 12 2023 00:00:00 GMT+0200"), count: 40 },
    { date: new Date("Fri Oct 13 2023 00:00:00 GMT+0200"), count: 30 },
    { date: new Date("Sat Oct 14 2023 00:00:00 GMT+0200"), count: 40 },
    // Add more data objects here
    // { date: new Date("Tue Mar 12 2024 00:00:00 GMT+0100"), count: 124 }
  ];
  
  // Set up dimensions for the chart
  var margin = { top: 20, right: 30, bottom: 30, left: 60 },
      width = 600 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
  
  // Append SVG to the body
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  // Set up scales
  var x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return d.date; }))
      .range([0, width]);
  
  var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return d.count; })])
      .nice()
      .range([height, 0]);
  
  // Define the line
  var line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.count); });
  
  // Append the line
  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);
  
  // Append the x axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
  
  // Append the y axis
  svg.append("g")
      .call(d3.axisLeft(y));
  