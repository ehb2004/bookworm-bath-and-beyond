import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {MongoClient, ServerApiVersion, ObjectId} from 'mongodb';

const app = express()
const PORT = process.env.PORT || 3000;
// ES module: path import and __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uri = process.env.MONGO_URI;


//Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);


// Taken from stunning-octo-fortnight-hello-express class example
let db;
let erikasBooks; //hopefully where I keep all of my books...
async function connectDB() {
  try {
    await client.connect();
    db = client.db("books"); // Database name
    erikasBooks = db.collection("erikasBooks"); // Collection name
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Looks like you did something wrong...Failed to connect to MongoDB:", error);
  }
}
connectDB();


app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

// endpoints ... middlewares.. apis?
//WHAT THE FLIP AM I DOING


//create a new book entry
app.post('/api/books', async (req, res) => {
  try {
    const { title, author, readStatus } = req.body;

    // Simple validation
    if (!title || !author || !readStatus) {
      return res.status(400).json({ error: 'Title, author, and read status are required' });
    }

    const book = {
      title,
      author,
      readStatus,
      createdAt: new Date()
    };
    const result = await db.collection('erikasBooks').insertOne(book);

    console.log(`✅ Book created: ${title} by ${author}`);

    res.status(201).json({
      message: 'Book created successfully',
      bookId: result.insertedId,
      book: { ...book, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create book: ' + error.message });
  }
});

// test book entry
// Add this test route before app.listen(PORT);
//TEST to make sure that books are being added to the database
// app.get('/test-add-book', async (req, res) => {
//   try {
//     const testBook = {
//       title: 'Harry Potter',
//       author: 'J.K. Rowling',
//       readStatus: 'completed'
//     };
    
//     const result = await erikasBooks.insertOne(testBook);
//     res.json({ 
//       message: 'Test book added!', 
//       book: { ...testBook, _id: result.insertedId }
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });




app.listen(PORT);