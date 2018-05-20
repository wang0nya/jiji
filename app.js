const   express = require ('express');
        app     = express();
        bodyParser  = require('body-parser');
        mongoose    = require('mongoose');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

//landing page
app.get('/', (req, res) => {
    res.render('index');
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

// start server
app.listen(3000, ()=> {
    console.log('server started');
});