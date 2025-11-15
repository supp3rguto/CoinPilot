const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000; 

app.use(cors());

app.use(express.json());

let products = [
  { id: 1, name: 'Viagem Centro -> Bairro A', basePrice: 20.00, currentPrice: 20.00 },
  { id: 2, name: 'Viagem Centro -> Bairro B', basePrice: 15.00, currentPrice: 15.00 },
  { id: 3, name: 'Viagem Aeroporto -> Hotel', basePrice: 50.00, currentPrice: 50.00 }
];

function applyDynamicPricing(demandFactor) {
  console.log(`Aplicando regras com demanda: ${demandFactor}`);
  
  products = products.map(product => {
    let newPrice = product.basePrice; 
    
    if (demandFactor > 7) {
      newPrice = product.basePrice * 1.5; 
    }
    else if (demandFactor > 4) {
      newPrice = product.basePrice * 1.2; 
    }
    else {
      newPrice = product.basePrice;
    }

    const finalPrice = parseFloat(newPrice.toFixed(2));

    return {
      ...product, 
      currentPrice: finalPrice 
    };
  });
}

app.get('/products', (req, res) => {
  res.json(products);
});

app.post('/simulate', (req, res) => {
  const randomDemand = Math.floor(Math.random() * 10) + 1;

  applyDynamicPricing(randomDemand);

  res.json({ 
    success: true, 
    message: `Simulação executada com demanda ${randomDemand}!`,
    newDemand: randomDemand 
  });
});

app.listen(PORT, () => {
  console.log(`Servidor CoinPilot (Backend) rodando em http://localhost:${PORT}`);
});