const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.POST || 5000;

 console.log(process.env.DB_USER)
 console.log(process.env.DB_PASS)
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x6iur0l.mongodb.net/?retryWrites=true&w=majority`;

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
    
     const toyCollection = client.db('toyShop').collection('toyDb')
     console.log(toyCollection)
    
    const indexKeys = {toyName: 1};
    const indexOption = {name:'toyName'} ;
    const result = await toyCollection.createIndex(indexKeys,indexOption)

//  search with toy name 
    app.get('/toyNameSearch/:text', async(req,res)=>{
      const searchText = req.params.text;
      const result = await toyCollection.find({
        $or:[
          {toyName: {$regex: searchText, $options: 'i'}}
        ]}).toArray()
        res.send(result)
    })


    app.get('/allToys', async(req,res)=>{
      const result= await toyCollection.find().limit(20).toArray()
      res.send(result)
    })


    //  tab with toy category name 
     app.get('/allToys/:category', async(req,res)=>{
      console.log(req.params.category )
      if(req.params.category === 'Teddy Bear' || req.params.category === 'Horse' || req.params.category === 'Cat'){
        const result = await toyCollection.find({category: req.params.category}).toArray()
        return res.send(result)
      }
        const result = await toyCollection.find().toArray()
        return res.send(result)
     })


    //  post toy api 
     app.post('/postToy', async(req,res)=>{
        const body = req.body;
        if(!body){
            return res.status(404).send({message: 'body not found'})
        }
        const result = await toyCollection.insertOne(body)
        res.send(result)
     })

    //  privet route with email 
      app.get('/myToys/:email' , async(req,res)=>{
      //  console.log(req.params.email)
      //  const type = req.query.type === 'ascending';
      //  const value = req.query.value;
      //  const sortData = {}
      //  sortData[value]= type ? 1: -1;
       const result = await  toyCollection.find( {email : req.params.email} ).sort({price: -1}).toArray();
       res.send(result)
    })
     
 
     
    // pictureUrl,
    // toyName,
    // price,
    // rating,
    // availableQuantity,
    // detailDescription,
    // update api
    app.put('/update/:id', async(req,res)=>{
      const id = req.params.id;
      const user = req.body;
      console.log(id,user)
      const filter = {_id: new ObjectId(id)}
      const option = {upsert: true}
      const updateDoc = {
     $set: {
          pictureUrl: user.pictureUrl,
          toyName: user.toyName,
          price: user.price,
          rating: user.rating,
          availableQuantity: user.availableQuantity,
          detailDescription: user.detailDescription,
        },
      }
      const result = await toyCollection.updateOne(filter,updateDoc,option)
      res.send(result)
    })


    // all toy by  id
    app.get('/allToy/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      // const options = {
      //   projection: { category: 1, price: 1,_id:1, pictureUrl: 1, toyName: 1, rating: 1,seller:1, availableQuantity: 1, sellerEmail: 1,detailDescription:1},
      // };
    
      const result = await toyCollection.findOne(query)
      res.send(result)
    })

    // delete api 
    app.delete('/myToys/:id', async(req,res)=>{
      const id = req.params.id;
      console.log('please delete',id)
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.deleteOne(query)
      res.send(result)

    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req,res)=>{
    res.send('toy shop server is running')
})
app.listen(port,()=>{
    console.log(`Toy shop server is running on PORT: ${port}`)
})