'use strict';

var mongoose = require( 'mongoose' );
var config = require( '../config' );


var cardsSchema = mongoose.Schema( {
    customerId: String,
    cardFingerprint: String,
    cardId: String
} );

var Cards = mongoose.model( 'Cards', cardsSchema );

module.exports = Cards;
