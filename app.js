const   express         = require ('express'),
        app             = express(),
        bodyParser      = require('body-parser'),
        mongoose        = require('mongoose'),
        multer          = require('multer'),
        path            = require('path'),
        crypto          = require('crypto'),
        GridFsStorage   = require('multer-gridfs-storage'),
        Grid            = require('gridfs-stream'),
        methodOverride  = require('method-override'),
        User            = require('./models/user'),
        LocalStrategy   = require("passport-local"),
        passportLocalMongoose   = require("passport-local-mongoose"),
        passport        = require("passport");

// Middleware
app.use(express.static('public'));
app.use('/info', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(require("express-session")({
    secret:"When words become unclear, I shall focus with photographs. When images become inadequate, I shall be content with silence.",
    resave: false,
    saveUninitialized: false
}));
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//db uri
const mongoURI = 'mongodb://localhost/jiji';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads',
                    metadata: req.body
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });

// @route GET /
// @desc Loads form
app.get('/', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            res.render('index', { files: false });
        } else {
            files.map(file => {
                if (
                    file.contentType === 'image/jpeg' ||
                    file.contentType === 'image/png'
                ) {
                    file.isImage = true;
                } else {
                    file.isImage = false;
                }
            });
            res.render('index', { files: files });
        }
    });
});

// @route POST /upload
// @desc  Uploads file to DB
app.post('/upload', upload.single('file'), (req, res) => {
    console.log(req.body); //form fields
    console.log(req.file); //form files

    res.redirect('/');
});

// @route GET /files
// @desc  Display all files in JSON
app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }

        // Files exist
        return res.json(files);
    });
});

// @route GET /files/:filename
// @desc  Display single file object
app.get('/info/:md5', (req, res) => {
    gfs.files.findOne({ md5: req.params.md5 }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }
        // File exists
        res.render('info', {file: file});
    });
});

// @route GET /image/:filename
// @desc Display Image
app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    });
});

// @route DELETE /files/:id
// @desc  Delete file
app.delete('/files/:id', (req, res) => {
    gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
        if (err) {
            return res.status(404).json({ err: err });
        }

        res.redirect('/');
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

//login page
app.get('/login', (req, res) => {
    res.render('login');
});
app.post("/login", passport.authenticate("local"), ({
    successRedirect: "/secret",
    failureRedirect: "/login"
    }), (req, res)=> {
});

//register page
app.get('/register', (req, res) => {
    res.render('register');
});
app.post("/register", (req, res)=> {
    User.register(new User({
            username : req.body.username
        }),
        req.body.password, (err, user)=> {
            if(err){
                console.log(err);
                return res.render('register');
            }
            passport.authenticate("local")(req, res, ()=> {
                res.redirect("/");
            });
        });
});

//logout
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

// start server
app.listen(3000, ()=> {
    console.log('server started');
});