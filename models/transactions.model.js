'use strict';

var config = require( '../config' );
var db = require('../models/db.js');

// returns user object if found, else returns undefined
exports.insertTrasaction = function(data, cb) {
  var sql = `
    INSERT INTO transactions(transactionId, amount,created,currency,description,paid,sourceId,customer,user_id)
    VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *  -- tells postgres to return the created user record to us
  `;

  db.query(sql, [data.transactionId,data.amount,data.created,data.currency,data.description,data.paid,data.sourceId,data.customer,data.user_id], function(err, result) {
    if (err) return cb(err);
    cb(null, result.rows[0]);
  });
};