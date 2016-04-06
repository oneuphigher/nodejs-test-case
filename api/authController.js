'use strict';

var User = require( '../models/user.model.js' );
var jwt = require( 'jsonwebtoken' );
var config = require( '../config' );

exports.index = function( req, res ) {

    // find the user
    User.findOne( {
        email: req.body.email
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

                req.user = user;
                return renderTranactions(req, res);
            } );
        }

    } );
};

exports.register = function( req, res ) {

    // find the user
    User.findOne( {
        email: req.body.email
    }, function( err, user ) {

        if ( err ) {
            throw err;
        }

        if ( user ) {
            res.json( {
                success: false,
                message: 'Register failed. Email already taken'
            } );
        }
        else {
            user = new User( {
                email: req.body.email,
                password: req.body.password
            } );
            user.save( function( err ) {
                if ( err ) {
                    return res.status( 500 ).json( {
                        success: false,
                        message: 'Registration failed'
                    } );
                }

                req.user = user;
                return renderTranactions(req, res);
            } );
        }

    } );
};

function renderTranactions (req, res) {
    var user = req.user;
    var token = jwt.sign( { id: user._id }, config.secret, {
        expiresIn: 1440 // expires in 24 hours
    } );

    // return the information including token as JSON
    res.render( 'transactions', {
        token: token,
        user: user,
        title: 'Transactions Page'
    } );
}
