//  OpenShift sample Node application
var express = require('express'),
  path = require('path');
app = express(),
  morgan = require('morgan');
  var fs = require('fs');
Object.assign = require('object-assign')
var flipkart = require('./routes/fapi');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));  
app.set('view engine', 'ejs');
app.use(morgan('combined'))
app.get('/viewProducts', function (req, res, next) {
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
      obj.title= items.productBaseInfoV1.title;
      obj.description = items.productBaseInfoV1.productDescription;
      obj.mrp = items.productBaseInfoV1.maximumRetailPrice.amount+ ' '  +items.productBaseInfoV1.maximumRetailPrice.currency;
      obj.sp = items.productBaseInfoV1.flipkartSellingPrice.amount+  ' '  +items.productBaseInfoV1.flipkartSellingPrice.currency;
      obj.image = items.productBaseInfoV1.imageUrls['400x400'];
      obj.color = items.productBaseInfoV1.attributes.color;
      obj.url= items.productBaseInfoV1.productUrl;
      products.push(obj);
      obj={};
  })
  res.render('products', {products});
});
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
  mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
  mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
    mongoPassword = process.env[mongoServiceName + '_PASSWORD']
  mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' + mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
  dbDetails = new Object();

var initDb = function (callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function (err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};
app.use(express.static(path.join(__dirname, 'public')));
app.get('/home', express.static(__dirname + '/resources'));
app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function (err) { });
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ ip: req.ip, date: Date.now() });
    col.count(function (err, count) {
      res.render('index.ejs', { pageCountMessage: count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.ejs', { pageCountMessage: null });
  }
});
app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function (err) { });
  }
  if (db) {
    db.collection('counts').count(function (err, count) {
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function (err) {
  console.log('Error connecting to Mongo. Message:\n' + err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;
