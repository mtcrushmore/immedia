var Timeline = require('./treetimeline.jsx');
var Images = require('./images.js');
var helpers = require('./helpers.js')

module.exports = {

  describeNodes: function(svg, width, yScale, nodes, defs) {

    /* In case a source does not have an image URL, the node will be filled with a random color from the
    D3 category 20c color scale */
    var colors = d3.scale.category20c();

    duration = 500;
    //Update nodes.
    var node = svg.selectAll('g.node')
        .data(nodes, function(d) { return d.id || (d.id = ++helpers.idCounter); });

    /* Determine relative position of node's based on their depth in the tree.
    If an item is very old (YouTube may return a video from over a year ago that is the search term's most
    popular result) it will affix to the bottom of the canvas. */
    nodes.forEach(function(d) { 
      if (d.depth === 1) {
        d.x = yScale(new Date(d.date));
        d.y = 0;
        d.fixed = true;
      }
      else {
        if (d.depth === 2) {
          d.y = 120 * (width > 1350 ? 1 : (width / 1350));
        };
        if (d.depth === 3) {
          d.y = 240 * (width > 1350 ? 1 : (width / 1350));
          }
        }
      });

    //Attribute mouse events to various nodes upon entering.
    var nodeEnter = node.enter().append('svg:g')
      .on('mouseover', function(d) {
        if (d.depth === 3) {
          d3.select(this).select('circle')
            .transition()
            .attr({
              r: 28,
            })
          }
      })
      .on('mouseout', function(d) {
        d3.select(this).select('circle')
          .style({
            stroke: 'steelblue',
            strokeWidth: 1.5 + 'px',
          })
        if (d.depth === 3) {
          d3.select(this).select('circle')
            .transition()
            .attr({
              r: 25,
            })
          }
      });

    /* Nodes will enter at a specified point on the canvas. When update is called on first render,
    the nodes will take shape with certain attributes, including radius, fills (usually with image if
    image url is available). */
    nodeEnter.append('svg:circle')
      .attr('r', 1e-6)
      .style('fill', function(d) { return d._children ? 'lightsteelblue' : '#fff'; })
      .style({
        cursor: 'pointer',
        fill: '#fff',
        stroke: 'steelblue',
        strokeWidth: '1.5px',
      });

    var nodeUpdate = node.transition()
        .duration(duration)
        .attr('transform', function(d) { 
          return 'translate(' + d.y + ',' + d.x + ')'; 
        });

    nodeUpdate.select('circle')
        .attr('r', function(d) {
          if (d.depth === 1 && d._children) {
            return Math.max(d._children.length * 6, 10);
          } else if (d.depth === 1 && d.children) {
            return 10;
          } else if (d.source) {
            return 12;
          } else if (d.depth === 3)
            return 25;
        })
        .style('fill', 'white')
        .style('fill', function(d) { 
          if (d.source == 'twitter') {
            return 'url(/#tile-twitter)';
          } else if (d.source === 'nyt') {
            return 'url(/#tile-nyt)';
          } else if (d.source === 'youtube') {
            return 'url(/#tile-youtube)';
          } else if (d.source === 'twitter news') {
            return 'url(/#tile-twitternews';
          } else if (d.img === '') {
            return colors(d.id);
          } else if (d.depth === 3) {
            Images.appendImageFromData(defs, d);
            return 'url(/#tile-img' + d.id + ')'
          }
          return d._children ? 'lightsteelblue' : '#fff'; 
        })

    /* When the node exits (when a node is clicked, for example) the node will shrink and retract
    to the position of its parent node. */
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr('transform', function(d) { return 'translate(' + d.parent.y + ',' + d.parent.x + ')'; })

    nodeExit.select('circle')
        .attr('r', 1e-6);

    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
    },

};