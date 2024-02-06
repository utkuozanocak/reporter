// server/index.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/api/reports', (req, res) => {
  const reportsPath = path.join(__dirname, '../reports');

  if (!fs.existsSync(reportsPath)) {
    return res.status(500).json({ error: 'Reports folder not found' });
  }

  const folders = fs.readdirSync(reportsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  res.json({ folders });
});

app.post('/api/openReport', (req, res) => {
  const folder = req.body.folder;

  if (!folder) {
    return res.status(400).json({ error: 'Folder parameter is required' });
  }

  const reportPath = path.join(__dirname, `../reports/${folder}`);

  const command = `allure open ${reportPath}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return res.status(500).json({ error: `Error executing command: ${error.message}` });
    }

    console.log(`Command output: ${stdout}`);
    res.json({ success: true });
  });
});

app.get('/api/reports/:folder/widgets/summary', async (req, res) => {
  const folder = req.params.folder;
  const summaryFilePath = path.join(__dirname, `../reports/${folder}/widgets/summary.json`);

  try {
    const data = await readFileAsync(summaryFilePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error(`Error reading summary.json for folder ${folder}:`, error);
    res.status(500).json({ error: 'Error reading summary.json' });
  }
});


function readFileAsync(path, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, encoding, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
