'use strict';

var Transactions = require( '../models/transactions.model.js' );
var config = require( '../config' );
var Stripe = require( 'stripe' )( config.stripeApiKey );
var User = require( '../models/user.model.js' );
var transactionController = require( '../api/transactionsController.js' );

exports.index = function( req, res, next ) {
    if ( req.body ) {
        var transaction = new Transactions( {
            name: req.body.name
        } );
        transaction.save( function( err, trans ) {
            if ( err ) {
                return console.log( err );
            }
            res.status( 200 ).end();
        } );
    }
};

exports.createProfileWithTransaction = function( req, res, next ) {

	var cardnumber = req.body.customerid;
	var cardexpirymonth = req.body.cardexpirymonth;
	var cardexpiryyear = req.body.cardexpiryyear;
	var cvc = req.body.cvc;
	var email = req.body.username;
	
	Stripe.customers.create({
		card : {
			number : cardnumber,
			exp_month : cardexpirymonth,
			exp_year : cardexpiryyear,
			cvc : cvc
		},
		email : email,
		description : 'payinguser@example.com'
	}, function(err, customer) {
		if (err) {
			return res.status(500);
		}
		Stripe.charges.create( {
	        amount: req.body.amount,
	        currency: req.body.currency,
	        customer : customer.id
	    }, function( err, charge ) {
	    	if (err) {
				return res.status(500);
			}
			User.findOne({ name : email}, function (err, users){
				users.customerId = customer.id;
				users.save(function (err){	
					if (err) {
						return res.status(500);
					}
				});
			});
	        var transaction = new Transactions( {
	            transactionId: charge.id,
	            amount: charge.amount,
	            created: charge.created,
	            currency: charge.currency,
	            description: charge.description,
	            paid: charge.paid,
	            sourceId: charge.source.id
	        } );
	        transaction.save( function( err ) {
	                if ( err ) {
	                    return res.status( 500 );
	                }
	                else {
	                    res.status( 200 ).json( {
	                        message: 'Payment is created.'
	                    } );
	                }
	            } );
	            // asynchronously called
	    } );
	});
};

exports.createTransaction = function( req, res, next ) {

//	var cardnumber = req.body.customerid;
//	var cardexpirymonth = req.body.cardexpirymonth;
//	var cardexpiryyear = req.body.cardexpiryyear;
//	var cvc = req.body.cvc;
	var email = req.body.username;
	var customerId = req.body.customerProfileId;	
	if(!customerId) { 
		transactionController.createProfileWithTransaction(req, res, next);
	}else {
		Stripe.charges.create( {
	        amount: req.body.amount,
	        currency: req.body.currency,
	        customer : customerId
	    }, function( err, charge ) {
	        if ( err ) {
	            return console.log( err );
	        }		
	        var transaction = new Transactions( {
	            transactionId: charge.id,
	            amount: charge.amount,
	            created: charge.created,
	            currency: charge.currency,
	            description: charge.description,
	            paid: charge.paid,
	            sourceId: charge.source.id
	        } );
	        transaction.save( function( err ) {
	                if ( err ) {
	                    return res.status( 500 );
	                }
	                else {
	                    res.status( 200 ).json( {
	                        message: 'Payment is created.'
	                    } );
	                }
	            } );
	            // asynchronously called
	    } );
	}
};
