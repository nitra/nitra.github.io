var payBtn = document.getElementById('pay-btn')
var nonceGroup = document.querySelector('.nonce-group')
var nonceInput = document.querySelector('.nonce-group input')
var payGroup = document.querySelector('.pay-group')
var modal = document.getElementById('modal')
var bankFrame = document.querySelector('.bt-modal-body')
var closeFrame = document.getElementById('text-close')
var amountInput = document.getElementById('amount')
// var clientTokenScript = document.getElementById('client-token')

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
      input: {
        'font-size': '14px',
        'font-family': 'monospace'
      }
    },
    fields: {
      number: {
        selector: '#hf-number',
        placeholder: '4111 1111 1111 1111',
        prefill: '4111111111111111'
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
  }, onComponent('hostedFields'))

  braintree.threeDSecure.create({
    client: client
  }, onComponent('threeDSecure'))
}

function onComponent (name) {
  return function (err, component) {
    if (err) {
      console.log('component error:', err)
      return
    }

    components[name] = component

    if (components.threeDSecure && components.hostedFields) {
      setupForm()
    }
  }
}

function setupForm () {
  enablePayNow()
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
      console.log('tokenization error:', err)
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
        console.log('verification error:', err)
        enablePayNow()
        return
      }

      console.log('verification success:', verification)
      // nonceInput.value = verification.nonce
      fetch("https://us-central1-nitra-p.cloudfunctions.net/checkout", {
        body: "payment_method_nonce=" + verification.nonce,
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: "post",
    })
      payGroup.classList.add('hidden')
      payGroup.style.display = 'none'
      nonceGroup.classList.remove('hidden')
    })
  })
})
