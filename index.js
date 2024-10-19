const express = require('express')
const connectDB = require('./mongodb/connectDB')
const User = require('./models/User')
const app = express()
const bcrypt = require('bcryptjs');
const port = process.env.PORT || 3000
const cors = require('cors')
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const multer = require('multer');
const Product = require('./models/Product');
const Categories = require('./models/Category');
const Category = require('./models/Category');
const userRouter = require('./routers/UserRouter');
const SearchRouter = require('./routers/SearchBusRouter');
const ReviewRouterClint = require('./routers/ReviewRouter');
const Reservation = require('./models/Reservation');
const Chairs = require('./models/ConfirmPayment');
require('dotenv').config();
const stripe = require('stripe')('sk_test_51PDqAJP7DuJ1bxg98QMZ7sMJtpg3SxWCzeGcqAk7XIs4g2tQuz1YSKQRmqf1o9UdpZjDqhAfs6FIrLNCYn4GQ9iE004h3sBMlP');


const secretKey = 'your-secret-key';

// App configuration  
app.use(express.json())
app.use(bodyParser.json());

const corsOptions = {
    origin: ['https://bus-mkyx.onrender.com', 'http://localhost:5173'],
    // origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

app.use(cors(corsOptions));


app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Conect Mongoose configuration
connectDB()


// uploads Images
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
})

const upload = multer({ storage });



// app routers 
app.use('/api', userRouter)
app.use('/api', SearchRouter)
app.use('/api', ReviewRouterClint)



// Route for creating a new user
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body

    console.log(name, email, password);

    // Check if user already exists
    const NewUser = await User.findOne({ email })
    if (NewUser) {
        return res.status(400).send({ message: 'User already exists' })
    }
    const hashpassword = bcrypt.hashSync(password, 10)
    const user = new User({
        name,
        email,
        password: hashpassword,
        role: 'user'
    })
    user.save().then(user => res.json({ user }))
})

// Update user 
app.put('/api/user/:id', upload.single('image'), async (req, res) => {
    const { name, email } = req.body
    const { id } = req.params
    const imagePath = req.file ? req.file.path : null;

    try {
        const uploadeData = { name, email }
        if (imagePath) {
            uploadeData.image = imagePath
        }
        const user = await User.findByIdAndUpdate(id, uploadeData, { new: true });
        res.status(200).json(user)
    } catch (error) {
        console.log(error);
    }
})


// route for Login user#
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).send({ message: 'User not found' })
        }

        if (user.isBlocked) {
            return res.status(403).send('User is blocked');
        }

        // Compare password
        const IsPasswordValid = await bcrypt.compareSync(password, user.password)
        if (!IsPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, secretKey, { expiresIn: '5h' });
        res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'None', role: user.role });

        console.log('Login successful, token issued');
        res.json({ token, role: user.role });
    } catch (error) {
        console.log(error);
    }

})


// route for authenticated user
app.get('/api/user', async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');

        if (!token) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const decoded = jwt.verify(token, secretKey);
        if (!decoded) {
            return res.status(403).json({ message: 'Access denied' });
        };

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        res.json({
            role: user.role,
            user: user,
            token: token
        });

    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get All Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE User
app.delete('/api/user/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Block User
app.put('/api/user/block/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({ message: 'User blocked successfully' });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Search Users
app.post('/api/users', async (req, res) => {
    const { email } = req.body
    console.log(email);
    try {
        const users = await User.find({ email });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Log out the user
app.post('/api/user/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Logged out' });
})

// Add Category
app.post('/api/categories', upload.single('image'), async (req, res) => {
    const { title } = req.body;

    const NewCategory = await Category.findOne({ title })
    if (NewCategory) {
        return res.status(400).json({ message: 'Category already exists' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'Image is required' });
    }

    const imageCategory = req.file.path;

    try {
        const category = new Category({
            title,
            image: imageCategory,
            date: new Date().toDateString(),
            time: new Date().toLocaleTimeString()
        });

        await category.save();
        res.status(201).json(category);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category title must be unique' });
        }
        console.error('Error saving category:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// get category
app.get('/api/categorys', async (req, res) => {
    try {
        const category = await Category.find()
        if (category.length === 0) {
            return res.status(404).json({ message: 'No categories found' });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
})

// View the categories
app.get('/api/category/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Server error' });
    }
})

// Delete category
app.delete('/api/category/delete/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server error' });
    }
})

// Update category

app.put('/api/category/update/:id', upload.single('image'), async (req, res) => {
    const { title } = req.body;
    const updatedCategory = {};

    if (req.file) {
        updatedCategory.image = req.file.path;
    }

    if (title) {
        updatedCategory.title = title;
    }

    try {
        let category = await Category.findByIdAndUpdate(req.params.id, updatedCategory, { new: true });
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.send(category);
    } catch (error) {
        res.status(400).send('Error updating category');
    }
});


// Add Products 
app.post('/api/products', upload.single('image'), async (req, res) => {
    const { title, description, form, to, chairAll, price, category, quantity, inTime, outTime, busNumber, image, date } = req.body
    if (!req.file) {
        return res.status(400).send({ message: 'No image provided' });
    }
    const imagePath = req.file.path;

    const product = new Product({
        title,
        date,
        category,
        description,
        price,
        quantity,
        // chairAll,
        image: imagePath,
        inTime: inTime,
        outTime: outTime,
        busNumber: busNumber,
        form,
        to,

        // date: new Date().toDateString(),
        // time: new Date().toLocaleTimeString()
    });
    product.save().then(product => res.json(product))
})

