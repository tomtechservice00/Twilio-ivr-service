const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = 'twilio.db';

const db = new sqlite3.Database(DBSOURCE, {fileMustExist: true}, (err) => {
    if (err) {
      // Cannot open database
      console.log('error');
      throw err;
    }else{
        console.log('Connected to the SQLite database.');
    }
});

module.exports = db;

