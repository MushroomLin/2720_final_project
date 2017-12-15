// This file contains code to repopulate the DB with test data

var mongoose = require('mongoose');
var passwordHash = require('password-hash');

require('./js/db.js'); // Set up connection and create DB if it does not exists yet

var model = require('./js/model.js');

// Remove existing data from Users and Items collections and
// repopulate them with test data
model.User.remove({}, function(err) {
  if (err)
    return console.log(err);

  model.Item.remove({}, function(err) {
    if (err)
      return console.log(err);

    model.Admin.remove({},function(err){
        if(err)
            return console.log(err);
    })

    // Populate data only after both collections are cleared.
    populateData();
  });
});

// ----------------------------------------------------------------------


function populateData() {
  var t = [ 'yummy', 'delicious', 'yuk', 'pretty', 'funny',
            'pricy', 'meh', 'interesting', 'omg', 'bravo' ];

  var items = [
    _item(0,'Apple', 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. ' +
        'Aenean massa strong. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. ' +
        'Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec ' +
        'pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis' +
        ' vitae, justo. Nullam dictum felis eu pede link mollis pretium. Integer tincidunt. Cras dapibus. Vivamus ' +
        'elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae,' +
        ' eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ' +
        'ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper' +
        ' ultricies nisi.',
        'images/sample.jpg',5,1, new Date(2016, 11, 1),new Date(2016, 12, 12), [t[0], t[1], t[3], t[4]]),
      _item(null,'Apple1', 'Apple Des', 'images/sample.jpg',6,1, new Date(2016, 11, 2),null, [t[0], t[1], t[3], t[4]]),
      _item(null,'Apple2', 'Apple Des', 'images/sample.jpg',7,1, new Date(2016, 11, 3),null, [t[0], t[1], t[3], t[4]]),
      _item(null,'Apple3', 'Apple Des', 'images/sample.jpg',8,1, new Date(2016, 11, 4),null, [t[0], t[1], t[3], t[4]]),
      _item(null,'Apple4', 'Apple Des', 'images/sample.jpg',9,1, new Date(2016, 11, 5),null, [t[0], t[1], t[3], t[4]]),
      _item(null,'Apple5', 'Apple Des', 'images/sample.jpg',10,1, new Date(2016, 11, 6),null, [t[0], t[1], t[3], t[4]]),
      _item(null,'Apple6', 'Apple Des', 'images/sample.jpg',11,1, new Date(2016, 11, 7),null, [t[0], t[1], t[3], t[4]]),
      _item(null,'Apple', 'Apple Des', 'images/sample.jpg',12,1, new Date(2016, 11, 8),null, [t[0], t[1], t[3], t[4]]),
      _item(null,'Apple11', 'Apple Des', 'images/sample.jpg',3,1, new Date(2016, 11, 9),null, [t[0], t[1], t[3], t[4]]),
      _item(null,'Apple2', 'Apple Des', 'images/sample.jpg',6,1, new Date(2016, 11, 10),null, [t[0], t[1], t[3], t[4]]),
      _item(3,'Apple3', 'Apple Des', 'images/sample.jpg',8,1, new Date(2016, 11, 11),null, [t[0], t[1], t[3], t[4]]),
      _item(0,'Apple4', 'Apple Des', 'images/sample.jpg',23,1, new Date(2016, 11, 12),null, [t[0], t[1], t[3], t[4]]),
      _item(2,'Apple5', 'Apple Des', 'images/sample.jpg',45,1, new Date(2016, 11, 13),null, [t[0], t[1], t[3], t[4]]),
      _item(4,'Apple6', 'Apple Des', 'images/sample.jpg',23,1, new Date(2016, 11, 14),null, [t[0], t[1], t[3], t[4]]),
      _item(0,'Apple', 'Apple Des', 'images/sample.jpg',5,1, new Date(2016, 11, 15),null, [t[0], t[1], t[3], t[4]]),
      _item(1,'Apple11', 'Apple Des', 'images/sample.jpg',5,1, new Date(2016, 11, 16),null, [t[0], t[1], t[3], t[4]]),
      _item(2,'Apple2', 'Apple Des', 'images/sample.jpg',5,1, new Date(2016, 11, 17),null, [t[0], t[1], t[3], t[4]]),
      _item(3,'Apple3', 'Apple Des', 'images/sample.jpg',5,1, new Date(2016, 11, 18),null, [t[0], t[1], t[3], t[4]]),
      _item(0,'Apple4', 'Apple Des', 'images/sample.jpg',5,1, new Date(2016, 11, 19),null, [t[0], t[1], t[3], t[4]]),
      _item(2,'Apple5', 'Apple Des', 'images/sample.jpg',5,1, new Date(2016, 11, 20),null, [t[0], t[1], t[3], t[4]]),
      _item(4,'Apple6', 'Apple Des', 'images/sample.jpg',5,1, new Date(2016, 11, 21),null, [t[0], t[1], t[3], t[4]])
    // _item(1, 'Orange', new Date(2016, 10, 10), [t[3], t[5], t[8], t[4]]),
    // _item(2, 'Strawberry', new Date(2016, 1, 12), [t[0], t[9], t[3], t[4]]),
    // _item(3, 'Watermelon', new Date(2016, 3, 13), [t[0], t[1], t[6], t[4]]),
    // _item(0, 'Pear', new Date(2016, 4, 30), [t[0], t[2], t[8], t[7]]),
    // _item(2, 'Peach', new Date(2016, 2, 20), [t[1], t[1], t[3], t[4]]),
    // _item(4, 'Pineapple', new Date(2016, 1, 15), [t[2], t[7], t[4], t[4]]),
    // _item(5, 'Grape', new Date(2016, 1, 1), [t[0], t[9], t[8], t[3]]),
    // _item(5, 'Banana', new Date(2016, 6, 20), [t[0], t[2], t[3], t[1]]),
    // _item(10, 'Mango', new Date(2016, 3, 10), [t[7], t[1], t[3], t[2]]),
    // _item(8, 'Plum', new Date(2016, 1, 20), [t[0], t[1], t[3], t[3]]),
    // _item(4, 'Lychee', new Date(2016, 10, 10), [t[0], t[1], t[7], t[4]]),
    // _item(8, 'Kiwi', new Date(2016, 9, 11), [t[9], t[4], t[8], t[2]]),
    // _item(7, 'Fig', new Date(2016, 1, 12), [t[2], t[1], t[5], t[6]]),
    // _item(1, 'Green Apple', new Date(2015, 11, 10), [t[0], t[2], t[4], t[7]]),
    // _item(1, 'Apricot', new Date(2015, 2, 12), [t[8], t[0], t[2], t[3]])
  ];

  // 11 users
  var users = [
    _user('john', 'john@example.com', '123',10000),
    _user('jane', 'jane@yahoo.com', '123',10),
    _user('eric', 'eric@gmail.com', '123',10),
    _user('matt', 'matt@gmail.com', '123',10),
    _user('jill', 'jill@yahoo.com', '123',10),
    _user('bill', 'bill@gmail.com', '123',10),
    _user('bob', 'bob@hotmail.com', '123',10),
    _user('charles', 'charles@hotmail.com', '123',10),
    _user('susan', 'susan@gmail.com', '123',10),
    _user('tanya', 'tanya@foo.com', '123',10),
    _user('fred', 'fred@bar.com', '123',10)
  ];

  var admins =[_admin("admin","123")];


  // Insert all users at once
  model.User.create(users, function(err, _users) {
    if (err) handleError(err);

    // _users are now saved to DB and have _id

    // Replace the owner indexes by their _ids
    for (var i = 0; i < items.length; i++) {
      var ownerIdx = items[i].owner;
      if (ownerIdx !== null){
          items[i].owner = _users[ownerIdx]._id;
      }
    }


    // Insert all items
    model.Item.create(items, function(err, _items) {
      if (err) handleError(err);

      // Success
      console.log(_users);
      console.log(_items);
        model.Admin.create(admins, function (err,_admins) {
            if (err) handleError(err);

            console.log(_admins);
            mongoose.connection.close();

        })

    });
  });
}

function _user(username, email, password, balance, items) {
  return {
    username: username,
    email: email,
    password: passwordHash.generate(password),
      balance: balance,
    items: items
  };
}

function _item(ownerIdx, title, description,img,tokenValue,availableQuantity, createdOn, redeemedOn, tags) {
  return {
    owner: ownerIdx,
      title:title,
    description: description,
      img:img,
      tokenValue:tokenValue,
      availableQuantity:availableQuantity,
    createdOn: createdOn,
      redeemedOn: redeemedOn,
    tags: tags
  };
}

function _admin(username,password){
    return {username:username, password:passwordHash.generate(password)};
}

function handleError(err) {
  console.log(err);
  mongoose.connection.close();
}
