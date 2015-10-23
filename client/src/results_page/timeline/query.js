var Timeline = require('./treetimeline.jsx');

module.exports = {

  //Api's to be called are listed in this array
  apis: [
    'nyt',
    // 'twitter',
    'youtube',
    // 'news'
  ],

  processResponse: function(response, previousState, currentProps) {

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

    return previousApiData;
  },

};