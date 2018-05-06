var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var urls;
var product = [];
/* GET All Report with Respect to Their Passed and Failed Status. */
router.get('/flipkart/:count', function (req, res, next) {
    var limit = parseInt(req.params.count) || 20;
    return new Promise(function (resolve, reject) {
        return getProducts(limit)
            .then(function (response) {
                res.json(response);
                resolve(response);
            });
    })
});

router.get('/flipkart/:count/:priceOrder', function (req, res, next) {
    var limit = parseInt(req.params.count) || 20;
    var priceOrder = req.params.priceOrder;
    return new Promise(function (resolve, reject) {
        return getProducts(limit, priceOrder)
            .then(function (response) {
                res.json(response);
                resolve(response);
            });
    })
});

router.get('/flipkart', function (req, res, next) {
    var limit = 20;
    return new Promise(function (resolve, reject) {
        return getProducts(limit)
            .then(function (response) {
                res.json(response);
                resolve(response);
            });
    });
});

router.get('/Refreshflipkart', function (req, res, next) {
    var releasePromise;
    return new Promise(function (resolve, reject) {
        return callFlipkartAPIAndGetProducts()
            .then(function (json) {
                if (!db) {
                    initDb(function (err) { console.log(err); });
                }
                if (db) {
                    var col = db.collection('products');
                    // Create a document with request IP and current time of request
                    var itemAdded = [];
                    json.forEach(function (item) {
                        db.collection('products').findOne({ item }, function (err, result) {
                            if (err) {
                                itemAdded.push(item);
                                col.insert(item);
                            }
                        });
                    });
                    col.count(function (err, count) {
                        res.json({ itemAdded });
                        
                        resolve(true);
                    });
                } else {
                    res.json({ value: 'not connected!!' });
                    
                    resolve(true);
                }
            });
    });
});


function getProducts(limit, priceOrder) {
    var json;
    return new Promise(function (resolve, reject) {
        if (!db) {
            initDb(function (err) { console.log(err); });
        }
        if (db) {
            db.collection("products").find({}).toArray(function (err, json) {
                if (err) throw err;
                var products = [];
                var startLimit;
                if (priceOrder == undefined) {
                    startLimit = Math.floor(Math.random() * 10000) % json.length;
                }
                else if (priceOrder == 'true') {
                    json.sort(function (a, b) {
                        return parseFloat(a.productBaseInfoV1.maximumRetailPrice.amount) - parseFloat(b.productBaseInfoV1.maximumRetailPrice.amount);
                    });
                    startLimit = 0;
                }
                else if (priceOrder == 'false') {
                    json.sort(function (a, b) {
                        return parseFloat(b.productBaseInfoV1.maximumRetailPrice.amount) - parseFloat(a.productBaseInfoV1.maximumRetailPrice.amount);
                    });
                    startLimit = 0;
                }
                if (startLimit > (json.length - limit)) {
                    startLimit = json.length - limit;
                }
                var val = [];
                for (var i = 0; i < limit; i++) {
                    val.push(json[startLimit++]);
                }
                var obj = {};
                val.forEach(function (items) {
                    obj.title = items.productBaseInfoV1.title;
                    obj.description = items.productBaseInfoV1.productDescription;
                    obj.mrp = items.productBaseInfoV1.maximumRetailPrice.amount + ' ' + items.productBaseInfoV1.maximumRetailPrice.currency;
                    obj.sp = items.productBaseInfoV1.flipkartSellingPrice.amount + ' ' + items.productBaseInfoV1.flipkartSellingPrice.currency;
                    obj.image = items.productBaseInfoV1.imageUrls;
                    obj.color = items.productBaseInfoV1.attributes.color;
                    obj.url = items.productBaseInfoV1.productUrl;
                    products.push(obj);
                    obj = {};
                }) 
                resolve(products);
            });
        }
    });
}

function callFlipkartAPIAndGetProducts() {
    var url = 'https://affiliate-api.flipkart.net/affiliate/api/pawanbcet.json';
    return new Promise(function (resolve, reject) {
        return requestAPI(url)
            .then(function (response) {
                urls = response.apiGroups.affiliate.apiListings.mobiles.availableVariants['v1.1.0'].get;
                return requestAPI(urls)
            })
            .then(function (response) {
                addItemToProduct(response.products);
                return callNextURL(response.nextUrl);
            })
            .then(function () {
                resolve(product);
            })
    })
}

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

module.exports = router;