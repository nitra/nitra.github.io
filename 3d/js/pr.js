var closeFrame = document.getElementById('text-close');
var components = {
    client: null,
    threeDSecure: null,
    paymentRequest: null
};

closeFrame.addEventListener('click', function () {
    components.threeDSecure.cancelVerifyCard(removeFrame())
});

window.fetch('https://us-central1-nitra-labs.cloudfunctions.net/testRuntimeconfig')
    .then(function (response) {
        return response.text()
    }).then(function (clientToken) {
    braintree.client.create({
        authorization: clientToken
    }, onClientCreate)
});

function onClientCreate(err, clientInstance) {
    console.log('clientInstance', clientInstance);
    if (err) {
        console.log('client error:', err);
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

        console.log('instance - ', instance);

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
            console.error('tokenization error:', err);
            return
        } else {
            console.log('tokenization success:', payload)
        }

        components.threeDSecure.verifyCard({

            nonce: payload.nonce,
            amount: amount,
            addFrame: function (err, iframe) {
                var bankFrame = document.querySelector('.bt-modal-body');
                var modal = document.getElementById('modal');
                modal.classList.remove('hidden');
                bankFrame.appendChild(iframe);
            },
            removeFrame: function () {
                var modal = document.getElementById('modal');
                modal.classList.add('hidden');
            }
        }, function (err, verification) {
            if (err) {
                console.log(err);
                return
            }

            console.log('verification success:', verification);
            if (verification.liabilityShifted) {
                fetch('https://us-central1-nitra-labs.cloudfunctions.net/checkout', {
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