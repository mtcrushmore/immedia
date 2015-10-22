var Timeline = require('./treetimeline.jsx');

module.exports = {

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

  handleQuery: function(searchQuery){
    var component = Timeline;

    $.post(searchQuery.url, searchQuery)
     .done(function(response) {

        if(typeof response === 'string') return;

        Timeline.renderCount++;

        console.log(Timeline);
        // Set State to initiate a re-rendering based on new API call data
        Timeline.setState(function(previousState, currentProps) {
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

};