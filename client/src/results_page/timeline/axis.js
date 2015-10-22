var Timeline = require('./treetimeline.jsx');
var dates = require('./dates.js');

module.exports = {
  
  describeAxis: function(canvas, svg, height, width, margin) {

    this.yScale = [];

    this.yScale[canvas] = d3.time.scale()
      .domain([new Date(dates.dates[canvas][dates.dates[canvas].length - 1]), new Date(dates.dates[canvas][0])])
      .rangeRound([height - margin.bottom, canvas === 1 ? 80 : 40])

    yAxis = d3.svg.axis()
      .scale(this.yScale)
      .orient('left')
      .ticks(d3.time.days, 1)
      .tickFormat(d3.time.format('%a %d'))
      .tickSize(10)
      .tickPadding(10);

    svg.append('g')
      .attr('class', 'yAxis')
      .attr({
        'font-family': 'Nunito',
        'font-size': 10 * (width / 1350) + 'px',
      })
      .attr({
        fill: 'none',
        stroke: '#000',
        'shape-rendering': 'crispEdges',
      })
      .call(yAxis);

  },

};