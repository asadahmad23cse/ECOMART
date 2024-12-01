const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
})();

// User Schema and Model
const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    city: { type: String },
    country: { type: String },
    address: { type: String },
});

const User = mongoose.model('User', UserSchema);

// Product Schema and Model
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    secondaryCategory: { type: String },
    quantity: { type: Number, required: true },
    barcode: { type: String, required: true, unique: true },
    weight: { type: String },
    packageSize: { type: String },
    price: { type: Number, required: true },
    comparePrice: { type: Number },
    images: { type: [String] }, // Array of image URLs
});

const Product = mongoose.model('Product', ProductSchema);

// Routes

// Sign-Up (Create User)
app.post('/api/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, city, country, address } = req.body;
        const newUser = new User({ firstName, lastName, email, phone, password, city, country, address });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login (Authenticate User)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        res.json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Profile
app.get('/api/profile/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update User Profile
app.put('/api/profile/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const updates = req.body;
        const updatedUser = await User.findOneAndUpdate({ email }, updates, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Product
app.post('/api/products', async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            secondaryCategory,
            quantity,
            barcode,
            weight,
            packageSize,
            price,
            comparePrice,
            images,
        } = req.body;

        const newProduct = new Product({
            name,
            description,
            category,
            secondaryCategory,
            quantity,
            barcode,
            weight,
            packageSize,
            price,
            comparePrice,
            images,
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Single Product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Product by ID
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Product by ID
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully', deletedProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
