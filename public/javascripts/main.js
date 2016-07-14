'use strict';

/*global Stripe:true*/
/*global $form:true*/

//set Public key for Stripe payments
Stripe.setPublishableKey( 'pk_test_RLgv5fAUAEVEzsgEsOFod9OM' );
var isSubmit = false;
$( document ).ready( function() {

    $(".payment-errors").hide();

    $( '#submittransaction' ).click( function() {
        console.log( 'ok' );
        if ( !isSubmit ) {     

            if($("#card-select").val() == '' || $("#card-select").val() == undefined){
                Stripe.card.createToken( {
                    number: $( '.card-number' ).val(),
                    cvc: $( '.card-cvc' ).val(),
                    exp_month: $( '.card-expiry-month' ).val(),
                    exp_year: $( '.card-expiry-year' ).val()
                }, function( status, response ) {
                    if ( response.error ) {
                        // Show the errors on the form
                        $( '.payment-errors' ).text( response.error.message );
                        $('.payment-errors').show();
                    }
                    else {
                        // response contains id and card, which contains additional card details
                        var token = response.id;
                        // Insert the token into the form so it gets submitted to the server
                        $("#transactionform").append( $( '<input type="hidden" name="stripeToken" />' ).val( token ) );
                        // and submit
                        console.log($( '#token' ).val());
                        $.ajax( {
                            url: '/createtransaction',
                            type: 'POST',
                            headers: {
                                //'x-access-token': $( '#token' ).html()
                                'x-access-token': $( '#token' ).val()
                            },
                            data: {
                                amount: $( '#amount' ).val(),
                                currency: $( '#currency' ).val(),
                                token: token
                            }
                        } ).done( function( response ) {
                            if ( response.message ) {
                                $( '.payment-errors' ).text( response.message );
                                $('.payment-errors').show();
                            }
                        } );
                    }

                } );
            }
            else{     
                $.ajax( {
                    url: '/createtransaction',
                    type: 'POST',
                    headers: {
                        'x-access-token': $( '#token' ).val()
                    },
                    data: {
                        amount: $( '#amount' ).val(),
                        currency: $( '#currency' ).val(),
                        storedCardId: $("#card-select").val()
                    }
                } ).done( function( response ) {
                    if ( response.message ) {
                        $( '.payment-errors' ).text( response.message );
                        $('.payment-errors').show();
                    }
                } );
            }
        }

    } );
} );
