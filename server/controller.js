const braintree = require("braintree")
const url = require('url')
var fetch = require('node-fetch')
var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: 'cyhyv9sr7f3yshtk',
    publicKey: '9jm5ph4pvqsw62fy',
    privateKey: '7e5449e71b8442b8420b3f9f95ffc994'
});
function gatewayTransactionSale(conf) {
    return new Promise((resolve, reject) => {
        gateway.transaction.sale(conf, function (err, result) {
            if (result.success) {
                return resolve(result)
            }
            if (err) {
                console.log('error -- ', err)
                return reject(err)
            }
            if (!result.sucess) {
                console.log('error -- ', err)
                return reject(result)
            }
        })
    })
}


exports.token = (req, res) => {
    gateway.clientToken.generate({}, (err, response) => {
        res.setHeader('Access-Control-Allow-Origin', "*")
        res.setHeader('Access-Control-Allow-Methods', 'GET')
        res.send(response.clientToken)
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
        var nonceFromTheClient = body//.payment_method_nonce
        console.log('nonceFromTheClient - ', nonceFromTheClient)
        let opt = {
            amount: "10.00",
            paymentMethodNonce: nonceFromTheClient,
            options: {
                submitForSettlement: true
            }
        }

        gatewayTransactionSale(opt)
            .then((r) => {
                console.log(r.success)
                res.status(200)
                res.send('check success')
                res.end()
            })
            .then(() => {
                return fetch('http://127.0.0.1:8080/customer', {
                    body: nonceFromTheClient,
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    method: 'post'
                })
            }).then((resp) => {
                console.log('resp customer --', resp)
            })
            .catch((err) => {
                console.log(err)
                res.status(500)
                res.end()
            })

        /*
        gateway.transaction.sale(opt, function (err, result) {
            if (result.success) {
                // See result.transaction for details
                console.log(result)
                res.status(200)
                res.send(req.body.email)
                res.end()
            } else {
                // Handle errors
                console.log(err)
                res.end()
            }
        });
        */
    });
}

exports.checkoutbil = (req, res) => {
    console.log('Woo 8')
    var body = '';
    res.setHeader('Access-Control-Allow-Origin', "*")
    res.setHeader('Access-Control-Allow-Methods', 'POST')
    req.on('data', (data) => {
        body += data;
    });
    req.on('end', () => {
        console.log("Body: " + body);
        var nonceFromTheClient = body//.payment_method_nonce
        console.log('nonceFromTheClient - ', nonceFromTheClient)
        let opt = {
            body: nonceFromTheClient,
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'post'
        }
        fetch('http://127.0.0.1:8080/customer', opt)
        .then(resp => resp.text())
        .then(data => {
            console.log('token --', data)
            return data
        })
        .then((token) => {
            console.log('customer token ============', token)
            let opt = {
                body: token,
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                method: 'post'
            }
            return fetch('http://127.0.0.1:8080/subscription', opt)
        })
        .then((resp) => {
            res.status(201)
            res.send(resp.sucess)
            res.end()
            return resp.text()
        })
        .then(data =>{
            console.log('subscription --', data)
        })
        .catch((err) => {
                console.log(err)
                res.status(500)
                res.end()
            })
    })
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
        console.log('nonceFromTheClient ==== ', nonceFromTheClient)
        let opt = {
            firstName: "Charity",
            lastName: "Smith",
            paymentMethodNonce: nonceFromTheClient
        }
        gateway.customer.create(opt, function (err, result) {
            if (err) {
                res.write(err)
                res.end()
            } else {
                //result.success;
                // true

                //result.customer.id;
                // e.g 160923

                //result.customer.paymentMethods[0].token;
                // e.g f28wm
                if (process.env.NODE_ENV === 'dev') {
                    //console.log(JSON.stringify(result))
                    res.send(result)
                    res.end()
                } else {
                    console.log(result)
                    res.send(result.customer.paymentMethods[0].token)
                    res.end()
                }
            }
        });

        //console.log('body  === ', body)
    })
}

exports.updateCustomer = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', "*")
    res.setHeader('Access-Control-Allow-Methods', 'PUT')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, X-Requested-With');
    gateway.customer.update(req.params.id, req.body.update, (err, result) => {
        if (err) {
            res.send(err)
            res.end()
        } else {
            res.send(result.success)
            res.end()
        }
    });
}

exports.deleteCustomer = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', "*")
    res.setHeader('Access-Control-Allow-Methods', 'DELETE')
    gateway.customer.delete(req.params.id, (err) => {
        if (err) {
            res.send(err)
            res.end()
        } else {
            res.send(null)
            res.end()
        }
        // null
    });
}

exports.canselSubscription = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', "*")
    res.setHeader('Access-Control-Allow-Methods', 'DELETE')
    gateway.subscription.cansel(req.params.id, (err, res) => {
        if (err) {
            res.send(err)
            res.end()
        } else {
            res.send(res)
            res.end()
        }
        // null
    });
}

exports.createSubscription = (req, res) => {
    var body = '';
    res.setHeader('Access-Control-Allow-Origin', "*")
    res.setHeader('Access-Control-Allow-Methods', 'POST')
    req.on('data', (data) => {
        body += data;
    });
    req.on('end', () => {
        console.log('params - ', body)
        let opt = {
            paymentMethodToken: body,
            planId: 'rg2w'
        }
        console.log('--- create sub -- opt -', opt)
        gateway.subscription.create(opt, (err, result) => {
            if (err) {
                res.send(err)
                res.end()
            } else {
                console.log('sub create - ', result)
                res.send('sub create - ok')
                res.end()
            }
        })
    })
}