// This file contains the routing rules for the app

let express = require('express');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({extended:true});
let jsonParser = bodyParser.json({});

var multer  = require('multer');
var upload = multer({
    dest: 'public/image/',   // Folder to store the uploaded file

    // Callback that decides whether to accept or skip the uploaded file
    fileFilter: function(req, file, cb) {
        // if the uploaded file's mimetype begins with "image"
        if (file.mimetype.slice(0,5) == 'image')
            cb(null, true); // Accept

        // Any non-null first parameter is treated as an error
        else cb("Not an image file!");
    },

    // Options representing various limits to be enforced; here we only
    // set the maximum file size to 1MB
    limits: { fileSize: 1048576*10 }
});


// For constructing query string from object properties
const Query = require('query-string');

// For convenience, just name the router 'app'
let app = require('express').Router();

app.use(express.static('public'));

let model = require('./model.js');

module.exports=app;

var islogin = function(req){
  return !(req.session.user == undefined);
}

var islogin2 = function(req){
    return !(req.session.admin == undefined);
}

// Use a separate router for ajax request
app.use('/ajax', require('./ajaxRoutes.js'));


app.get('/login', (req, res) => {
   if (!islogin(req))
      res.render('login.ejs', { title: 'Login Page', user: null, admin: 0});
   else{
     res.redirect('/');
   }
});

// for admin login
app.get('/login2', (req, res) => {
    if (!islogin2(req))
        res.render('login2.ejs', { title: 'Login Page', user: null, admin: 0});
    else{
        res.redirect('/admin');
    }
});

app.post('/login', urlencodedParser, async (req, res) => {
    let result = await model.authenticate(req.body.uname, req.body.pword);
    if (result) {
        // req.session.regenerate() is asynchronous but it does not return a promise.
        // In order to use await, the function call is then wrapped in a Promise object
        await new Promise((resolve, reject) => {
            req.session.regenerate(resolve);      // Recreate the session
        });
        req.session.user = req.body.uname;  // To represent successful login
        res.redirect('/');
    } else {
        req.session.destroy(() => {
        });  // Safe asyncrhous call
        res.render('login.ejs',
            {
                title: 'Login Page',
                loginMsg: 'Incorrect username or password! Please try again.',
                username: req.body.uname,
                admin:0
            });
    }
});


app.post('/login2', urlencodedParser, async (req, res) => {
    let result = await model.authenticate2(req.body.uname, req.body.pword);
    if (result) {
        // req.session.regenerate() is asynchronous but it does not return a promise.
        // In order to use await, the function call is then wrapped in a Promise object
        await new Promise((resolve, reject) => {
            req.session.regenerate(resolve);      // Recreate the session
        });
        req.session.admin = req.body.uname;  // To represent successful login
        res.redirect('/admin');
    } else {
        req.session.destroy(() => {
        });  // Safe asyncrhous call
        res.render('login2.ejs',
            {
                title: 'Login Page',
                loginMsg: 'Incorrect username or password! Please try again.',
                username: req.body.uname,
                admin:0,
            });
    }
});


app.get('/logout', (req, res) => {
  req.session.destroy(()=>{});   // Safe asyncrhonus call
  res.redirect('/');
});

app.get('/', async (req, res) => {
    try {
        var user=null;
        var admin=0;
        if (islogin(req)) {
            user = await model.getUser(req.session.user);
            //console.log(user);
        }
        if (islogin2(req)) {
            admin=123;
        }
        res.render('index.ejs', {title: 'Main', user: user,admin:admin});
    } catch (err){
        console.log(err);
    }
});

// Approach #1
app.get('/listItems', (req, res) => {
  // Simply return the HTMl page.
  // Use client-side JS to retrieve data and render page
  res.render('listItems.ejs', { title: 'Item Listing' });
});

