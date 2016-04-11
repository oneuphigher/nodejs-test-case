'use strict';

var db = require('../models/db.js');
var User = require( '../models/user.model.js' );
var jwt = require( 'jsonwebtoken' );
var config = require( '../config' );

var transactionsController = require('../api/transactionsController.js');

exports.index = function( req, res ) {


    if(req.body.name == ''){

         res.render( 'login', {
                    invalid     : false,
                    register    : false,
                    login       : true,
                    status      : 'fail',
                    message     : 'Please enter username'
                   
                } );

    }
    else if(req.body.password == ''){

         res.render( 'login', {
                    invalid     : false,
                    register    : false,
                    login       : true,
                    status      : 'fail',
                    message     : 'Please enter password'
                } );

    }
    else{

        User.findUserByUsername(req.body.name,
                function(err, user) {
                
                 if ( err ) {
                    throw err;
                }

                if ( !user ) {
                    
                    res.render( 'login', {
                        invalid     : false,
                        register    : false,
                        login       : true,
                        status      : 'fail',
                        message     : 'Authentication failed. User not found.'
                       
                    } );
                }
                else if ( user ) {

                    User.compareUserPassword({
                        password        : user.password,
                        comparePassword : req.body.password
                        },
                      function( err, isMatch ) {
                        if ( err ) {
                            throw err;
                        }

                        if(!isMatch) {
                          
                            res.render( 'login', {
                                invalid     : false,
                                register    : false,
                                login       : true,
                                status      : 'fail',
                                message     : 'Authentication failed. Wrong password.'
                               
                            } );
                        }

                        // if user is found and password is right
                        // create a token
                        var token = jwt.sign( user, config.secret, {
                            expiresIn: 1440 // expires in 24 hours
                        } );

                        if(user.customer_id != null){
                            // return customer card number

                            var response = transactionsController.getCustomerCardNumber(user.customer_id);

                            response.then(function(next){

                                res.render( 'transactions', {
                                            customer_id : user.customer_id,
                                            cardNumber  : next.sources.data[0].last4,
                                            user_id     : user.id,
                                            token       : token,
                                            title       : 'Transactions Page',
                                            invalid     : false,
                                        } );
                            });

                        }
                        else{
                            res.render( 'transactions', {
                                customer_id : '',
                                user_id     : user.id,
                                token       : token,
                                title       : 'Transactions',
                                invalid     : false,
                            } );
                        }

                        
                    } );
                }

            });
    }

};

exports.register = function( req, res ) {

    console.log('in register action');

    if(req.body.name == ''){

         res.render( 'login', {
                    invalid     : false,
                    register    : true,
                    login       : false,
                    status      : 'fail',
                    message     : 'Please enter username'
                   
                } );

    }
    else if(req.body.password == ''){

         res.render( 'login', {
                    invalid     : false,
                    register    : true,
                    login       : false,
                    status      : 'fail',
                    message     : 'Please enter password'
                   
                } );

    }
    else{

        User.findUserByUsername(req.body.name,function( err, user ) {

            if ( err ) {
                throw err;
            }

            if ( user ) {
                
                res.render( 'login', {
                        invalid     : false,
                        register    : true,
                        login       : false,
                        status      : 'fail',
                        message     : 'Register failed. Username is already exist'
                       
                    } );
            }
            else {
                
                User.insertUser({
                        username : req.body.name,
                        password : req.body.password
                        },function( err, user ) {

                    if ( err ) {
                        
                        res.render( 'login', {
                            invalid     : false,
                            register    : true,
                            login       : false,
                            status      : 'fail',
                            message     : 'Register failed'
                           
                        } );
                        
                    }

                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign( user, config.secret, {
                        expiresIn: 1440 // expires in 24 hours
                    } );


                    // return the information including token as JSON
                    res.render( 'transactions', {
                        customer_id : '',
                        user_id     : user.id,
                        token       : token,
                        title       : 'Transactions Page',
                        invalid     : false,
                    } );

                } );

            }

        } );
    }
};
