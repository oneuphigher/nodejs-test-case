'use strict';

var User = require( '../models/user.model.js' );
var jwt = require( 'jsonwebtoken' );
var config = require( '../config' );

var Stripe = require( 'stripe' )( config.stripeApiKey );


exports.index = function( req, res ) {

    // find the user
    User.findOne( {
        name: req.body.name
    }, function( err, user ) {

        if ( err ) {
            throw err;
        }

        if ( !user ) {
            res.json( {
                success: false,
                message: 'Authentication failed. User not found.'
            } );
        }
        else if ( user ) {
            user.comparePassword( req.body.password, function( err, isMatch ) {
                if ( err ) {
                    throw err;
                }

                if(!isMatch) {
                    return res.status( 401 ).json( {
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    } );
                }

                // if user is found and password is right
                // create a token
                var token = jwt.sign( user, config.secret, {
                    expiresIn: 1440 // expires in 24 hours
                } );

                if(user.customerId != null){
                    Stripe.customers.listCards(user.customerId, function(err, cards) {
                        if ( err ) {
                            return console.log( err );
                        }

                        res.render( 'transactions', {
                            token: token,
                            cards: cards,
                            title: 'Transactions Page'
                        } );
                    });
                }
                else{
                    res.render( 'transactions', {
                        token: token,
                        title: 'Transactions Page'
                    } );
                }

            } );
        }

    } );
};

exports.register = function( req, res ) {

    // find the user
    User.findOne( {
        name: req.body.name
    }, function( err, user ) {

        if ( err ) {
            throw err;
        }

        if ( user ) {
            res.json( {
                success: false,
                message: 'Register failed. Username is not free'
            } );
        }
        else {
            user = new User( {
                name: req.body.name,
                password: req.body.password
            } );
            user.save( function( err ) {
                if ( err ) {
                    return res.status( 500 ).json( {
                        success: false,
                        message: 'Registration failed'
                    } );
                }

                // if user is found and password is right
                // create a token
                var token = jwt.sign( user, config.secret, {
                    expiresIn: 1440 // expires in 24 hours
                } );

                // return the information including token as JSON
                res.render( 'transactions', {
                    token: token,
                    title: 'Transactions Page'
                } );
            } );
        }

    } );
};
