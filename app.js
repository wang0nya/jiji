const   express = require ('express');
        app     = express();
        bodyParser  = require('body-parser');
        mongoose    = require('mongoose');
        Image       = require('./models/images');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

//connect to db
mongoose.connect('mongodb://localhost/jiji');

//landing page
app.get('/', (req, res) => {
    // Get all images from DB
    Image.find({}, (e, allImages)=>{
        if (e) {
            console.log(e);
        }
        else {
            console.log('good to go');
            res.render('index', {images: allImages});
        }
    });
});

//about page
app.get('/about', (req, res) => {
    res.render('about');
});

//blog page
app.get('/blog', (req, res) => {
    res.render('blog');
});

//contact page
app.get('/contact', (req, res) => {
    res.render('contact');
});

//post new image
app.post('/', (req, res) => {
    const name = req.body.name;
    const image = req.body.image;
    const caption = req.body.caption;
    const newImage = {name: name, image: image, caption: caption};
    // create a new image and save to DB
    Image.create(newImage, (e, newlyCreated)=>{
        if (e) {
            console.log(e);
        }
        else {
            res.redirect('/');
        }
    });
});

// start server
app.listen(3000, ()=> {
    console.log('server started');
});