var mongoose = require('mongoose');
var passwordHash = require('password-hash');
var Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

var json2csv = require('json2csv');



var UserSchema = Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
    balance: {type: Number, default:0}
});

var AdminSchema = Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});


var ItemSchema = Schema({
  owner: { type: ObjectId, ref: 'User' },
    title: {type: String, default:'title'},
  description: { type: String, default: '' },
    img: {type: String, default:'default.jpg'},
    tokenValue: {type: Number, default: 1},
    availableQuantity: {type: Number, default: 1},
  createdOn: { type: Date, default: Date.now },
    redeemedOn: {type: Date, default: null},
  tags: [ { type: String } ]
});




var User = mongoose.model('User', UserSchema);
var Item = mongoose.model('Item', ItemSchema);
var Admin = mongoose.model('Admin', AdminSchema);


class PaginationData {
  constructor (props) {
    if (props === undefined)
      return;

    for (let key in props) {
      this[key] = props[key];
    }
  }

  validate() { // Ensure all required properties have a value.
    let requiredProperties =
      [ 'pageCount', 'pageSize', 'currentPage', 'items', 'params' ];
    for (let p of requiredProperties) {
      if (this[p] === undefined) {
        console.error(this, `Property '${p}' is undefined.`);
      }
    }
  }
}

// Place holder. The parameter orderBy is not used in this example.
async function getItems(page, orderBy, order) {

  // Determine the sorting order
  // In this example, orderBy == 1 => order by 'createdOn'
  orderBy = orderBy || 1;   // Default to 1
  order = (order == 1 || order == -1) ? order : 1;

  let pData = new PaginationData( {
     pageSize: 10,
     params: {
       orderBy: orderBy,
       order: order
     }
  });

  let condition = {owner:null};   // Retrieve all items with owner==null

  let itemCount = await Item.count(condition);

  pData.pageCount = Math.ceil(itemCount / pData.pageSize);

  // Ensure the current page number is between 1 and pData.pageCount
  page = (!page || page <= 0) ? 1 : page;
  page = (page >= pData.pageCount) ? pData.pageCount : page;
  pData.currentPage = page;

  // Construct parameter for sorting
  let sortParam = {};
  if (orderBy == 1)
    sortParam = { createdOn: order };
  else
      sortParam = {tokenValue: order};

  // ----- Construct query and retrieve items from DB -----
  // Construct query

  pData.items = await Item.
    find(condition).
    skip(pData.pageSize * (pData.currentPage-1)).
    limit(pData.pageSize).
    sort(sortParam).
    exec();

  pData.validate(); // Make sure all required properties exist.

  return pData;
}



async function getItemsWithUsername(page, orderBy, order, username) {

    // Determine the sorting order
    // In this example, orderBy == 1 => order by 'createdOn'
    orderBy = orderBy || 1;   // Default to 1
    order = (order == 1 || order == -1) ? order : 1;

    let pData = new PaginationData( {
        pageSize: 10,
        params: {
            orderBy: orderBy,
            order: order
        }
    });

    let user = await User.findOne({"username":username});

    let condition = {"owner": user._id};   // Retrieve all items

    let itemCount = await Item.count(condition);

    pData.pageCount = Math.ceil(itemCount / pData.pageSize);

    // Ensure the current page number is between 1 and pData.pageCount
    page = (!page || page <= 0) ? 1 : page;
    page = (page >= pData.pageCount) ? pData.pageCount : page;
    if (page==0) page=1;
    pData.currentPage = page;
    // Construct parameter for sorting
    let sortParam = {};
    if (orderBy == 1)
        sortParam = { createdOn: order };
    else sortParam = {tokenValue: order};

    // ----- Construct query and retrieve items from DB -----
    // Construct query

    pData.items = await Item.
    find(condition).
    skip(pData.pageSize * (pData.currentPage-1)).
    limit(pData.pageSize).
    sort(sortParam).
    exec();

    pData.validate(); // Make sure all required properties exist.

    return pData;
}


async function getItem(id) {
  let _id = new mongoose.Types.ObjectId(id);
  let result = await Item.
    findOne( {_id: _id} ).
    populate('owner', 'username'). // only return the owner's username
    exec();
  return result;
}

// Place holder for authentication
async function authenticate(username, password) {
    try {
        let results = await User.findOne({username: username});
        if (results == null) {
            return false;
        }
        else
            return passwordHash.verify(password, results.password);
    }catch(err){
        console.log(err);
    }

  //return (username === 'john' && password === '123');
}

// authentication for admin
async function authenticate2(username,password){
    try {
        let results = await Admin.findOne({username: username});
        if (results == null) {
            return false;
        }
        else
            return passwordHash.verify(password, results.password);
    }catch(err){
        console.log(err);
    }
}

async function getUser(username){
    let results = await User.findOne({username:username})
    if(results == null){
           return null;
    } else{
           //console.log(results);
           return {username:results.username, balance:results.balance};
    }

}

async function getCSV(){

    // let result = await Item.
    // findOne( {_id: _id} ).
    // populate('owner', 'username'). // only return the owner's username
    // exec();

    // pData.items = await Item.
    // find(condition).
    // skip(pData.pageSize * (pData.currentPage-1)).
    // limit(pData.pageSize).
    // sort(sortParam).
    // exec();

    var fields = ['_id', 'title', 'tokenValue', 'redeemedOn', 'owner.username'];

    let myData = await Item.find({"owner":{$ne:null}}).sort({"redeemedOn":1})
        .populate("owner","username").exec();

    try {
        var result = json2csv({ data: myData, fields: fields });
        result = result.replace("owner.username","owner");
        //console.log(result);
        return result;
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function getItemsAdmin(){
    let myData = await Item.find().sort({"createdOn":-1}).exec();

    return myData;
}

module.exports = {
  User: User,
  Item: Item,
    Admin: Admin,
  authenticate: authenticate,
    authenticate2: authenticate2,
  getItems: getItems,
  getItem: getItem,
    getUser: getUser,
    getCSV: getCSV,
    getItemsWithUsername: getItemsWithUsername,
    getItemsAdmin: getItemsAdmin
}
