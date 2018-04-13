var submit = document.querySelector('#submit');

var clientToken = fetch('https://us-central1-nitra-p.cloudfunctions.net/testRuntimeconfig')
  .then(function(response) {
    return response.text()
  })

clientToken.then(function(clientTokenId) {
    braintree.client.create({
      authorization: clientTokenId
    }, function (err, clientInstance) {
      braintree.hostedFields.create({
        client: clientInstance,
        fields: {
          number: {
            selector: '#cc-num',
            placeholder: 'Credit Card Number',
            prefill: '4111111111111111'
          },
          cvv: {
            selector: '#cc-cvv',
            placeholder: 'CVV',
            prefill: '400'
          },
          expirationDate: {
            selector: '#cc-expiration-date',
            placeholder: 'MM/YY',
            prefill: '09/20'
          }
        },
        styles: {
          input: {
            'font-size': '16px',
            '-webkit-font-smoothing': 'antialiased'
          }
        }
      }, function (err, hostedFieldsInstance) {
        
        hostedFieldsInstance.on('validityChange', function (event) {
          var allValid = true;
          var field, key;
          
          for (key in event.fields) {
            if (event.fields[key].isValid === false) {
              allValid = false;
              break;
            }
          }
          
          if (allValid) {
            submit.removeAttribute('disabled');
          } else {
            submit.setAttribute('disabled', 'disabled');
          }
        });
        
        submit.addEventListener('click', function () {
          if (err) {
            console.error(err);
            return;
          }
    
          hostedFieldsInstance.tokenize(function (tokenizeErr, payload) {
            if (tokenizeErr) {
              console.error(tokenizeErr);
              return;
            }

            // If this was a real integration, this is where you would
            // send the nonce to your server.
            console.log('Got a nonce: ' + payload.nonce);


            // Example POST method implementation:
            fetch("https://us-central1-nitra-p.cloudfunctions.net/checkout", {
              body: "payment_method_nonce=" + payload.nonce,
              headers: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              method: "post",
          })

          //   postData('https://us-central1-nitra-p.cloudfunctions.net/checkout', {payment_method_nonce: payload.nonce})
          //     .then(data => console.log(data)) // JSON from `response.json()` call
          //     .catch(error => console.error(error))

          //   function postData(url, data) {
          //   // Default options are marked with *
          //   return fetch(url, {
          //     body: JSON.stringify(data), // must match 'Content-Type' header
          //     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          //     // credentials: 'same-origin', // include, same-origin, *omit
          //     headers: {
          //       'user-agent': 'Mozilla/4.0 MDN Example',
          //       'content-type': 'application/json'
          //     },
          //     method: 'POST', // *GET, POST, PUT, DELETE, etc.
          //     mode: 'cors', // no-cors, cors, *same-origin
          //     redirect: 'follow', // manual, *follow, error
          //     referrer: 'no-referrer', // *client, no-referrer
          //   })
          //   .then(response => response.json()) // parses response to JSON
          //   }
          });


          // This is where you would submit payload.nonce to your server
          // alert('Submit your nonce to your server here!');
        });
      });
    });
})
