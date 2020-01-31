const googleTrends = require('google-trends-api');
const schedule = require('node-schedule');

var databaseConnection = require('./database');

function executeGoogleAPI(nation){
  googleTrends.dailyTrends({
    geo: nation
  }, async function(err, results) {
    if (err) {
        console.log(err);
        
    }else{
        var parsedJson =  JSON.parse(results);
        var googleOnject = parsedJson.default;
        var trendSearchesDay,trendingSearches, formattedDate, trendSearchesDays = googleOnject.trendingSearchesDays;

        for(var i = 0;  trendSearchesDay = trendSearchesDays[i]; i++){
            
            formattedDate = trendSearchesDay.formattedDate; // Date
            trendingSearches = trendSearchesDay.trendingSearches; // Array []

            for(var j = 0, k = 1; trendingSearches[j]; j++, k++){
              var databaseHandler = {
                nationQuery: nation,
                titleQuery : trendingSearches[j].title.query,
                formattedDateQuery: formattedDate,
                formattedTraffic: 
                trendingSearches[j].formattedTraffic
              }
              //--------------------------
              let compareresult = await CompareOperation(databaseConnection, databaseHandler)
              
              //--------------------------
              databaseOperation(databaseConnection,databaseHandler);
            }
        }
        results = JSON.stringify(parsedJson);
        googleResults = results;
      
    }
  });
}

function databaseOperation(databaseConnection,databaseHandler){
  databaseConnection.query(`INSERT INTO ${databaseHandler.nationQuery} (formattedDate,title,traffic) 
  VALUES(
    '${databaseHandler.formattedDateQuery}',
    "${databaseHandler.titleQuery}",
    '${databaseHandler.formattedTraffic}'
    )`, function(error, rows, fields ){
    if(error){
        console.log('Error in the query' + error);
    } else {
        
    }
  });
}

InsertOperation = (databaseConnection,databaseHandler) => {
  return new Promise((resolve) => {
    databaseConnection.query(`INSERT INTO ${databaseHandler.nationQuery} (formattedDate,title,traffic) 
    VALUES(
    '${databaseHandler.formattedDateQuery}',
    "${databaseHandler.titleQuery}",
    '${databaseHandler.formattedTraffic}'
    )`, function(error, rows, fields ){
    if(error){
        console.log('Error in the query' + error);
        resolve(error)
    }
    resolve(null)
  });
  })
}

// 0 kein identischer Datensatz; 1: gleiche traffic; 2: andere Traffic, New Error (instanceof)
// 0 => insert
// 1 => nichts
// 2 => update
CompareOperation = (databaseConnection, databaseHandler) => {
  return new Promise((resolve) => {
    databaseConnection.query(`Select traffic From 
    ${databaseHandler.nationQuery}
    Where 
    formattedDate = '${databaseHandler.formattedDateQuery}' AND
    title = "${databaseHandler.titleQuery}" LIMIT 1`, function(error, rows, fields ){
      if(error){
        console.log('Error in the query' + error);
        resolve(error)
    }
      if (rows[0].traffic.length === 0) {
        resolve(0)
      }
      resolve(rows[0].traffic === databaseHandler.formattedTraffic? 1:2)
  });
  })
}

UpdateOperation = (databaseConnection, databaseHandler) => {
  return new Promise((resolve) => {
    databaseConnection.query(`Update ${databaseHandler.nationQuery} SET 
      traffic='${databaseHandler.formattedTraffic}' WHERE
      formmatedDate='${databaseHandler.formattedDateQuery}' AND
      title = "${databaseHandler.titleQuery}"
    `, function(error) {
      resolve(error? error : null)
    })
  })
}




var j = schedule.scheduleJob('*/5 * * * *', function(){
  executeGoogleAPI('DE');
  executeGoogleAPI('US');

  console.log("Datenbankoperation wurde ausgeführt" + new Date);
});

