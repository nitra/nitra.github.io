const braintree = require("braintree")
const url = require('url')
var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: 'cyhyv9sr7f3yshtk',
    publicKey: '9jm5ph4pvqsw62fy',
    privateKey: '7e5449e71b8442b8420b3f9f95ffc994'
});

exports.token = (req, res) => {
    gateway.clientToken.generate({}, (err, response) => {
        res.setHeader('Access-Control-Allow-Origin', "*")
        res.setHeader('Access-Control-Allow-Methods', 'GET')
        res.write(response.clientToken)
        res.end()
    })
}
  
exports.checkout = (req, res) => {
    console.log('Woo 8')
    var body = '';
    res.setHeader('Access-Control-Allow-Origin', "*")
    res.setHeader('Access-Control-Allow-Methods', 'POST')
    req.on('data', (data) => {
        body += data;
    });
    req.on('end', () => {
        console.log("Body: " + body);
        var nonceFromTheClient = body.payment_method_nonce
        console.log('nonceFromTheClient - ', nonceFromTheClient)
        let opt = {
            amount: "10.00",
            paymentMethodNonce: nonceFromTheClient,
            options: {
                submitForSettlement: true
            }
        }
        gateway.transaction.sale(opt, function (err, result) {
            if (result.success) {
                // See result.transaction for details
                console.log(result)
                res.status(200)
                res.write(req.body.email)
                res.end()
            } else {
                // Handle errors
                console.log(err)
                res.end()
            }
        });
    });
}

exports.createCustomer = (req, res) => {
    var body = '';
    res.setHeader('Access-Control-Allow-Origin', "*")
    res.setHeader('Access-Control-Allow-Methods', 'POST')
    req.on('data', (data) => {
        body += data;
    });
    req.on('end', () => {
        var nonceFromTheClient = body//.payment_method_nonce
        console.log('nonceFromTheClient ==== ', nonceFromTheClient )
        let opt = {
            firstName: "Charity",
            lastName: "Smith",
            paymentMethodNonce: nonceFromTheClient
        }                
        gateway.customer.create(opt, (err, result) => {
            if (err) {
                res.write(err)
                res.end()
            } else {
                if (process.env.NODE_ENV === 'dev') {
                    console.log(JSON.stringify(result))
                    res.end()
                } else {
                    console.log(JSON.stringify(result))
                    res.end()
                }
            }
        });
    })
}