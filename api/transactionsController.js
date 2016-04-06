'use strict';

var Transaction = require( '../models/transaction.model.js' );
var config = require( '../config' );
var stripe = require( 'stripe' )( config.stripe.secretKey );

exports.index = function( req, res, next ) {
    if ( req.body ) {
        var transaction = new Transaction( {
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

exports.createTransaction = function( req, res, next ) {
    var user = req.user;
    var stripeToken = req.body.stripeToken;

    if (!stripeToken) {
        if (!user.stripe.customerId) {
            return res.status( 400 ).json( {
                message: 'Please provide a valid card.'
            } );
        }

        chargeAndSaveTransaction()
    } else {
        user.setCard(stripeToken, function (err) {
            if (err) {
                if (err.code && err.code == 'card_declined') {
                    return res.status( err.code ).json( {
                        message: 'Your card was declined. Please provide a valid card.'
                    } );
                }

                return res.status( err.statusCode ).json( {
                    message: 'An unexpected error occurred.'
                } );
            }

            chargeAndSaveTransaction()
        } );
    }

    function chargeAndSaveTransaction () {
        user.charge(req.body.amount, req.body.currency, 'payment from ' + user.email, function (err, charge) {
            if (err) {
                return res.status( err.statusCode ).json( {
                    message: 'An unexpected error occurred while charing.'
                } );
            }

            var transaction = new Transaction( {
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
                    return res.status( 500 ).json( {
                        message: 'Transaction created but not saved'
                    } );
                }
                else {
                    res.status( 200 ).json( {
                        message: 'Transaction created.'
                    } );
                }
            } );
        } )
    }
};
