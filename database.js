
const mysql = require('mysql');

var connection = mysql.createConnection({
    //properties...
    host: 'localhost',
    user: 'root',
    password:'admin',
    database:'googletrends'

});

connection.connect(function(error){
    if(error){
        console.log('Error');
    }else{
        console.log('Database Connected');
    }
});

connection.end = function(error){
    if(error) throw error;
    else console.log("Connection Closed");
};

module.exports =   connection  ;


