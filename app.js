//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Sahil:test-123@cluster0.gr3sp.mongodb.net/todolistDB");

const itemSchema = new  mongoose.Schema({
  name: {
    type : String,
    // required : true
  }
});

const listSchema = new mongoose.Schema({
  name: String ,
  items: [itemSchema]
})
const List = new mongoose.model("List" , listSchema);

const Item = new mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome To Your Todolist"
})

const item2 = new Item({
  name: "Press + button to  add a Task"
})

const item3 = new Item({
  name: "<-- hit the - button to remove a Task"
})

const defaultItems = [item1 ,item2 ,item3];
// Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("all the items are inserted Succesfully")
//   }
// })
// Item.deleteMany({name: "<-- hit the - button to remove a Task"}, {name: "Press + button to  add a Task"}, {name:"Welcome To Your Todolist"}] , function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("items are deleted");
//   }
// })

// Item.find({}, function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("all the items are read Successfully");
//   }
// })




app.get("/", function(req, res) {
  Item.find({}, function(err , foundItems){

    if( foundItems.length === 0 ){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("all the items are inserted Succesfully")
        }
      })
      res.redirect("/");

    }

    else{
      res.render("list", {listTitle:"Today", newListItems: foundItems});
      }
  })

// const day = date.getDate();




});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listNameInpage = req.body.list; //  here i am using the value of button to get hold on listTitle
  const item4 = new Item ({
    name: itemName
  })
  item4.save();


  if( listNameInpage === "Today"){

    res.redirect("/");
  }else{
    List.findOne({name:listNameInpage}, function(err , foundList){
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/"+listNameInpage);
    })
  }



  // const item = req.body.newItem;
  //
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");

});

app.post("/delete", function( req , res){
  const checkedItemId = req.body.checkbox;
  const currList =req.body.listName;

  if( currList === "Today"){                                                          // here in this case i am getting name of the currlist by the req.body.listName
    Item.deleteOne({_id:checkedItemId}, function(err){                                // the listName is the name of input which i make a hidden type ,so we can access
      if(err){                                                                        // the list which we are currently in , after getting the information about the list
        console.log(err);                                                             // we simply check if the list is today then we take the Item model and delete the item
      }                                                                               // from the item db by getting its id , for other case all the other list are in the list Db and we have to delete from that db
      else{                                                                           // so we have some complexity like we have to delete a item form the items array
        console.log("your Item is Successfully deleted");                             // so for that we have to use loop but we have more easy way to do this which is $pull
      }                                                                                //for $pull we have to give and array and a specification about the element which we want to delete
    });                                                                                //so we give id of that element to pull method-12  `qq456879-/*9+`
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:currList},{$pull: {items:{_id:checkedItemId}}},function(err, foundItem){
      if( !err){
        res.redirect("/"+currList);
      }
    });
  }

})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
//
// app.get("/about", function(req, res){
//   res.render("about");
// });


app.get("/:paramName", function(req,res){
  const listName =_.capitalize(req.params.paramName);
  // List.forEach(function(list){
  //   if( listName === list.name){
  //     console.log("already exist");
  //   }
  //   else{
  //     console.log("can be inserted");
  //   }
  // })
  //
  // const list = new List ({
  //   name: listName,
  //   items: defaultItems
  // });
  // list.save();
  const existingName = List.findOne({name:listName} , function(err,results){ // by findOne method we can find the any document with specifying the name
    // of that item it will take two items one  specification document and having a call back function which also have  two parameters , they are err and results
    // results are items that are found by the specification and the error is the error that we get if something is not going properly
    // the code below is showing that if we get a result which having a nome equal to listname the we get exist in the terminal otherwise we not exist
    if(err){
      console.log(err);
    }else{
      if(!results){
        // create list items
        const list = new List({
          name: listName,
          items: defaultItems
          })
        list.save();
        res.redirect("/"+ listName)
      }else{

        // show list items
        res.render("list" , {listTitle: listName , newListItems: results.items})


      }
    }
  });

  // if ( )

})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