// Approach #2: Render the page on server side
app.get('/listItems2', async (req, res) => {
  try {
      var user=null;
      var admin=0;
      if (islogin(req)) {
          user = await model.getUser(req.session.user);
      }
      if (islogin2(req)) {
          admin=123;
      }
    // Step 1: Retrieve input data from the request
    let page = req.query.page-0;       // Convert to number
    let orderBy = req.query.orderBy-0; // Convert to number
    let order = req.query.order-0;     // Convert to number
      let username = req.query.username;
      //console.log(username);

    // Step 2 (TODO): Validate input and check if the user
    // has the right to proceed.
      if (username){
          if (req.session.user && req.session.user == username){
              let pageData = await model.getItemsWithUsername(page, orderBy, order, username);
              // Step 5: Render the view
              res.render('listItems2.ejs', { title: 'Item Listing', pageData: pageData, Query: Query, user:user, admin:admin});

          }else{
              res.redirect('/listItems2');
          }
      }
      else{
          let pageData = await model.getItems(page, orderBy, order);
          // Step 5: Render the view
          res.render('listItems2.ejs', { title: 'Item Listing', pageData: pageData, Query: Query, user:user,admin:admin});
      }

  } catch (err) {
    console.error(err);
    res.status(500).send('Error!');
  }
});

