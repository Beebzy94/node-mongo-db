require("dotenv").config();
const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const connectDB = require("./db");

const Product = require("./models/Product"); // Import the Product model
const methodOverride = require("method-override");

const app = express();
app.use(express.json());

connectDB(); // Connect to MongoDB

app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", path.join(__dirname, "views")); // Set the views directory
app.use(expressLayouts); // Use express-ejs-layouts for layout support
app.use(express.static("public")); // Serve static files from the public directory
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (as sent by HTML forms)
app.use(methodOverride("_method")); // Allow PUT and DELETE requests using query parameters

app.get("/", async (req, res) => {
  try {
    const products = await Product.find(); // Fetch products from the database
    res.render("index", { title: "Home", items: products }); // Pass products to the view
  } catch (err) {
    res.status(500).send("Error fetching products");
  }
});

app.get("/new", (req, res) => {
  res.render("new", { title: "Add New Item" });
});

// add new product
app.post("/new_products", async (req, res) => {
  try {
    const product = new Product(req.body); // Create a new product instance
    await product.save(); // Save the product to the database
    res.redirect("/");
  } catch (err) {
    res.redirect("/");
  }
});

// view product details
app.get("/:id", async (req, res) => {
  try {
    const item = await Product.findById(req.params.id); // Find the product by ID
    if (!item) {
      // If the product is not found, redirect to home
      return res.redirect("/");
    }
    res.render("show", { title: item.name, item }); // Render the product details page
  } catch (err) {
    res.redirect("/");
  }
});

// get product to edit and display in edit page
app.get("/:id/edit", async (req, res) => {
  try {
    const item = await Product.findById(req.params.id); // Find the product by ID for editing
    if (!item) {
      // If the product is not found, redirect to home
      return res.redirect("/");
    }
    res.render("edit", { title: `Edit ${item.name}`, item }); // Render the edit page with the product details
  } catch (err) {
    res.redirect("/");
  }
});

// submit edited product to the database
app.put("/:id", async (req, res) => {
  try {
    const updatedItem = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ); // Update the product in the database
    if (!updatedItem) {
      // If the product is not found, redirect to home
      return res.redirect("/");
    }
    res.redirect(`/${updatedItem._id}`); // Redirect to the updated product's page
  } catch (err) {
    res.redirect(`/${req.params.id}/edit`); // If there's an error, redirect to the edit page
  }
});

// delete product from the database
app.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await Product.findByIdAndDelete(req.params.id); // Delete the product from the database
    if (!deletedItem) {
      // If the product is not found, redirect to home
      return res.redirect("/");
    }
    res.redirect("/");
  } catch (err) {
    res.redirect(`/${req.params.id}`); // If there's an error, redirect to the product's page
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
