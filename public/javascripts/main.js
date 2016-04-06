'use strict';

/*global Stripe:true*/
/*global $form:true*/

//set Public key for Stripe payments
Stripe.setPublishableKey( publishableKey );

$(document).ready(function() {
    $( '#submittransaction' ).on("click", submitTransaction);
    $('[name="payment-method"]').on("change", toggleCard);
});

//event handler for clicking the payment submit button
function submitTransaction() {
    $("#submittransaction").attr("disabled", true); //disble the submit button - to avoid repeated submissions.
    var isNewCard = checkForNewCard();//whether the customer is using the saved card or new card for payment? 
    if (isNewCard) {
        //if a new card is used for payment, get stripe token
        Stripe.card.createToken({
                number: $( '.card-number' ).val(),
                cvc: $( '.card-cvc' ).val(),
                exp_month: $( '.card-expiry-month' ).val(),
                exp_year: $( '.card-expiry-year' ).val()
            },
            function(status, response) {
                if (response.error) {
                    // Show the errors on the form
                    $('.payment-errors').text( response.error.message );
                    $("#submittransaction").removeAttr("disabled");//enable the submit button
                }
                else {
                    sendData(response.id);
                }
            }
        );
    }
    else {
        sendData(null);
    }
}

function sendData(stripeToken) {
    $.ajax( {
        url: '/createtransaction',
        type: 'POST',
        headers: {
            'x-access-token': $( '#token' ).html()
        },
        data: {
            amount: $( '#amount' ).val(),
            currency: $( '#currency' ).val(),
            stripeToken: stripeToken,
        },
        complete: function() {
            $("#submittransaction").removeAttr("disabled");//enable the submit button
        },
        success: function(response) {
            if ( response.message ) {
                $( '.payment-errors' ).text( response.message );
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $( '.payment-errors' ).text( textStatus + " " + errorThrown );
        }
    });
}

function checkForNewCard() {
    return $('[name="payment-method"]:checked').val() == 'new-card';
}

function toggleCard() {
    $('#card-detail').toggle();
}
