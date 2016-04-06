'use strict';

var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var transactionSchema = new Schema( {
    transactionId: String,
    amount: Number,
    created: Number,
    currency: String,
    description: String,
    paid: Boolean,
    sourceId: String
} );

var Transaction = mongoose.model( 'Transaction', transactionSchema );

module.exports = Transaction;
