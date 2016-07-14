'use strict';

var Transactions = require( '../models/transactions.model.js' );
var Cards = require( '../models/cards.model.js' );
var User = require( '../models/user.model.js' );

var config = require( '../config' );
var Stripe = require( 'stripe' )( config.stripeApiKey );

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

exports.createTransaction = function( req, res, next ) {

    if(req.body.storedCardId && req.body.storedCardId != null){
        Stripe.charges.create({
            amount: req.body.amount, // amount in cents, again
            currency: req.body.currency,
            card: req.body.storedCardId,
            customer: req.decoded._doc.customerId,
            description: req.decoded._doc.name+'- Charge From existingcard'
        }, function(err, charge){
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
        });

    }
    else{

        if(req.decoded._doc.customerId != undefined){


            Stripe.tokens.retrieve(
              req.body.token,
              function(err, token) {
                Cards.findOne({
                  cardFingerprint: token.card.fingerprint,
                  customerId: req.decoded._doc.customerId
                }, function(err, cardDetails){
                    if ( err ) {
                        return console.log( err );
                    }

                    if(cardDetails){
                        Stripe.charges.create({
                            amount: req.body.amount, // amount in cents, again
                            currency: req.body.currency,
                            card: cardDetails.cardId,
                            customer: req.decoded._doc.customerId,
                            description: req.decoded._doc.name+'- Charge From existingcard'
                        }, function(err, charge){
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
                        });
                    }
                    else{

                        Stripe.customers.createSource(req.decoded._doc.customerId, {
                          source: req.body.token
                        },function(err, card) {
                            if ( err ) {
                                return console.log( err );
                            }

                            var cardObj = new Cards({
                                customerId: req.decoded._doc.customerId,
                                cardFingerprint: card.fingerprint,
                                cardId: card.id
                            });

                            cardObj.save();

                            Stripe.charges.create({
                                amount: req.body.amount, // amount in cents, again
                                currency: req.body.currency,
                                card: card.id,
                                customer: req.decoded._doc.customerId,
                                description: req.decoded._doc.name+'- Charge From newcard'
                            }, function(err, charge){
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
                            });
                        });
                    }

                });
              }
            );            
        }
        else{

            Stripe.customers.create({
                source: req.body.token,
                description: req.decoded._doc.name+'- Charge From newcard and customer'
            }, function(err, customer) {
                if ( err ) {
                    return console.log( err );
                }
                
                User.update({
                  "_id": req.decoded._doc._id
                },
                {
                  $set: {
                    customerId: customer.id
                  }
                }, function(err, result){
                    console.log(err);
                });

                Stripe.tokens.retrieve(
                  req.body.token,
                  function(err, token) {
                    var card = new Cards({
                        customerId: customer.id,
                        cardFingerprint: token.card.fingerprint,
                        cardId: token.card.id
                    });

                    card.save();
                  }
                );

                Stripe.charges.create({
                    amount: req.body.amount, // amount in cents, again
                    currency: req.body.currency,
                    customer: customer.id
                }, function(err, charge){
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
                });
            });
        }
    }

    /*Stripe.charges.create( {
        amount: req.body.amount,
        currency: req.body.currency,
        source: req.body.token,
        description: 'Charge for test@example.com'
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
    } );*/
};
