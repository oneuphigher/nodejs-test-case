'use strict';

var bcrypt = require('bcrypt-nodejs');
var config = require( '../config' );
var apiError = require('../api/api-error');
var db = require('../models/db.js');


// returns user object if found, else returns undefined
exports.findUserByUsername = function(username, cb) {

  var sql = `
    SELECT *
    FROM users
    WHERE username = $1
  `;

  db.query(sql, [username], function(err, result) {
    if (err){
     return cb(err);
    }
    cb(null, result.rows[0]);
  });
};

// returns user object if found, else returns undefined
exports.findUserById = function(id, cb) {
  var sql = `
    SELECT *
    FROM users
    WHERE id = $1
  `;

  db.query(sql, [id], function(err, result) {
    if (err) return cb(err);
    cb(null, result.rows[0]);
  });
};


// update customer id in users
exports.updateUsersCustomerId = function(data, cb) {
  var sql = `
    UPDATE users SET customer_id = $2 WHERE id = $1;
  `;

  db.query(sql, [data.id,data.customer_id], function(err, result) {
    if (err) return cb(err);
    cb(null, result.rows[0]);
  });
};

// returns created user object
exports.insertUser = function(data, cb) {
  var sql = `
    INSERT INTO users(username, password)
    VALUES ($1, $2)
    RETURNING *  -- tells postgres to return the created user record to us
  `;

  // generate a salt
    bcrypt.genSalt(10, function(err, salt) {
        if (err) {
            return next(new apiError.Misconfigured('Failed to generate salt','salt_generation_error',err));
        }

        // hash the password using our new salt
        bcrypt.hash(data.password, salt, null,function(err, hash) {
            if (err) {
                return next(new apiError.Misconfigured('Failed to hash password salt','password_hashing_error',err));
            }

            // override the cleartext password with the hashed one
            
            db.query(sql, [data.username, hash], function(err, result) {
              if (err) return cb(err);
              cb(null, result.rows[0]);
            });
        });
    });


};

// returns compare passoword with hash
exports.compareUserPassword = function(data, cb) {
   

    bcrypt.compare(data.comparePassword, data.password, function(err, isMatch) {
        if (err) {
            return cb(new apiError.Misconfigured('Failed to check password hash','password_hash_check_error',err));
        }
        cb(null, isMatch);
    });

};