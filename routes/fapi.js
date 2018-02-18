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
        obj.title= items.productBaseInfo.productAttributes.title;
        obj.description = items.productBaseInfo.productAttributes.productDescription;
        obj.mrp = items.productBaseInfo.productAttributes.maximumRetailPrice.amount+ ' '  +items.productBaseInfo.productAttributes.maximumRetailPrice.currency;
        obj.sp = items.productBaseInfo.productAttributes.sellingPrice.amount+  ' '  +items.productBaseInfo.productAttributes.sellingPrice.currency;
        obj.image = items.productBaseInfo.productAttributes.imageUrls.unknown;
        obj.color = items.productBaseInfo.productAttributes.color;
        obj.url= items.productBaseInfo.productAttributes.productUrl;
        products.push(obj);
        obj={};
    })
    console.log(products);
    res.render('products', {products});
});

module.exports = router;