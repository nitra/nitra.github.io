var closeFrame = document.getElementById('text-close');
var bankFrame = document.querySelector('.bt-modal-body');
var modal = document.getElementById('modal');
var components = {
    client: null,
    threeDSecure: null,
    paymentRequest: null
};


function addFrame (err, iframe) {
    bankFrame.appendChild(iframe);
    modal.classList.remove('hidden')
}

function removeFrame () {
    var iframe = bankFrame.querySelector('iframe');
    modal.classList.add('hidden');
    iframe.parentNode.removeChild(iframe)
}

closeFrame.addEventListener('click', function () {
    components.threeDSecure.cancelVerifyCard(removeFrame())
});

window.fetch('https://us-central1-nitra-p.cloudfunctions.net/testRuntimeconfig')
    .then(function (response) {
        return response.text()
    }).then(function (clientToken) {
    braintree.client.create({
        authorization: clientToken
    }, onClientCreate)
});

function onClientCreate(err, clientInstance) {
    // console.log('clientInstance', clientInstance);
    if (err) {
        // console.log('client error:', err);
        return
    }

    components.client = clientInstance;

    braintree.paymentRequest.create({
        client: clientInstance
    }, function (err, instance) {
        if (err) {
            // Handle errors from creating payment request instance
        }

        components['paymentRequest'] = instance;

        // console.log('instance - ', instance);

        document.getElementById("loader").style.display = "none";
        var amount = '100.00';
        var tok = {
            details: {
                total: {
                    label: 'Total',
                    amount: {
                        currency: 'USD',
                        value: amount
                    }
                }
            }
        };

        check3d(tok, amount)

    });

    braintree.threeDSecure.create({
        client: clientInstance
    }, function (createErr, threeDSecureInstance) {
        components['threeDSecure'] = threeDSecureInstance
    })

}



function check3d(tok, amount) {

    components.paymentRequest.tokenize(tok, function (err, payload) {
        if (err) {
            // console.log('tokenization error:', err);
            return
        } else {
            // console.log('tokenization success:', payload)
        }

        components.threeDSecure.verifyCard({

            nonce: payload.nonce,
            amount: amount,
            addFrame: addFrame,
            removeFrame: removeFrame,
        }, function (err, verification) {
            if (err) {
                // console.log(err);
                return
            }

            // console.log('verification success:', verification);
            if (verification.liabilityShifted) {
                fetch('https://us-central1-nitra-p.cloudfunctions.net/checkout', {
                    body: 'payment_method_nonce=' + verification.nonce + '&email=v@nitra.ai',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    method: 'post'
                })
            } else {
                console.error("Couldn't create 3-D Secure transaction")
            }
        })
    })

}