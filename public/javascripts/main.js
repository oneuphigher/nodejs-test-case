'use strict';

/*global Stripe:true*/
/*global $form:true*/

//set Public key for Stripe payments
Stripe.setPublishableKey( 'pk_test_E4mIDA8jzvfz806jhoh07ecv' );
var isSubmit = false;
$(document).ready(function(){


    function validation(){

        var value;
        if($( '#amount' ).val() == '')
        {

            var response = {'status' : 'fail','message':'Please enter amount'}

            var display_msg = getDisplayMsg(response);

            $('.payment-errors').html(display_msg);

            isSubmit = false;

        }
        else if($( '#currency' ).val() == ''){
            var response = {'status' : 'fail','message':'Please enter currency'}

            var display_msg = getDisplayMsg(response);

            $('.payment-errors').html(display_msg);

            isSubmit = false;
        }
        else{
            isSubmit = true;
        }
        
    }


    $('input').focus(function(){

        $('.payment-errors').empty();
    });

    $( '#submittransaction' ).click( function() {

        $(".loading").show();

        var customer_id = $('#customer_id').val();

        validation();
        
        if (isSubmit) {

            if(customer_id == ''){

                var card_number = $('#cardnumber').val();

                console.log(card_number);

                Stripe.card.createToken( {
                    number: card_number,
                    cvc: $( '.card-cvc' ).val(),
                    exp_month: $( '.card-expiry-month' ).val(),
                    exp_year: $( '.card-expiry-year' ).val()
                }, function( status, response ) {
                    if ( response.error ) {

                        var response = response.error
                        response['status'] = 'fail';
                        // Show the errors on the form
                        var display_msg = getDisplayMsg(response);

                        $('.payment-errors').html(display_msg);

                    }
                    else {
                        // response contains id and card, which contains additional card details
                        var token = response.id;
                        
                        $.ajax( {
                            url: '/createtransaction',
                            type: 'POST',
                            headers: {
                                'x-access-token': $('#token').html()
                            },
                            data: {
                                amount      : $( '#amount' ).val(),
                                currency    : $( '#currency' ).val(),
                                stripeToken : token,
                                user_id     : $('#user_id').val(),
                                customer_id : customer_id
                            }
                        } ).done( function( response ) {
                            
                            var display_msg = getDisplayMsg(response);

                            $('.payment-errors').html(display_msg);

                        } ).fail(function (response) {
                            
                            var display_msg = getDisplayMsg(response);

                            $('.payment-errors').html(display_msg);

                        });
                    }

                } );
            }
            else{
                $.ajax( {
                    url: '/createtransaction',
                    type: 'POST',
                    headers: {
                        'x-access-token': $('#token').html()
                    },
                    data: {
                        amount      : $( '#amount' ).val(),
                        user_id     : $('#user_id').val(),
                        customer_id : customer_id
                    }
                } ).done( function( response ) {
                    
                    var display_msg = getDisplayMsg(response);

                    $('.payment-errors').html(display_msg);
                    
                } ).fail(function (response) {

                    var display_msg = getDisplayMsg(response);

                    $('.payment-errors').html(display_msg);

                });
            } 
        }

    } );

var getDisplayMsg = function(response){

    if(response['status'] == 'fail')
    {
        $(".loading").hide();

        var display_msg = "<div class='alert alert-danger' role='alert'>"
                     +"<span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span>"
                     +"<span class='sr-only'>Error:</span>"
                     +response['message']
                     +"</div>";

        return display_msg
    }
    else
    {
        $(".loading").hide();

        var display_msg = "<div class='alert alert-success' role='alert'>"
                     +"<span class='glyphicon glyphicon glyphicon-ok-sign' aria-hidden='true'></span>"
                     +"<span class='sr-only'>Error: </span>"
                     + response['message']+'<br>'
                     +"</div>";
        return display_msg
    }

}

} );
