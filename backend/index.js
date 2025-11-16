const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200", 
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

app.use(cors());
app.use(express.json());

let products = [
  { id: 1, name: 'Viagem Centro -> Bairro A', basePrice: 20.00, currentPrice: 20.00 },
  { id: 2, name: 'Viagem Centro -> Bairro B', basePrice: 15.00, currentPrice: 15.00 },
  { id: 3, name: 'Viagem Aeroporto -> Hotel', basePrice: 50.00, currentPrice: 50.00 }
];
let lastDemand = 1; 

function applyDynamicPricing(demandFactor) {
  lastDemand = demandFactor; 
  products = products.map(product => {
    let newPrice = product.basePrice; 

    if (demandFactor > 7) {
      newPrice = product.basePrice * 1.5;
    } else if (demandFactor > 4) {
      newPrice = product.basePrice * 1.2;
    } else {
      newPrice = product.basePrice;
    }
    
    const finalPrice = parseFloat(newPrice.toFixed(2));
    return { ...product, currentPrice: finalPrice };
  });
}

app.get('/products', (req, res) => {
  res.json(products);
});

setInterval(() => {
  const randomDemand = Math.floor(Math.random() * 10) + 1;
  
  applyDynamicPricing(randomDemand);

  io.emit('price-update', { 
    products: products,
    demand: lastDemand 
  });

  console.log(`SIMULAÇÃO: Demanda ${lastDemand}. Preços atualizados e 'emitidos' via WebSocket.`);

}, 3000);

server.listen(PORT, () => {
  console.log(`Servidor CoinPilot (Backend V2) rodando em http://localhost:${PORT}`);
});