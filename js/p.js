var url = new URL(window.location.href)
var domain = url.searchParams.get("u")
if(domain) {
    domain = domain.toLowerCase()
    localStorage.setItem(domain, domain);
    localStorage.setItem('lastKey', domain);
} else {
    domain = localStorage.getItem('lastKey')
    if(domain) {
        history.replaceState(null, null, window.location.pathname + "?u=" + domain);
    }
}

if(domain) {
    var camelizeDomain = domain.charAt(0).toUpperCase() + domain.slice(1);
    document.body.innerHTML = document.body.innerHTML.replace(/Ваш сайт|Вашем сайте|Вашего сайта/g, camelizeDomain);
    document.body.innerHTML = document.body.innerHTML.replace(/example.com/g, domain);
}


var gad = localStorage.getItem('gad')
console.log(gad)
if(gad) {
    // init hide
    unhighlight(JSON.parse(gad))
    // console.log('success', JSON.parse(gad)) 
} else {
    $.ajax({
        url: "https://us-central1-nitra-p.cloudfunctions.net/urldata",
        method: "GET",
        dataType : "json"
    })
    .done(function(data) {
        // gad = data
        unhighlight(data)
        localStorage.setItem('gad', JSON.stringify(data))

        // console.log('succ1ess', data) 
        // init hide
        // console.log('succ2ess', gad.alpn) 
    })
}

function unhighlight(gad) {
    // console.log(gad);
    $.each(gad, function(index, value) {
        console.log(index);
        $( ".alpn" ).each(function() {
            $(this).css('background-color', '#f0ebea');
          });
    }); 
}

//    Object.keys(localStorage).forEach(key => console.log(localStorage[key]));