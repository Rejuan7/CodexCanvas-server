const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://canvasDB:3UPItmjXQDfQjz7w@rejuanahmmed.kijwvcr.mongodb.net/?retryWrites=true&w=majority&appName=rejuanahmmed";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    //  await client.db("admin").command({ ping: 1 });

    const adminCollection = client.db("canvasDB").collection("admin");
    const courseCollection = client.db("canvasDB").collection("course");
    const blogCollection = client.db("canvasDB").collection("blog");

    //Admin related.........................

    app.get("/admin", async (req, res) => {
      const result = await adminCollection.find().toArray();
      res.send(result);
    });

    app.post("/admin", async (req, res) => {
      const {
        displayName,
        email,
        photoURL,
        currentInstitute,
        password,
        companyName,
        designation,
      } = req.body;

      try {
        // Check if the email already exists in the collection
        const existingEmail = await adminCollection.findOne({ email });

        if (existingEmail) {
          return res.status(409).send({ message: "Already an admin" });
        }

        // Insert the new admin
        const result = await adminCollection.insertOne({
          displayName,
          email,
          photoURL,
          currentInstitute,
          password,
          companyName,
          designation,
        });
        res.status(200).send({ message: "Added to admin", result });
      } catch (error) {
        console.error("Error adding to admin:", error);
        res.status(500).send({ message: "Error adding to admin", error });
      }
    });

    app.patch("/admin/:id", async (req, res) => {
      const id = req.params.id;
      const formData = req.body;

      console.log(formData.companyName);

      try {
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            companyName: formData.companyName,
            designation: formData.designation,
            currentInstitute: formData.currentInstitute,
          },
        };

        const result = await adminCollection.updateOne(filter, updatedDoc);
        console.log(result);

        if (result.modifiedCount > 0) {
          res.status(200).send({ message: "Profile updated successfully" });
        } else {
          res.status(404).send({ message: "Admin not found" });
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).send({ message: "Error updating profile", error });
      }
    });

    //Blog related...............................

    app.get("/addBlog", async (req, res) => {
      const result = await blogCollection.find().toArray();
      res.send(result);
    });

    app.post("/addBlog", async (req, res) => {
      const newBlog = req.body;
      const result = await blogCollection.insertOne(newBlog);
      res.send(result);
    });

    app.patch("/addBlog/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedBlog = req.body;
        const { title, url, description, category } = updatedBlog;

        const updatedFields = {
          $set: {
            title: title,
            url: url,
            description: description,
            category: category,
          },
        };

        const result = await blogCollection.updateOne(
          filter,
          updatedFields,
          options
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating blog:", error);
        res.status(500).send("Error updating blog");
      }
    });

    app.delete('/addBlog/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await blogCollection.deleteOne(query);
      res.send(result);
    })


    //Course related.............................

    app.get("/course", async (req, res) => {
      const result = await courseCollection.find().toArray();
      res.send(result);
    });

    app.post("/course", async (req, res) => {
      const newCourse = req.body;
      const result = await courseCollection.insertOne(newCourse);
      res.send(result);
    });

    app.patch("/course/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedCourse = req.body;

        const { title, details, price, category, duration, image } =
          updatedCourse;

        const updatedFields = {
          $set: {
            title: title,
            details: details,
            price: price,
            category: category,
            duration: duration,
            image: image,
          },
        };

        const result = await courseCollection.updateOne(
          filter,
          updatedFields,
          options
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).send("Error updating course");
      }
    });

    app.delete("/course/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await courseCollection.deleteOne(query);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Canvas is running");
});

app.listen(port, () => {
  console.log(`CodexCanvas is running on port ${port}`);
});
