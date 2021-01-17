//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-jeremy:wwjdwwjd@personal-jeremy.ie6rg.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully savevd default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT ||3000, function() {
  console.log("Server started on port 3000");
});

// Alternatively, code can be run this way too. Few bugs below...tho..need to work on it
//
// const express= require("express");
// const bodyParser = require("body-parser");
// const mongoose=require("mongoose");
// const app= express();
//
//
// app.set("view engine","ejs");
// app.use(express.static("public"));
// app.use(bodyParser.urlencoded({extended: true}));
// var trigger=0;//to check if first entry has been made or not
// var topic_name="Home";
//
// mongoose.connect('mongodb://localhost:27017/todolistDB').then(() => console.log('Connected to MongoDB...')).catch((err) => console.error("Coudn't connect MongoDB....", err));
//
// const itemSchema= new mongoose.Schema(
//   { name: String}
// );
//
// const Item= mongoose.model('Item',itemSchema);
//
//
//
// app.listen(3000, function(req, res){
//   console.log("Server is up and listening on port 3000");
// })
//
// const listSchema= new mongoose.Schema(
//   { name: String,
//   items:[itemSchema]}
// );
//
// const List=mongoose.model("List",listSchema);
//
//
// app.get("/:topic", function(req, res){
//   topic_name=req.params.topic;
//
// List.findOne({name:topic_name},function(err,data){
//
// if(!err){
// if(data.length!=0)
// {
//   //This means that thie list has already been created. Modifyiny is all that is required
// }else{
// //We must create a new document for this list_task
// const list_task=new List({ //create a new Document, this document is entirely devoted to that user defined list(routing parameter)
//   name:topic_name,
// });
// list_task.save();
// }
//
// res.render("list",{itemsinlist:data.items})//filelist
//   }
// })
//
//
//
// })
//
// app.get("/", function(req,res){
// topic_name="Home";//set topic name to home
//
//   Item.find({}, function(err, data){
//       if(err){
//           console.log(err);
//           return
//       }
// // if(trigger==0){
//       if(data.length == 0) {
//         Item.insertMany([{ name: 'Welcome' },{name:"Press + To Insert New Tasks"},{name:"Check Respective boxes to Delete"}], function(err) {
//           if (err)
//           console.log("Error! Document can't be saved. Check");
//           else
//           console.log("Default Items have been registered");
//         })
//         res.render("list",{itemsinlist:data});}
//       // }
// else
//     res.render("list",{itemsinlist:data});
//   })})
//
// app.post("/delete",function(req,res){
//
// var item_id=req.body.checked;
// Item.deleteOne({ _id: item_id}, function (err) {
//   if (err)
//   console.log("Error! Document can't be deleted. Check");
//   else
//   {
//     console.log("Item has been deleted");
//     res.redirect("/");
//   }
//
// });});
//
// app.post("/", function(req,res){
//   var item_name=req.body.task;
// if(topic_name=="Home")
// {
//   const new_item = new Item({ name: item_name});
//   new_item.save(function (err) {
//     if (err)
//     console.log("Error! Document can't be saved. Check");
//     else
//     console.log("Item has been registered");
//     // saved!
//   });
//   res.redirect("/");
// }
// else{
//
//   List.findOne({name:topic_name},function(err,data){
// if(!err)
// data.items.push(item_name);
// data.save();
// console.log(data);
// res.redirect("/"+topic_name);
//   })
// }
// // if(trigger==0){
// //   trigger=1;
// //   Item.deleteOne({ name:'Welcome' }, function (err) {
// //     if (err)
// //     console.log("Error! Document can't be deleted. Check");
// //     else
// //     {
// //       console.log("Item has been deleted");
// //       res.redirect("/");
// //     }
// //
// //   });
// //
// //   Item.deleteOne({ name:"Press + to insert NEW TASKS" }, function (err) {
// //     if (err)
// //     console.log("Error! Document can't be deleted. Check");
// //     else
// //     {
// //       console.log("Item has been deleted");
// //       res.redirect("/");
// //     }
// //
// //   });
// //
// //   Item.deleteOne({ name:"Check the respective boxes for deletion"}, function (err) {
// //     if (err)
// //     console.log("Error! Document can't be deleted. Check");
// //     else
// //     {
// //       console.log("Item has been deleted");
// //       res.redirect("/");
// //     }
// //
// //   });
//
// });
