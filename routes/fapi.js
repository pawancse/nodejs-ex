var express = require('express');
var router = express.Router();
var fs = require('fs');
/* GET All Report with Respect to Their Passed and Failed Status. */
router.get('/flipkart/:count', function (req, res, next) {
    var limit = parseInt(req.params.count) || 20;
    var products = getProducts(limit);
    res.json(products);
});

router.get('/flipkart/:count/:priceOrder', function (req, res, next) {
    var limit = parseInt(req.params.count) || 20;
    var priceOrder = req.params.priceOrder;
    var products = getProducts(limit, priceOrder);
    res.json(products);
});

router.get('/flipkart', function (req, res, next) {
    var limit = 20;
    var products = getProducts(limit);
    res.json(products);
});

function getProducts(limit, priceOrder) {
    var json = JSON.parse(fs.readFileSync('./db/products.json', 'utf8'));
    var products = [];
    var startLimit;
    if (priceOrder == undefined) {
        startLimit = Math.floor(Math.random() * 10000) % json.flipkart.length;
    }
    else if (priceOrder == 'true') {
        json.flipkart.sort(function (a, b) {
            return parseFloat(a.productBaseInfoV1.maximumRetailPrice.amount) - parseFloat(b.productBaseInfoV1.maximumRetailPrice.amount);
        });
        startLimit = 0;
    }
    else if (priceOrder == 'false') {
        json.flipkart.sort(function (a, b) {
            return parseFloat(b.productBaseInfoV1.maximumRetailPrice.amount) - parseFloat(a.productBaseInfoV1.maximumRetailPrice.amount);
        });
        startLimit = 0;
    }
    if (startLimit > (json.flipkart.length - limit)) {
        startLimit = json.flipkart.length - limit;
    }
    var val = [];
    for (var i = 0; i < limit; i++) {
        val.push(json.flipkart[startLimit++]);
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
    return products;
}

module.exports = router;