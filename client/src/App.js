import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table } from 'reactstrap';

const ReportsTable = () => {
  const [folders, setFolders] = useState([]);
  const [summaryData, setSummaryData] = useState({});

  useEffect(() => {
    // API'den klasörleri çek
    fetch('http://localhost:3001/api/reports')
      .then((response) => response.json())
      .then((data) => setFolders(data.folders))
      .catch((error) => console.error('Error fetching folders:', error));
  }, []);

  useEffect(() => {
    const fetchDataForFolders = async () => {
      const dataPromises = folders.map(async (folder) => {
        try {
          const response = await fetch(`http://localhost:3001/api/reports/${folder}/widgets/summary`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch data for folder ${folder}. Status: ${response.status}`);
          }

          return { folder, data: await response.json() };
        } catch (error) {
          console.error(`Error fetching data for folder ${folder}:`, error);
          return { folder, data: {} };
        }
      });

      const summaryDataList = await Promise.all(dataPromises);
      const summaryDataObject = summaryDataList.reduce((acc, { folder, data }) => {
        acc[folder] = data;
        return acc;
      }, {});

      setSummaryData(summaryDataObject);
    };

    fetchDataForFolders();
  }, [folders]);

  const openAllureReport = (folder) => {
    fetch('http://localhost:3001/api/openReport', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folder: folder }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log('Allure report opened successfully');
        } else {
          console.error('Error opening Allure report');
        }
      })
      .catch((error) => console.error('Error:', error));
  };

  return (
    <Table>
    <thead>
      <tr>
        <th>#</th>
        <th>Folder Name</th>
        <th>Statistics</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {folders.map((folder, index) => (
        <tr key={index}>
          <th scope="row">{index + 1}</th>
          <td>{folder}</td>
          <td>
            <pre>
            <span style={{ backgroundColor: 'green', padding: '0.5em', marginRight: '1em', borderRadius: '5px' }}>
                  {JSON.stringify(summaryData[folder]?.statistic.passed, null)}
                </span>
                <span style={{ backgroundColor: 'red', padding: '0.5em', marginRight: '1em', borderRadius: '5px' }}>
                  {JSON.stringify(summaryData[folder]?.statistic.failed, null)}
                </span>
                <span style={{ backgroundColor: 'yellow', padding: '0.5em', marginRight: '1em', borderRadius: '5px' }}>
                  {JSON.stringify(summaryData[folder]?.statistic.broken, null)}
                </span>
                <span style={{ backgroundColor: 'purple', padding: '0.5em', borderRadius: '5px' }}>
                  {JSON.stringify(summaryData[folder]?.statistic.unknown, null)}
                </span>
            </pre>
          </td>
          <td>
            <button onClick={() => openAllureReport(folder)}>View</button>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
  );
};

function App() {
  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h1 className="mb-4">Reports</h1>
          <ReportsTable />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
