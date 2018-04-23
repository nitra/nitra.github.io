var payBtn = document.getElementById('pay-btn')
var nonceGroup = document.querySelector('.nonce-group')
// var nonceInput = document.querySelector('.nonce-group input')
var payGroup = document.querySelector('.pay-group')
var modal = document.getElementById('modal')
var bankFrame = document.querySelector('.bt-modal-body')
var closeFrame = document.getElementById('text-close')
var amountInput = document.getElementById('amount')
// var clientTokenScript = document.getElementById('client-token')
var cvvLabel = document.getElementById('label-cvv')

var components = {
  client: null,
  threeDSecure: null,
  hostedFields: null
}

window.fetch('https://us-central1-nitra-p.cloudfunctions.net/testRuntimeconfig')
  .then(function (response) {
    return response.text()
  }).then(function (clientToken) {
    braintree.client.create({
      authorization: clientToken
    }, onClientCreate)
  })

function onClientCreate (err, client) {
  if (err) {
    console.log('client error:', err)
    return
  }

  components.client = client

  braintree.hostedFields.create({
    client: client,
    styles: {
      'input': {
        'font-size': '16px',
        'font-family': 'courier, monospace',
        'font-weight': 'lighter',
        'color': '#ccc'
      },
      ':focus': {
        'color': 'black'
      },
      '.valid': {
        'color': '#8bdda8'
      }
    },
    fields: {
      number: {
        selector: '#hf-number',
        placeholder: '4111 1111 1111 1111',
        prefill: '411111111111111'
      },
      cvv: {
        selector: '#hf-cvv',
        placeholder: '123',
        prefill: '123'
      },
      expirationDate: {
        selector: '#hf-date',
        placeholder: '12 / 34',
        prefill: '12/34'
      }
    }
  }, function (createErr, hostedFieldsInstance) {
    components['hostedFields'] = hostedFieldsInstance
    hostedFieldsInstance.on('cardTypeChange', function (event) {
      if (event.cards.length === 1) {
        switch (event.cards[0].type) {
          case 'american-express':
          case 'maestro':
          case 'master-card':
          case 'visa':
            console.log(event.cards[0].niceType)
            cvvLabel.innerHTML = event.cards[0].code['name']
            break
          default:
            alert('Only american-express, maestro, master-card or visa supported')
        }
      } else {
        console.log('Type of card not yet known')
      }
    })

    hostedFieldsInstance.on('validityChange', function (event) {
      var field = event.fields[event.emittedBy]

      if (event.fields['number'].isValid && event.fields['cvv'].isValid && event.fields['expirationDate'].isValid) {
        console.log(event.emittedBy, 'is fully valid')
        enablePayNow()
      } else {
        console.log(event.emittedBy, 'is not valid')
        payBtn.setAttribute('disabled', 'disabled')
      }
    })
    setupForm()
  })

  braintree.threeDSecure.create({
    client: client

  }, function (createErr, threeDSecureInstance) {
    components['threeDSecure'] = threeDSecureInstance
    setupForm()
  })
}

function setupForm () {
  if (components.threeDSecure && components.hostedFields) {
    payBtn.value = 'Pay Now'
  }
}

function addFrame (err, iframe) {
  bankFrame.appendChild(iframe)
  modal.classList.remove('hidden')
}

function removeFrame () {
  var iframe = bankFrame.querySelector('iframe')
  modal.classList.add('hidden')
  iframe.parentNode.removeChild(iframe)
}

function enablePayNow () {
  payBtn.value = 'Pay Now'
  payBtn.removeAttribute('disabled')
}

closeFrame.addEventListener('click', function () {
  components.threeDSecure.cancelVerifyCard(removeFrame())
  enablePayNow()
})

payBtn.addEventListener('click', function (event) {
  payBtn.setAttribute('disabled', 'disabled')
  payBtn.value = 'Processing...'

  components.hostedFields.tokenize(function (err, payload) {
    if (err) {
      console.err('tokenization error:', err)
      enablePayNow()
      return
    } else {
      console.log('tokenization success:', payload)
    }

    components.threeDSecure.verifyCard({
      amount: amountInput.value,
      nonce: payload.nonce,
      addFrame: addFrame,
      removeFrame: removeFrame
    }, function (err, verification) {
      if (err) {
        console.err('verification error:', err)
        enablePayNow()
        return
      }

      console.log('verification success:', verification)
      // nonceInput.value = verification.nonce
      if (verification.liabilityShifted) {
        fetch('https://us-central1-nitra-p.cloudfunctions.net/checkout', {
          body: 'payment_method_nonce=' + verification.nonce + '&email=v@nitra.ai',
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          method: 'post'
        })
      } else {
        console.err("Couldn't create 3-D Secure transaction")
      }
      payGroup.classList.add('hidden')
      payGroup.style.display = 'none'
      nonceGroup.classList.remove('hidden')
    })
  })
})
