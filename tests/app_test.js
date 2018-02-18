describe('Flipkart API accumulation', function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    var request = require('request');
    var fs = require('fs');
    var urls;
    var product = [];
    it('getAllProduct', function (done) {
        var url = 'https://affiliate-api.flipkart.net/affiliate/api/pawanbcet.json';
        return requestAPI(url)
            .then(function (response) {
                urls = response.apiGroups.affiliate.apiListings.mobiles.availableVariants['v0.1.0'].get;
            })
            .then(done)
            .catch(done);
    });

 /*   it('Offers Product for mobile', function (done) {
        return requestAPI('https://affiliate-api.flipkart.net/affiliate/offers/v1/all/json')
        .then(function (response) {
            addItemToProduct(response.productInfoList);
           // return callNextURL(response.nextUrl);
        })
        .then(done)
        .catch(done);
    });  
    */  

    it('getAllProduct for mobile', function (done) {
        return requestAPI(urls)
            .then(function (response) {
                addItemToProduct(response.productInfoList);
                return callNextURL(response.nextUrl);
            })
            .then(function () {
                var input = {
                    flipkart: product
                }
                fs.writeFileSync('./db/products.json', JSON.stringify(input), 'utf8');
            })
            .then(done)
            .catch(done);
    });

    function addItemToProduct(productArray) {
        productArray.forEach(function (item) {
            product.push(item);
        })
    }

    function callNextURL(url) {
        return requestAPI(url)
            .then(function (response) {
                console.log(response.productInfoList.length);
                if (response.nextUrl == null || response.productInfoList.length < 500) {
                    addItemToProduct(response.productInfoList);
                    return;
                }
                else {
                    addItemToProduct(response.productInfoList);
                    return callNextURL(response.nextUrl);
                }
            })
            .catch(function () {
                return;
            })
    }


    function requestAPI(url) {
        var options = {
            url: url,
            headers: {
                'Fk-Affiliate-Id': 'pawanbcet',
                'Fk-Affiliate-Token': '2b295c26a45a431ca310b0dcb32206f7'
            },
            method: 'GET',
            json: true,
            proxy: "http://127.0.0.1:8888",
            rejectUnauthorized: false
        };
        console.log(options.url);
        return new Promise(function (resolve, reject) {
            request(options, function (error, response, body) {
                if (!error && (response.statusCode === 200)) {
                    if (response.statusCode === 200)
                        resolve(response.body);
                } else {
                    console.log('simpleInitIdpHTML in utils has failed');
                }
            });
        })
    };
});
