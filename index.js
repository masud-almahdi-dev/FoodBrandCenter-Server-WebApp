const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());


require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}`;

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
    // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const brandscollection = client.db('brandsDB').collection('brands');
    const products = client.db('brandsDB').collection('products');

    app.get("/brand/:id", async (req, res) => {
      try {
        let id = new ObjectId(req.params.id)
        const cursor = brandscollection.find(id)
        let result = await cursor.toArray();
        const cursor2 = products.find({ brand_id: req.params.id });
        if (result.length) { result[0].products = await cursor2.toArray(); }
        res.send(result)
      } catch (e) {
        res.send(e)
      }
    })
    app.get("/product/:id", async (req, res) => {

      try {
        let id = new ObjectId(req.params.id)
        const cursor = products.find(id)
        let result = await cursor.toArray();
        res.send(result)
      } catch (e) {
        res.send(e)
      }
    })
    app.put("/updateproduct/:id", async (req, res) => {

      try {
        let id = new ObjectId(req.params.id)
        const filter = {_id: id}
        const options = {upsert: true}
        const updatedproduct = {
          $set : {
            title: req.body.title,
            brand_id: req.body.brand_id,
            image: req.body.image,
            type: req.body.type,
            price: req.body.price,
            details: req.body.details,
            rating: req.body.rating
          }
        }
        const result = await products.updateOne(filter,updatedproduct,options)
        res.send(result)
      } catch (e) {
        res.send(e)
      }
    })

    app.delete("/delete/:id", async (req, res) => {

      try {
        let id = new ObjectId(req.params.id)
        const filter = {_id: id}
        const result = await products.deleteOne(filter)
        res.send(result)
      } catch (e) {
        res.send(e)
      }
    })

    app.get("/brands", async (req, res) => {
      const cursor = brandscollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.post("/addproduct", async (req, res) => {
      const result = await products.insertOne(req.body)
      res.send(result)
    })


  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Server successfully running.')
})
app.listen(port, () => {
  console.log(`App listening on port: ${port}`)
})