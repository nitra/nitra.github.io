const path = require('path');
const express = require('express')
const port = process.env.PORT || 8080

let app = express()
let api = require('./controller') 

app.listen(port, () => {
    console.log('Express server listening on port: ' + port);
});

//mount routes
app.get('/token', api.token)
app.post('/checkout', api.checkout)
app.post('/customer', api.createCustomer)

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