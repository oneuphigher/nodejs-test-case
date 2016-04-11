'use strict';

var User = require( '../models/user.model.js' );
var Transactions = require( '../models/transactions.model.js' );
var config = require( '../config' );
var Stripe = require( 'stripe' )( config.stripeApiKey );
var db = require('../models/db.js');

exports.getCustomerCardNumber = function(req,res){

    var cardNumber;

    var customer = Stripe.customers.retrieve(req);

    return customer;
}

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

    if(req.body.customer_id == ''){

        Stripe.customers.create({
              source: req.body.stripeToken,
              description: 'payinguser@example.com'
            }).then(function(customer) {
              return Stripe.charges.create({
                amount: req.body.amount, // amount in cents, again
                currency: "usd",
                customer: customer.id
              });
            }).then(function(charge) {
              // YOUR CODE: Save the customer ID and other info in a database for later!
                var condition = {id : req.body.user_id};

                var update = {customer_id : charge.source.customer};

                User.updateUsersCustomerId({
                            id          : req.body.user_id,
                            customer_id : charge.source.customer
                            },
                            function( err, doc ) {

                            if(err){
                                return res.status( 200 ).json( {
                                                        message: err.message,
                                                        status : 'fail'
                                                    } );
                            }
                            else{
                            
                                Transactions.insertTrasaction({
                                        transactionId: charge.id,
                                        amount: charge.amount,
                                        created: charge.created,
                                        currency: charge.currency,
                                        description: charge.description,
                                        paid: charge.paid,
                                        sourceId: charge.source.id,
                                        customer:charge.source.customer,
                                        user_id :req.body.user_id
                                },
                                function( err ) {
                                    if ( err ) {
                                        return res.status( 200 ).json( {
                                                    message: err.message,
                                                    status : 'fail'
                                                } );
                                    }
                                    else {
                                        res.status( 200 ).json( {
                                            message: 'Payment method added successfully and pyament executed successfully',
                                            status : 'success'
                                        } );
                                    }
                                } );

                            }
           
                });

        });

    }
    else{

           Stripe.charges.create( {
                amount: req.body.amount, // amount in cents, again
                currency: "usd",
                customer: req.body.customer_id
            }, function( err, charge ) {
                console.log('error :'+err)
                if ( err ) {
                    // return console.log( err );
                    return res.status( 200 ).json( {
                                message: err.message,
                                status : 'fail'
                            } );
                }
                 Transactions.insertTrasaction({
                                        transactionId: charge.id,
                                        amount: charge.amount,
                                        created: charge.created,
                                        currency: charge.currency,
                                        description: charge.description,
                                        paid: charge.paid,
                                        sourceId: charge.source.id,
                                        customer:charge.source.customer,
                                        user_id :req.body.user_id
                                },
                                function( err ) {
                                    if ( err ) {
                                        // return res.status( 500 );
                                        return res.status( 200 ).json( {
                                                    message: err.message,
                                                    status : 'fail'
                                                } );
                                    }
                                    else {
                                        res.status( 200 ).json( {
                                            message: 'Payment executed successfully.',
                                            status : 'success'
                                        } );
                                    }
                                } );
                // asynchronously called
            });

    }

};