app.get('/listUserItems', async (req, res) => {
    try {
        var user=null;
        var admin=0;
        if (islogin(req)) {
            user = await model.getUser(req.session.user);
        }
        if (islogin2(req)) {
            admin=123;
        }
        // Step 1: Retrieve input data from the request
        let page = req.query.page-0;       // Convert to number
        let orderBy = req.query.orderBy-0; // Convert to number
        let order = req.query.order-0;     // Convert to number
        let username = req.query.username;
        //console.log(username);

        // Step 2 (TODO): Validate input and check if the user
        // has the right to proceed.
        if (username){
            if (req.session.user && req.session.user == username){
                let pageData = await model.getItemsWithUsername(page, orderBy, order, username);
                // Step 5: Render the view
                res.render('listUserItems.ejs', { title: 'Item Listing', pageData: pageData, Query: Query, user:user, admin:admin});

            }else{
                res.redirect('/listUserItems');
            }
        }
        else{
            res.redirect('/login');
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Error!');
    }
});


app.get('/item', async (req, res) => {

  try {
      var user=null;
      if (islogin(req)) {
          user = await model.getUser(req.session.user);
      }
      var admin=0;
      if (islogin2(req)) {
          admin=123;
      }
    let itemId = req.query.id;
    let data = await model.getItem(itemId);
    // Data can be null if not found
    res.render('item.ejs', { title: 'Item', data: data, Query: Query, user:user, admin:admin });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error!');
  }

});

app.get('/downloadcsv',async(req,res)=>{
     try{
         var admin = null;
         if (islogin2(req)){
         //if (true){
            let result = await model.getCSV();
            if(result){
                res.set({
                    'Content-Disposition': 'attachment; filename=data.csv',
                    'Content-Type': 'text/csv'
                });
                res.send(result);
            }else{
                res.redirect("/login2");
            }
         }else{
             res.redirect("/login2");
         }
     }catch(err){console.log(err);}

});

//admin page
app.get('/admin', async(req,res)=>{
    try{
        if (islogin2(req)){
            let myData = await model.getItemsAdmin();
            //res.send(myData);
            res.render("admin.ejs", {items:myData,Query: Query,});
        }else{
            res.redirect("/login2");
        }
    }catch(err){console.log(err);}
});

app.get('/admin/create', async(req,res)=>{
    if (islogin2(req)){
        res.render("create.ejs",{admin:123});
    }else{
        res.redirect("/login2");
    }

});

app.post('/admin/create',upload.single('myfile'), urlencodedParser, async(req,res)=>{
    if (islogin2(req)){
        var owner = null;
        var title = req.body.title ? req.body.title:"title";
        var description = req.body.description ? req.body.description:"dessss";
        var img = req.file.filename ? req.file.filename : "sample.jpg";
        img="/image/"+img;
        var tokenValue = req.body.tokenValue ? req.body.tokenValue:5;
        var availableQuantity = req.body.availableQuantity ? req.body.availableQuantity:1;
        var createdOn = Date.now();
        var redeemedOn = null;
        var tags = req.body.tags.split(',') ? req.body.tags.split(','):[];

        model.Item.create({owner: owner, title:title, description:description, img:img, tokenValue:tokenValue,
        availableQuantity:availableQuantity, createdOn:createdOn, redeemedOn:redeemedOn,tags:tags}, function(err,result){
            if(err) {console.log(err);res.send("fail");}
            else{
                res.redirect('/admin');
            }
        });
    }
    else{
        res.redirect('/login2');
    }

});


app.get('/admin/update', async(req,res)=>{
    if (islogin2(req)){
        var item_id = req.query.item_id;

        model.Item.findOne({"_id":item_id}, function(err, result){
            if(!result)
                res.send("no item found");
            else
                res.render("update.ejs", {item: result});
        });
    }
    else{
        res.redirect('/login2');
    }

});

app.post('/admin/update',upload.single('myfile'), urlencodedParser, async(req,res)=>{
    if (islogin2(req)){
        var owner = null;
        var title = req.body.title ? req.body.title:"title";
        var description = req.body.description ? req.body.description:"dessss";
        var img = req.file ? ("/image/"+req.file.filename) : req.body.img;
        var tokenValue = req.body.tokenValue ? req.body.tokenValue:5;
        var availableQuantity = req.body.availableQuantity ? req.body.availableQuantity:1;
        var redeemedOn = null;
        var tags = req.body.tags.split(',') ? req.body.tags.split(','):[];
        var condition = {_id: req.body.item_id};
        var update = {$set:{owner: owner, title:title, description:description, img:img, tokenValue:tokenValue,
            availableQuantity:availableQuantity, redeemedOn:redeemedOn,tags:tags}};

        model.Item.update(condition, update, function(err,result){
            if(err) console.log(err);
            else
                res.redirect("/admin");
        });
    }
    else{
        res.redirect('/login2');
    }

});

app.post('/admin/delete', urlencodedParser, async(req,res)=>{
    if (islogin2(req)){
        var item_id = req.body.item_id;
        console.log(item_id);

        model.Item.remove({"_id":item_id}, function(err, result){
            res.redirect("/admin");
        });
    }
    else{
        res.redirect('/login2');
    }

});


//given username, item_id, quantity
app.post('/item', urlencodedParser, async(req,res)=>{
    try {
        if (islogin(req)) {
            let username = req.body.username;
            let item_id = req.body.item_id;
            let quantity = req.body.quantity - 0;

            if (req.session.user && req.session.user == username) {
                let item = await model.Item.findOne({"_id": item_id}).exec();
                let user = await model.User.findOne({username: username}).exec();

                if (item.availableQuantity < quantity)
                    quantity = item.availableQuantity;
                let newQuantity = item.availableQuantity - quantity;

                let newBalance = user.balance - item.tokenValue*quantity;
                //console.log(newBalance);
                if (newBalance < 0){
                    res.send("Out of Token!!");
                }
                else if(item.owner!=null){
                    res.send("Others Item");
                }
                else{
                    await model.Item.create({
                        owner: user._id,
                        title: item.title,
                        description: item.description,
                        img: item.img,
                        tokenValue: item.tokenValue,
                        availableQuantity: quantity,
                        createdOn: item.createdOn,
                        redeemedOn: Date.now(),
                        tags: item.tags
                    });

                    await model.User.update({_id: user._id},{$set: {balance: newBalance}}).exec();

                    if (newQuantity != 0) {
                        var condition = {_id: item._id};
                        var update = {$set: {availableQuantity: newQuantity}};
                        await model.Item.update(condition, update).exec();
                    }
                    else {
                        await model.Item.remove({"_id": item_id}).exec();
                    }
                    res.redirect("/listItems2");

                }
            }
            else{
                res.redirect("login");
            }

        }
        else {
            res.redirect("/login");
        }
    }catch(err){console.log(err);res.send("error")};

});




// CSS files, images, client-side JS files should be in ./public
app.use(express.static('../public'));
app.use('/img',express.static('public/image'));
