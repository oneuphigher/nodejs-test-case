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
                
                if(user.customerId) {                	
                	Stripe.customers.retrieve(user.customerId, function(err, customer) {
                		// return the information including token as JSON
                        res.render( 'newtransactions', {
                            token: token,
                            username: user.name,
                            title: 'Transactions Page',
                            customerProfileId: user.customerId,
                            custcardexpirymonth : customer.sources.data[0].exp_month,
                            custcardexpiryyear: customer.sources.data[0].exp_year,
                            customerCardId:'************'+customer.sources.data[0].last4
                        } );
                	}
                	);
                                    	
                }else {
                    // return the information including token as JSON
                    res.render( 'newtransactions', {
                        token: token,
                        username: user.name,  
                        title: 'Transactions Page',                      
                        customerProfileId: '',
                        custcardexpirymonth : '',
                        custcardexpiryyear: '',
                        customerCardId:''
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
                res.render( 'newtransactions', {
                    token: token,
                    username: user.name,
                    title: 'Transactions Page',                   
                    customerProfileId: '',
                    custcardexpirymonth : '',
                    custcardexpiryyear: '',
                    customerCardId:''
                } );
            } );
        }

    } );
};
