const express = require('express');
const app =express();
const cors= require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fwntuaw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysInfo = client.db('legoland').collection('toyInfo');


    app.get('/allToys', async (req, res) => {
        const cursor = toysInfo.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/myToys/:email', async (req, res) => {
        const { email } = req.params;
      
        try {
          const toys = await toysInfo.find({ postedBy: email }).toArray();
          res.status(200).json(toys);
        } catch (error) {
          console.log('Error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
      

    app.post('/addToys', async (req, res) => {
        try {
          const toyData = req.body;
          const result = await toysInfo.insertOne(toyData);
            console.log(result);
          res.status(201).json({ message: 'Toy added successfully' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error adding toy' });
        }
      });

      app.put('/updateToy/:id', async (req, res) => {
  const { id } = req.params;
  const updatedToy = req.body;

  try {
    const result = await toysInfo.updateOne({ _id: ObjectId(id) }, { $set: updatedToy });
    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'Toy updated successfully' });
    } else {
      res.status(404).json({ error: 'Toy not found' });
    }
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
      


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('server running')
})

app.listen(port,()=>{
    console.log(`server running on port: ${port}`);
})