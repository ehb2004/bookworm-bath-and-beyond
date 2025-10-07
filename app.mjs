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
    db = client.db("personalLibrary"); // Database name
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Looks like you did something wrong...Failed to connect to MongoDB:", error);
  }
}
connectDB();


app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

// endpoints for CRUD operations

// Creating a book entry 
app.post('/api/books', async (req, res) => {
  try {
    const { title, author, genre, readStatus } = req.body;

    // Simple validation
    if (!title || !author || !genre || readStatus === undefined) {
      return res.status(400).json({ error: 'Please fill out the appropriate fields' });
    }

    const book = {
      title,
      author,
      genre,
      readStatus,
      createdAt: new Date()
    };
    const result = await db.collection('books').insertOne(book);

    console.log(`Congrats! Added: ${title}`);

    res.status(201).json({
      message: 'Book added to library',
      bookId: result.insertedId,
      book: { ...book, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add book: ' + error.message });
  }
});



app.listen(PORT);