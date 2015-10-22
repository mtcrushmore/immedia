/*
    file: treetimeline.jsx
    - - - - - - - - - - - - - 
    An embedded D3 canvas that exists as
    a standalone React component. This component
    is responsible for kicking off all external
    AJAX calls that populate immedia. It maintains
    in its state an array of all the APIs data so 
    that the timeline can be re-rendered when the
    asynchronous calls return at different times.

    As such, the D3 canvas' data directive is populated
    by the data maintained in state.
 */

// Required node modules
var React = require('react');

// React StyleSheet styling
var styles = require('../../styles/results_page/treetimeline.jsx');
var helpers = require('./helpers.js');
var query = require('./query.js');
var dates = require('./dates.js');

var Nodes = require('./nodes.js');
var Links = require('./links.js');
var Axis = require('./axis.js');
var Images = require('./images.js');


var TreeTimeLine = React.createClass({

  getInitialState: function(){
    
  //Initial timespan set at one week
  return {
      startTime: 0,
      endTime: 7,
      apiData: [],
      width: this.props.window.width,
      height: this.props.window.height,
    };
  },

  //Api's to be called are listed in this array
  apis: [
    'nyt',
    // 'twitter',
    'youtube',
    // 'news'
  ],

  //Rendering the timeline will start a query for a search term passed down from the results page.
  query: function(searchTerm){
    
    for(var i = 0; i < this.apis.length; i++){
      this.handleQuery({
        searchTerm: searchTerm.replace(/\s\(.*$/,''),
        days: 30,
        url: 'http://localhost:3000/api/' + this.apis[i],
        api: this.apis[i]
      });
    }
  },

  componentDidMount: function(){
    this.query(this.props.searchTerm.toLowerCase());
  },

  componentDidUpdate: function() {
    this.renderCanvas(0, 6, 1);    // Crucial step that (re-)renders D3 canvas
    this.renderCanvas(7, 13, 2);
    this.renderCanvas(14, 20, 3);
    this.renderCanvas(21, 28, 4);
  },

  componentWillReceiveProps: function(newProps){
    
    //If the new search term matches the term queried for the current results, nothing will change.
    if (this.props.searchTerm !== newProps.searchTerm) {
      helpers.renderCount = 0;
      this.query(newProps.searchTerm.toLowerCase());
      this.setState({apiData: []});
    }

    this.setState({
      width: newProps.window.width,
      height: newProps.window.height,
    });
  },

  handleQuery: function(searchQuery){
    var component = this;

    $.post(searchQuery.url, searchQuery)
     .done(function(response) {

        if(typeof response === 'string') return;

        helpers.renderCount++;

        // Set State to initiate a re-rendering based on new API call data
        this.setState(function(previousState, currentProps) {
          // Make a copy of previous apiData to mutate and use to reset State
          var previousApiData = previousState['apiData'].slice();
          // Data is structured in an array that corresponds to sorted order by date descending
          // where each index has the following object:
          /*
              {
                'date': 'YYYY-MM-DD',
                'children': [
                  {
                    'source': 'nyt',
                    'children': [ {Article 1}, {Article 2}]
                  }
                ]
              }
          */

          // Loop through each day in apiData and add new articles/videos/etc
          // from returning API appropriately
          for(var date in response) {
            var i = 0;
            for(; i < previousApiData.length; i++) {
              if(previousApiData[i]['date'] === date) {
                previousApiData[i]['children'].push(response[date]);
                break;
              }
            }
            // If loop terminates fully, no content exists for date
            // so add content to the State array
            if(i === previousApiData.length) {
              previousApiData.push(
                {
                  'date': date, 
                  'children': [
                    response[date]
                  ]
                });
            }
          }
          // Sort State array with API data by date descending
          previousApiData.sort(function(a, b) {
            var aDate = new Date(a['date']);
            var bDate = new Date(b['date']);
            return bDate - aDate;
          });
          return {apiData: previousApiData};
        });
     }.bind(this));
  },

  render: function() {
    this.getDynamicStyles();

    return (
      <div id="d3container" style={styles.container}>
        <div id="d3blocker" style={styles.block}>
          <div id="d3title" style={styles.title}>recent events</div>
          <div id="d3subhead" style={styles.subhead}>hover over a bubble to preview</div>
        </div>
        <div id="d3canvas1" style={styles.d3} />
        <div id="d3canvas2" />
        <div id="d3canvas3" />
        <div id="d3canvas4" />
      </div>
    );
  },

  getDynamicStyles: function() {
    styles.container.left = (this.state.width - 1350 > 0 ? (this.state.width - 1350) / 2 : 0) + 'px';
    styles.container.width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 20 + 'px';
    styles.container.height = (this.state.height - 50) + 'px';
    styles.block.width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 10 + 'px';
    styles.title.width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 'px';
    styles.subhead.width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 'px';
    styles.d3.width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 20 + 'px';
    return;
  },

  mouseOver: function(item) {
    if (this.mousedOver === item) {
      return;
    } else {
      this.mousedOver = item;
    }

    item.hasOwnProperty('tweet_id_str') ? item.tweet_id = item.tweet_id_str : '';

    this.props.mouseOver({
        title: item.title,
        date: item.date,
        url: item.url,
        img: item.img,
        source: item.parent.source,
        id: item.id,
        tweetId: (item.hasOwnProperty('tweet_id_str') ? item.tweet_id_str : ''),
        byline: (item.hasOwnProperty('byline') ? item.byline : ''),
        videoId: (item.hasOwnProperty('videoId') ? item.videoId : ''),
        abstract: (item.hasOwnProperty('abstract') ? item.abstract : ''),
        height: (item.hasOwnProperty('height') ? item.height : ''),
        width: (item.hasOwnProperty('width') ? item.width : ''),
      });
  },

  renderCanvas: function(startDay, endDay, canvas) {

    dates.generateDates(startDay, endDay, canvas);
    
    var component = this;

    /* When re-rendering, old canvases are removed so the new canvas can take its place ... if the canvas is not
    removed before re-rendering, the next canvas will be appended to the div alongside the previous canvas. This 
    creates a very messy situation. */
    d3.select('#d3canvas' + canvas).selectAll('svg').remove();


    var margin = {
      top: 10,
      right: 40,
      bottom: 20,
      left: 40
    };

    var width = (this.state.width - 1350 < 0 ? 350 * (this.state.width/1350) : 350) + 20,
        height = this.state.height - 20;

    var componentWidth = this.state.width;
    var componentHeight = this.state.height;

    var oldestItem = this.state.apiData[this.state.apiData.length - 1] ? 
                      this.state.apiData[this.state.apiData.length - 1] : null;

    /* Because each canvas represents one week in time, only data dated within that week's time period
    will be included and rendered on the canvas */
    var canvasData = helpers.processCanvasData(canvas, this.state.apiData);


    /* The new canvas will append to the proper d3canvas element on the page. If canvas is equal to 1, for example,
    the canvas will be rendered on #d3canvas1 and represents the most current week of data. Canvas 2 represents the previous
    week, and so on. */
    var svg = d3.select('#d3canvas' + canvas).append('svg')
      .attr('class', 'svgclass' + canvas)
      .attr('class', 'timeLine')
      .attr('width', width)
      .attr('height', this.state.height)
      .append('g')
      .attr('transform', 'translate(60, ' + margin.top + ')');

    /* Create a vertical D3 time scale, organized by day in descending order based on the 7-day period of dates
    generated by the component's generatedates function (dates are stored in the component's date property) */
    var y = d3.time.scale()
      .domain([new Date(dates.dates[canvas][dates.dates[canvas].length - 1]), new Date(dates.dates[canvas][0])])
      .rangeRound([height - margin.bottom, canvas === 1 ? 80 : 40])

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .ticks(d3.time.days, 1)
      .tickFormat(d3.time.format('%a %d'))
      .tickSize(10)
      .tickPadding(10);

    svg.append('g')
      .attr('class', 'yAxis')
      .attr({
        'font-family': 'Nunito',
        'font-size': 10 * (this.state.width / 1350) + 'px',
      })
      .attr({
        fill: 'none',
        stroke: '#000',
        'shape-rendering': 'crispEdges',
      })
      .call(yAxis);


    /* Time to create a D3 tree layout structure with diagonal projections between parent and child nodes */
    var tree = d3.layout.tree()
        .size([height, width])

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; })


    /* The all-important root is the source of data from which all child data nodes will project. */
    var root = { 'name': 'data', 'children': canvasData };

    
    /* When all data has been loaded, toggle the nodes so that only the first two days of each week
    will be expanded (the other days are collapsed). This makes the canvas less crowded. */
    if (helpers.renderCount === this.apis.length) {
      root.children.forEach(helpers.toggle);
      helpers.toggle(root.children[0]);
      helpers.toggle(root.children[1]);
    }

    update(root, canvas);


    /* The update function tells D3 how to render the new canvas any time new data is entered or 
    mouse events occur. */
    function update(root, canvas) {

      var duration = 500;
      // var duration = function(d) {
      //   if (d.rendered < component.apis.length) {
      //     d.rendered++;
      //     return 0;
      //   } else if (!d.rendered) {
      //     d.rendered = 1;
      //   }
      //   return 500;
      // }

      /* Nodes and links will be arranged in arrays for reference and when D3 needs to iterate through them
      to assign positions, attributes, etc. */
      var nodes = tree.nodes(root).reverse();
      var links = tree.links(nodes);

      var defs = Images.appendImages(svg);

      Nodes.describeNodes(svg, componentWidth, y, nodes, defs);

      Links.describeLinks(svg, tree, nodes, diagonal);

      //Update nodes.
      var node = svg.selectAll('g.node')
        .on('click', function(d) {
          if (d.url) { 
            window.open(d.url,'_blank');
            return;
          } else if (d.parent.source === 'youtube') {
            window.open('https://www.youtube.com/watch?v=' + d.videoId, '_blank');
            return;
          }
          helpers.toggle(d); 
          update(root, canvas); 
        })
        .on('mouseenter', function(d) {
          console.log(d);
          d3.select(this).select('circle')
            .style({
              stroke: 'blue',
              strokeWidth: 1.5 + 'px',
            })
          if (d.depth === 3) {
            component.mouseOver(d);
          }
        })
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
    }
 
    /* On first render, automatically preview the most recent item by mimicking a mouseOver event. */
    if (canvas === 1 && canvasData[0] && canvasData[0].children[0]) {this.mouseOver(canvasData[0].children[0].children[0])}
  },
});

module.exports = TreeTimeLine; 


