var pg = require('pg');
var bcrypt = require('bcrypt-nodejs');
var apiError = require('../api/api-error');

// var DATABASE_URL = "postgresql://postgres:123@localhost:5432/nodejsdb";
var DATABASE_URL = "postgres://xiystwsmxpidio:AqJXa8jncBSobmDE0WP_dvOrEu@ec2-23-21-255-14.compute-1.amazonaws.com:5432/d6lr9gagheu6rn";

exports.query = function(sql, params, cb) {

  pg.connect(DATABASE_URL, function(err, client, done) {
    if (err) { 
      done(); 
      cb(err);
      return;
    }
    client.query(sql, params, cb);
  });
}
