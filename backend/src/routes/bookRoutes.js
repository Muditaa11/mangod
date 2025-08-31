import express from 'express';
import cloudinary from '../lib/cloudinary.js';
import Book from '../models/Book.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    
    try {
        const { title, caption, image, rating } = req.body;
        if (!title || !caption || !image || !rating) {
            return res.status(400).json({ error: "Title, caption, Image and rating are required" });
        }

        //upload image to cloudinary 
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;

        //save the url to mongodb
       const newBook = new Book({ title, caption, user: req.user._id});
        await newBook.save();

        res.status(201).json(newBook);
    } catch (error) {
        console.error("Error in POST /books:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//pagination => infinite loading
router.get("/", protectRoute, async (req, res) => {
    try {
        const page = req.query.page || 1; //default page 1
        const limit = req.query.limit || 5; //default 5 items
        const skip = (page - 1) * limit;
        const books = await Book.find().sort({ createdAt: -1 }).skip(skip)
        .limit(limit)
        .populate('user', 'username profileImage'); //populate user details
        const totalBooks = await Book.countDocuments();
        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });
    } catch (error) {
        console.error("Error in GET /books:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//get recommended books by the logged in user
router.get("/user", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate('user', 'username profileImage');
        res.json(books);
    } catch (error) {
        console.error("Error in GET /books/recommended:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }
        //check if the user is the owner of the book
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You are not authorized to delete this book" });
        }

        //delete image from cloudinary
        if(book.image && book.image.includes("cloudinary")){
            try {
            const publicId = book.image.split('/').pop().split('.')[0]; //extract public
            await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.error("Error deleting image from Cloudinary:", error);
            }
        }   
        await book.deleteOne();
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error("Error in DELETE /books/:id:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



export default router; 