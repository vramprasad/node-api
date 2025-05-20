// app.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const dataFile = path.join(__dirname, 'data.json');

// Middleware
app.use(express.json());

// Helper function to read data file
async function readDataFile() {
  try {
    const data = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or has invalid JSON, return empty array
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return { items: [], nextId: 1 };
    }
    throw error;
  }
}

// Helper function to write data file
async function writeDataFile(data) {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

// Initialize data file if it doesn't exist
async function initDataFile() {
  try {
    await fs.access(dataFile);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeDataFile({ items: [], nextId: 1 });
    }
  }
}

// Initialize on startup
initDataFile();

// Routes
// GET all items
app.get('/api/items', async (req, res) => {
  try {
    const data = await readDataFile();
    res.json(data.items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve items' });
  }
});

// GET single item by id
app.get('/api/items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await readDataFile();
    const item = data.items.find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve item' });
  }
});

// POST create new item
app.post('/api/items', async (req, res) => {
  try {
    const data = await readDataFile();
    const newItem = {
      id: data.nextId,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    data.items.push(newItem);
    data.nextId += 1;
    await writeDataFile(data);
    
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT update existing item
app.put('/api/items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await readDataFile();
    const itemIndex = data.items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const updatedItem = {
      ...data.items[itemIndex],
      ...req.body,
      id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    data.items[itemIndex] = updatedItem;
    await writeDataFile(data);
    
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await readDataFile();
    const itemIndex = data.items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    data.items.splice(itemIndex, 1);
    await writeDataFile(data);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});