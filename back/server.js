const express = require('express');
const axios = require('axios');
const cors = require('cors');



const app = express();
app.use(express.json());
const PORT = 4000;


// Configuración de la tienda Shopify
const shopifyConfig = {
  shopName: 'berrots-life.myshopify.com',
  apiVersion: '2024-01',
  accessToken: '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',
  apiKey: '170745de602802ade93fac535200bf51',
  password: 'c0d2e05b05e7fbef8c064d1d7d0f80d4'
};
app.use(cors());
app.get('/', (req, res) => {
  res.send('<h1>¡Hola!</h1>');
});


app.get('/products', async (req, res) => {
  const apiUrl = `https://${shopifyConfig.shopName}/admin/api/${shopifyConfig.apiVersion}/products.json?since_id=0`;

  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': shopifyConfig.accessToken,
      'Authorization': `Basic ${Buffer.from(`${shopifyConfig.apiKey}:${shopifyConfig.password}`).toString('base64')}`
    }
  };

  try {
    const response = await axios.get(apiUrl, axiosConfig);
    const allProducts = response.data.products;

    // Filtrar productos activos con inventory_quantity mayor a 1
    const filteredProducts = allProducts.filter(product => {
      return (
        product.status === 'active' &&
        product.variants[0].inventory_quantity > 0
    
      );
    });

    res.json(filteredProducts);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});









app.post('/cart', async (req, res) => {

  const items = req.body.items;


  


  
  const shopifyStoreUrl = 'berrots-life.myshopify.com'; // Reemplaza 'your-shop-name' con el nombre de tu tienda
  const storefrontAccessToken='101f5b5c3037a1ade6b52b7f559fa29e'; 

  const lineItems = items.map(item => {
    return `{ variantId: "${item.variantId}", quantity: ${item.quantity} }`;
  });


// IDs de productos que deseas agregar al carrito
const productIds = ['47433045868841'];
const quantities = [1]; // Cantidades correspondientes a los productos
const consulta = `
  mutation {
    checkoutCreate(input: {
      lineItems: [${lineItems.join(',')}]
    })  {
      checkout {
        id
        webUrl
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
`;

fetch(`https://${shopifyStoreUrl}/api/2021-04/graphql.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': storefrontAccessToken
  },
  body: JSON.stringify({ query: consulta })
})
  .then(response => response.json())
  .then(data => {
    // Obtén la URL de redirección
    const redirectUrl = data.data.checkoutCreate.checkout.webUrl;

    
    // Redirecciona al cliente
    res.json({ redirectUrl: redirectUrl });
  })
  .catch(error => console.error('Error:', error));

});

app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`);
});
