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
  { id: 1, name: 'Centro -> Residencial Victoria', basePrice: 20.00, currentPrice: 20.00 },
  { id: 2, name: 'Centro -> Jardim Aurora', basePrice: 15.00, currentPrice: 15.00 },
  { id: 3, name: 'Aeroporto Viracopos -> Hotel', basePrice: 50.00, currentPrice: 50.00 }
];

let transactionLedger = []; 

let simulationState = {
  timeOfDay: 'Horário Normal', timeMultiplier: 1.0,
  isRaining: false, weatherMultiplier: 1.0,
  isEvent: false, eventMultiplier: 1.0
};

let settings = {
  salesSimulation: true,
  weatherSimulation: true,
  eventSimulation: true
};

app.get('/products', (req, res) => res.json(routes));

app.post('/routes', (req, res) => {
  const { name, basePrice } = req.body;
  if (!name || !basePrice) {
    return res.status(400).json({ message: 'Nome e Preço Base são obrigatórios.' });
  }
  const newId = routes.length > 0 ? Math.max(...routes.map(r => r.id)) + 1 : 1;
  const newRoute = {
    id: newId, name, basePrice: parseFloat(basePrice), currentPrice: parseFloat(basePrice)
  };
  routes.push(newRoute);
  console.log("ROTA ADICIONADA:", newRoute);
  res.status(201).json(newRoute);
});

app.delete('/routes/:id', (req, res) => {
  const idToDelete = parseInt(req.params.id, 10);
  const routeIndex = routes.findIndex(r => r.id === idToDelete);
  if (routeIndex === -1) return res.status(404).json({ message: 'Rota não encontrada.' });
  routes.splice(routeIndex, 1);
  console.log("ROTA DELETADA:", idToDelete);
  res.status(200).json({ message: 'Rota deletada.' });
});

function updateSimulationContext() {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 10) {
    simulationState.timeOfDay = "Pico da Manhã"; simulationState.timeMultiplier = 1.4;
  } else if (hour >= 17 && hour < 20) {
    simulationState.timeOfDay = "Pico da Noite"; simulationState.timeMultiplier = 1.5;
  } else {
    simulationState.timeOfDay = "Horário Normal"; simulationState.timeMultiplier = 1.0;
  }

  if (settings.weatherSimulation) {
    if (!simulationState.isRaining && Math.random() < 0.15) {
      console.log("!!! CONTEXTO: Começou a chover!");
      simulationState.isRaining = true; simulationState.weatherMultiplier = 1.3;
    } else if (simulationState.isRaining && Math.random() < 0.30) {
      console.log("!!! CONTEXTO: Parou de chover!");
      simulationState.isRaining = false; simulationState.weatherMultiplier = 1.0;
    }
  }

  if (settings.eventSimulation) {
    if (!simulationState.isEvent && Math.random() < 0.10) {
      console.log("!!! CONTEXTO: Um evento começou na cidade!");
      simulationState.isEvent = true; simulationState.eventMultiplier = 1.8;
    } else if (simulationState.isEvent && Math.random() < 0.40) {
      console.log("!!! CONTEXTO: O evento terminou.");
      simulationState.isEvent = false; simulationState.eventMultiplier = 1.0;
    }
  }
}

function applyDynamicPricingAndEmit() {
  const { timeMultiplier, weatherMultiplier, eventMultiplier } = simulationState;
  const baseMultiplier = timeMultiplier * weatherMultiplier * eventMultiplier;
  routes = routes.map(route => {
    const jitter = (Math.random() - 0.5) * 0.06;
    const finalMultiplier = baseMultiplier + jitter;
    let newPrice = route.basePrice * finalMultiplier;
    if (newPrice < route.basePrice) newPrice = route.basePrice;
    return { ...route, currentPrice: parseFloat(newPrice.toFixed(2)) };
  });
  let context = `${simulationState.timeOfDay}. `;
  if (simulationState.isRaining) context += "Chovendo. ";
  if (simulationState.isEvent) context += "Evento. ";
  io.emit('price-update', { products: routes, context: context });
}

function simulateSale() {
  if (!settings.salesSimulation) return;
  if (routes.length === 0) return;

  const route = routes[Math.floor(Math.random() * routes.length)];
  
  const transaction = {
    id: transactionLedger.length + 1,
    routeName: route.name,
    cost: route.basePrice,
    revenue: route.currentPrice,
    profit: route.currentPrice - route.basePrice,
    timestamp: new Date()
  };
  
  transactionLedger.push(transaction);

  if (transactionLedger.length > 1000) {
    transactionLedger.shift();
  }
}

function emitFinanceUpdate() {
  if (transactionLedger.length === 0) return;

  const totalRevenue = transactionLedger.reduce((sum, t) => sum + t.revenue, 0);
  const totalCost = transactionLedger.reduce((sum, t) => sum + t.cost, 0);
  const totalProfit = totalRevenue - totalCost;
  const totalTransactions = transactionLedger.length;
  const avgProfitPerTransaction = totalProfit / totalTransactions;

  const profitByRoute = routes.map(route => {
    const routeTransactions = transactionLedger.filter(t => t.routeName === route.name);
    const routeProfit = routeTransactions.reduce((sum, t) => sum + t.profit, 0);
    return {
      name: route.name,
      value: routeProfit
    };
  });

  const latestTransactions = [...transactionLedger].reverse().slice(0, 5);

  io.emit('finance-update', {
    totalRevenue,
    totalCost,
    totalProfit,
    totalTransactions,
    avgProfitPerTransaction,
    profitByRoute,
    latestTransactions
  });
}

console.log("Iniciando simulador...");
updateSimulationContext();
setInterval(updateSimulationContext, 60000);
setInterval(applyDynamicPricingAndEmit, 5000);
setInterval(simulateSale, 2000);
setInterval(emitFinanceUpdate, 5000);

io.on('connection', (socket) => {
  console.log('Um usuário (Angular) se conectou');
  socket.emit('price-update', { products: routes, context: "Conectado" });

  socket.on('update-setting', (setting) => {
    if (settings.hasOwnProperty(setting.key)) {
      settings[setting.key] = setting.value;
      console.log(`CONFIG ATUALIZADA: ${setting.key} = ${setting.value}`);
      io.emit('settings-changed', settings);
    }
  });

  socket.on('get-settings', () => {
    socket.emit('settings-changed', settings);
  });

  socket.emit('settings-changed', settings);
});

server.listen(PORT, () => {
  console.log(`Servidor CoinPilot rodando em http://localhost:${PORT}`);
});