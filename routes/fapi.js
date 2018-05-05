var express = require('express');
var router = express.Router();
var fs = require('fs');
/* GET All Report with Respect to Their Passed and Failed Status. */
router.get('/viewProducts', function (req, res, next) {
    var json = JSON.parse(fs.readFileSync('./db/products.json', 'utf8'));
    var products = [];
    var startLimit = Math.floor(Math.random() * 10000) %  json.flipkart.length;
    if(startLimit> (json.flipkart.length-20)){
        startLimit = json.flipkart.length-20;
    }
    var val=[];
    for(var i=0; i< 20; i++){
        val.push(json.flipkart[startLimit++]);
    }
    var obj = {};
    val.forEach(function(items){
        obj.title= items.productBaseInfoV1.attributes.title;
        obj.description = items.productBaseInfoV1.attributes.productDescription;
        obj.mrp = items.productBaseInfoV1.attributes.maximumRetailPrice.amount+ ' '  +items.productBaseInfoV1.attributes.maximumRetailPrice.currency;
        obj.sp = items.productBaseInfoV1.attributes.sellingPrice.amount+  ' '  +items.productBaseInfoV1.attributes.sellingPrice.currency;
        obj.image = items.productBaseInfoV1.attributes.imageUrls.unknown;
        obj.color = items.productBaseInfoV1.attributes.color;
        obj.url= items.productBaseInfoV1.attributes.productUrl;
        products.push(obj);
        obj={};
    })
    console.log(products);
    res.render('products', {products});
});

module.exports = router;