// get products
app.get('/api/products', (req, res) => {
    Product.find()
        .then(products => res.json(products))
        .catch(err => res.status(400).json('Error:' + err));
})


// Delete product 
app.delete('/api/product/delete/:id', (req, res) => {
    Product.findByIdAndDelete(req.params.id)
        .then(() => res.json('Product deleted.'))
        .catch(err => res.status(400).json('Error:' + err));
})

// View the product


app.get('/api/product/:id', (req, res) => {
    Product.findById(req.params.id)
        .then(product => res.json(product))
        .catch(err => res.status(400).json('Error:' + err));
})


// Update product
app.put('/api/product/update/:id', upload.single('image'), (req, res) => {
    let updatedProduct = {};

    if (req.file) {
        updatedProduct.image = req.file.path;
    }

    if (req.body.title) {
        updatedProduct.title = req.body.title;
    }

    if (req.body.description) {
        updatedProduct.description = req.body.description;
    }

    if (req.body.price) {
        updatedProduct.price = req.body.price;
    }

    if (req.body.quantity) {
        updatedProduct.quantity = req.body.quantity;
    }

    if (req.body.inTime) {
        updatedProduct.inTime = req.body.inTime;
    }

    if (req.body.outTime) {
        updatedProduct.outTime = req.body.outTime;
    }
    if (req.body.form) {
        updatedProduct.form = req.body.form;
    }
    if (req.body.to) {
        updatedProduct.to = req.body.to;
    }
    if (req.body.category) {
        updatedProduct.category = req.body.category;
    }
    if (req.body.date) {
        updatedProduct.date = req.body.date;
    }


    Product.findByIdAndUpdate(req.params.id, updatedProduct, { new: true })
        .then(product => res.json(product))
        .catch(err => res.status(400).json('Error:'))

});

// update Chair 
app.put('/api/product/AddChair/update/:productId/chair/:chairId', (req, res) => {
    Product.findOneAndUpdate(
        { _id: req.params.productId, 'chairAll._id': req.params.chairId },
        {
            $set: { 'chairAll.$.chair': req.body.chair }
        },
        { new: true }
    )
        .then(product => {
            if (!product) {
                return res.status(404).json({ error: 'Chair not found' });
            }
            console.log('Updated Product:', product);
            res.json(product);
        })
        .catch(err => {
            console.log('Error:', err);
            res.status(400).json('Error: ' + err);
        });
});





// reservation

app.post('/api/reservations', (req, res) => {
    const { name, phone, productId, chair, lengthChairs, userId, totalPrice, email, address, busNumber, from, to, outTime, dateNow, inTime, date } = req.body;

    try {
        const newReservation = new Reservation({
            name,
            phone,
            email,
            busNumber,
            inTime,
            outTime,
            from,
            to,
            date,
            dateNow,
            address,
            chair,
            productId,
            userId,
            totalPrice,
            lengthChairs,
            productId,
        });
        // console.log(newReservation)
        newReservation.save()
        return res.status(201).json(newReservation)

    } catch (error) {

        console.error('Error saving reservation:', error)
        res.status(500).json({ message: 'Server error' })
    }
})

app.get('/api/reservations', (req, res) => {
    Reservation.find()
        .then(reservations => res.json(reservations))
        .catch(err => res.status(400).json('Error:' + err));
})




// Add Stripe 
app.post('/create-payment-intent', async (req, res) => {
    const { amount, name, productId, lengthChairs, currency, items, customer, email, inTime, outTime, date, to, from } = req.body;
    try {
        // Create paymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency,
            payment_method_types: ['card'],
            metadata: {
                items: JSON.stringify(items),
                customer,
                email,
            },
        });


        // Set Data For Payment
        const newChair = new Chairs({
            amount,
            currency,
            items,
            customer,
            email,
            inTime,
            outTime,
            date,
            to,
            from,
            name,
            paymentIntentId: paymentIntent.id,
            lengthChairs,
            productId,
        })
        newChair.save()
        console.log(newChair)
        res.status(200).json({ clientSecret: paymentIntent.client_secret, payload: newChair });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/UpdateChair/update/:productId/chair/:chairId', (req, res) => {
    console.log('Product ID:', req.params.productId);
    console.log('Chair ID:', req.params.chairId);
    console.log('Request Body:', req.body);

    const { productId, chairId } = req.params;

    Chairs.findOneAndUpdate(
        { _id: productId, 'items.chairId': chairId }, // التأكد من مطابقة `productId` و `chairId`
        {
            $set: { 'items.$.status': req.body.chair } // تحديث حالة الكرسي
        },
        { new: true } // إرجاع المنتج المحدث
    )
        .then(product => {
            if (!product) {
                return res.status(404).json({ error: 'Chair not found' });
            }
            console.log('Updated Product:', product);
            res.json(product);
        })
        .catch(err => {
            console.log('Error:', err);
            res.status(400).json('Error: ' + err);
        });
});



// Delete payment
app.delete('/api/payment/:id', (req, res) => {
    Chairs.findByIdAndDelete(req.params.id)
        .then(() => res.json('Payment deleted.'))
        .catch(err => res.status(400).json('Error:' + err));
})


// get payment 
app.get('/api/payment', async (req, res) => {
    Chairs.find()
        .then(payment => res.json(payment))
        .catch(err => res.status(400).json('Error:' + err));
})


app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.listen(port, () => {
    console.log(`Example app listening on port  http://localhost:${port}`)
})