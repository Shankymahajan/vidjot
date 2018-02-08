const express = require('express');
const exphbs  = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const app = express();

// Map global promise - get ride of warning 
mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', {
//there is no use now    
// useMongoClient: true  
}) 
//promises 
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));


// Load Idea Model
require('./models/Idea');
const Idea = mongoose.model('ideas');



// Handlerbars middleware 
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body Parse Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Method Override Middleware
app.use(methodOverride('_method'));

// Express session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));

  app.use(flash());

  // Global variables
  app.use(function(req,res,next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });


// EXAMPLE: How middleware works
// app.use(function(req,res,next){
//    // console.log(Date.now());
//     req.name = 'Shashank';

//     next();
// });


// Index route
//get request
app.get('/', function(req, res){
    const title = 'Welcome shashank' ;
    console.log(req.name);
    res.render('Index', {
        title : title

    });
    
    
});


// About Route
app.get('/about', function (req,res) {
    res.render('about');
});

// Idea index page
app.get('/ideas', function(req,res){
    Idea.find({})
    .sort({date:'desc'})
    .then(ideas => {
        res.render('ideas/index', {
            ideas : ideas
        });
    });
});

// Add Idea Form
app.get('/ideas/add', function (req,res) {
    res.render('ideas/add');
});

// Edit Idea Form
app.get('/ideas/edit/:id', function(req,res) {
    Idea.findOne ({
        _id: req.params.id
    })
    .then(idea => {
        res.render('ideas/edit',{
            idea:idea
        });
    });
});


// Process Form
app.post('/ideas', function (req,res) {
    let errors = [];
    if (!req.body.title){
        errors.push({text: 'Please add a title '});
    }
    if(!req.body.details){
        errors.push({text: 'Please add some details'});
    }
    if(errors.length > 0 ){
        res.render('ideas/add' , {
            errors : errors ,
            title : req.body.title,
            details : req.body.details
        });
    } else{
        const newUser ={ 
            title: req.body.title,
            details : req.body.details
        }
        new Idea(newUser)
        .save()
        .then(idea =>{
            res.redirect('/ideas');
        })
    }
});

// Edit Form Process
app.put('/ideas/:id', function(req,res){
    Idea.findOne({
        _id: req.params.id
    })    
    .then(idea => {
        //new values after editing video idea
        idea.title = req.body.title;
        idea.details = req.body.details;

        idea.save()
        .then(idea => {
            res.redirect('/ideas');
        })
    });

});

// Delete idea
app.delete('/ideas/:id', function(req,res) {
    Idea.remove({_id : req.params.id})
    .then(() => {
        req.flash('success_msg', 'Video idea removed');
        res.redirect('/ideas');
    });
});

const port = 5000;

app.listen(port, function(){
    //not concadinate the port  by +
    console.log(`Server started on port ${port}`);


});