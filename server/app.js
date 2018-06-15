const path = require('path');
const express = require('express')
const bodyParser = require('body-parser')
const port = process.env.PORT || 8080

let app = express()
let api = require('./controller') 

app.listen(port, () => {
    console.log('Express server listening on port: ' + port);
});

//configs
//app.use(bodyParser.json()); // support json encoded bodies
//app.use(bodyParser.urlencoded({ extended: true })); 

//mount routes
app.get('/token', api.token)

app.post('/checkout', api.checkout)

app.post('/customer', api.createCustomer)
app.put('/customer/:id', api.updateCustomer)
app.delete('/customer/:id', api.deleteCustomer)

app.post('/subscription', api.createSubscription)
//app.put('/subscription/:id', api.updateSubscription)
app.delete('/subscription/:id', api.canselSubscription)


// exeptions
app.use((req, res, next) => {
    res.status(404);
    console.debug('Not found URL: %s', req.url);
    res.send({ error: 'Not found' });
    return;
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    console.error('Internal error(%d): %s', res.statusCode, err.message);
    res.send({ error: err.message });
    return;
});