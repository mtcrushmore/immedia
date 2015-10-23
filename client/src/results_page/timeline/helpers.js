var Timeline = require('./treetimeline.jsx');
var dates = require('./dates.js');

module.exports = {

  idCounter: 0,

  renderCount: 0,

  processCanvasData: function(canvas, data) {
    var canvasData = [];
    for (var i = 0; i < data.length; i++) {
      // if (i === startDay - 1) { continue; }
      if (dates.dates[canvas].indexOf(data[i].date) !== -1) {
        canvasData.push(data[i]);
      }
    };
    return canvasData;
  },

  /* The toggle function hides a node's children from D3 so that the children are not rendered.
  This way, nodes can appear and exit when certain click events occur and the canvas re-renders. */
  toggle: function(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
  },

  mouseOver: function(item) {
    if (this.mousedOver === item) {
      return;
    } else {
      this.mousedOver = item;
    }

    item.hasOwnProperty('tweet_id_str') ? item.tweet_id = item.tweet_id_str : '';

    return {
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
      };
  },

};