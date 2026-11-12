const express = require('express');
const app = express();
const cors = require('cors');

require('dotenv').config();



const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use(express.static('public')); // serve static files

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);



app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});