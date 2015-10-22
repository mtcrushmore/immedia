var Timeline = require('./treetimeline.jsx');

module.exports = {

  describeLinks: function(svg, tree, nodes, diagonal) {
    /* Links have both a source and target based on node's ID's */
    var link = svg.selectAll('path.link')
        .data(tree.links(nodes), function(d) { return d.target.id; })

    link.enter().insert('svg:path', 'g')
        .attr('class', 'link')
        .attr('d', function(d) {
          var origin = { x: d.source.x0, y: d.source.y0 };
          return diagonal({ source: origin, target: origin });
        })
        .style({
          fill: 'none',
          strokeWidth: '1.5px',
        })
        //The links from the hidden root node to the nodes on the timeline will not show.
        .style('stroke', function(d) {
          if (d.target.depth === 1) { return 'white'; }
          else { return '#ccc'; };
        })

    link.transition()
        .duration(500)
        .attr('d', diagonal);

    /* On exit, links will retract to the position of their source node */
    link.exit().transition()
        .duration(500)
        .attr('d', function(d) {
          var origin = {x: d.source.x, y: d.source.y};
          return diagonal({source: origin, target: origin});
        })
        .remove();
  }

};