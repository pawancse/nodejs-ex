describe('Flipkart API accumulation', function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
    var request = require('request');
    var fs = require('fs');
    var urls;
    var product = [];
    it('getAllProduct', function (done) {
        var url = 'https://affiliate-api.flipkart.net/affiliate/api/pawanbcet.json';
        return requestAPI(url)
            .then(function (response) {
                urls = response.apiGroups.affiliate.apiListings.mobiles.availableVariants['v1.1.0'].get;
            })
            .then(done)
            .catch(done);
    });

    /*   it('Offers Product for mobile', function (done) {
           return requestAPI('https://affiliate-api.flipkart.net/affiliate/offers/v1/all/json')
           .then(function (response) {
               addItemToProduct(response.products);
              // return callNextURL(response.nextUrl);
           })
           .then(done)
           .catch(done);
       });  
       */

    it('getAllProduct for mobile', function (done) {
        return requestAPI(urls)
            .then(function (response) {
                addItemToProduct(response.products);
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
        productArray = productArray.filter(function (item) {
            return item.productBaseInfoV1.inStock == true;
        });
        productArray.forEach(function (item) {
            product.push(item);
        })
    }

    function callNextURL(url) {
        return requestAPI(url)
            .then(function (response) {
                console.log(response.products.length);
                if (response.nextUrl == null || response.products.length < 500) {
                    addItemToProduct(response.products);
                    return;
                }
                else {
                    addItemToProduct(response.products);
                    return callNextURL(response.nextUrl);
                }
            })
            .catch(function () {
                return;
            })
    }


    function requestAPI(urlString) {
        var options = {
            baseUrl: urlString,
            uri: '',
            headers: {
                'Fk-Affiliate-Id': 'pawanbcet',
                'Fk-Affiliate-Token': '2b295c26a45a431ca310b0dcb32206f7'
            },
            proxy: 'http://127.0.0.1:8888',
            method: 'GET',
            json: true,
            rejectUnauthorized: false
        };
        console.log(options.baseUrl);
        return new Promise(function (resolve, reject) {
            request(options, function (error, response, body) {
                if (!error) {
                    resolve(response.body);
                }
                else {
                    console.log(error);
                }
            });
        })
    };
});
