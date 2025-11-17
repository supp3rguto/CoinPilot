const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:4200", methods: ["GET", "POST"] }
});
const PORT = 3000;

app.use(cors());
app.use(express.json());

let routes = [
  { id: 1, name: 'Viagem Centro -> Bairro A', basePrice: 20.00, currentPrice: 20.00 },
  { id: 2, name: 'Viagem Centro -> Bairro B', basePrice: 15.00, currentPrice: 15.00 },
  { id: 3, name: 'Viagem Aeroporto -> Hotel', basePrice: 50.00, currentPrice: 50.00 }
];

let simulationState = {
  timeOfDay: 'Horário Normal',
  timeMultiplier: 1.0,
  isRaining: false,
  weatherMultiplier: 1.0,
  isEvent: false,
  eventMultiplier: 1.0
};

app.get('/products', (req, res) => {
  res.json(routes);
});

app.post('/routes', (req, res) => {
  const { name, basePrice } = req.body;

  if (!name || !basePrice) {
    return res.status(400).json({ message: 'Nome e Preço Base são obrigatórios.' });
  }

  const newId = routes.length > 0 ? Math.max(...routes.map(r => r.id)) + 1 : 1;
  
  const newRoute = {
    id: newId,
    name: name,
    basePrice: parseFloat(basePrice),
    currentPrice: parseFloat(basePrice)
  };

  routes.push(newRoute);
  console.log("ROTA ADICIONADA:", newRoute);
  
  res.status(201).json(newRoute);
});

app.delete('/routes/:id', (req, res) => {
  const idToDelete = parseInt(req.params.id, 10);

  const routeIndex = routes.findIndex(r => r.id === idToDelete);

  if (routeIndex === -1) {
    return res.status(404).json({ message: 'Rota não encontrada.' });
  }

  const deletedRoute = routes.splice(routeIndex, 1);
  console.log("ROTA DELETADA:", deletedRoute);

  res.status(200).json({ message: 'Rota deletada com sucesso.' });
});

function updateSimulationContext() {
  console.log("--- (Loop Lento) Verificando contexto...");
  
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 10) {
    simulationState.timeOfDay = "Pico da Manhã";
    simulationState.timeMultiplier = 1.4;
  } else if (hour >= 17 && hour < 20) {
    simulationState.timeOfDay = "Pico da Noite";
    simulationState.timeMultiplier = 1.5;
  } else {
    simulationState.timeOfDay = "Horário Normal";
    simulationState.timeMultiplier = 1.0;
  }

  if (!simulationState.isRaining && Math.random() < 0.15) {
    console.log("!!! CONTEXTO: Começou a chover!");
    simulationState.isRaining = true;
    simulationState.weatherMultiplier = 1.3;
  } 
  else if (simulationState.isRaining && Math.random() < 0.30) {
    console.log("!!! CONTEXTO: Parou de chover!");
    simulationState.isRaining = false;
    simulationState.weatherMultiplier = 1.0;
  }

  if (!simulationState.isEvent && Math.random() < 0.10) {
    console.log("!!! CONTEXTO: Um evento começou na cidade!");
    simulationState.isEvent = true;
    simulationState.eventMultiplier = 1.8;
  }
  else if (simulationState.isEvent && Math.random() < 0.40) {
    console.log("!!! CONTEXTO: O evento terminou.");
    simulationState.isEvent = false;
    simulationState.eventMultiplier = 1.0;
  }
}

function applyDynamicPricingAndEmit() {
  const { timeMultiplier, weatherMultiplier, eventMultiplier } = simulationState;
  
  const baseMultiplier = timeMultiplier * weatherMultiplier * eventMultiplier;

  routes = routes.map(route => {
    const jitter = (Math.random() - 0.5) * 0.06;
    
    const finalMultiplier = baseMultiplier + jitter;
    
    let newPrice = route.basePrice * finalMultiplier;

    if (newPrice < route.basePrice) {
      newPrice = route.basePrice;
    }
    
    const finalPrice = parseFloat(newPrice.toFixed(2));
    return { ...route, currentPrice: finalPrice };
  });

  let context = `${simulationState.timeOfDay}. `;
  if (simulationState.isRaining) context += "Chovendo. ";
  if (simulationState.isEvent) context += "Evento na cidade! ";

  io.emit('price-update', { 
    products: routes,
    context: context
  });
  
  console.log(`(Loop Rápido) Preços atualizados e emitidos. Contexto: ${context}`);
}

console.log("Iniciando simulador de preços...");

updateSimulationContext(); 

setInterval(updateSimulationContext, 60000);
setInterval(applyDynamicPricingAndEmit, 5000);

io.on('connection', (socket) => {
  console.log('Um usuário (Angular) se conectou');
  socket.emit('price-update', { products: routes, context: "Conectado" });
});

server.listen(PORT, () => {
  console.log(`Servidor CoinPilot rodando em http://localhost:${PORT}`);
});