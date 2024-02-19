// index.cjs
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

app.get('/get/sales', async (req, res) => {
  try {
    const filePath = path.join("./util", 'Accounts.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(data);

    if(!req.query.account) return res.status(400).json({"statusCode":400,"message":"provide required parameter accountID","data":""});

    const idParam = req.query.account;
    const typeParam = req.query.type ;
    const accountNameParam = req.query.accountName ;
    const customerIDParam = req.query.customerID ;
    const fromDate = req.query.fromDate ;
    const toDate = req.query.ToDate ;

    console.log(`params=${idParam},${typeParam},${accountNameParam},${customerIDParam},${fromDate},${toDate}`)
    let results;
    let filteredData = jsonData;

    filteredData = filteredData.filter(item => {
      return (!idParam || item._id === idParam) &&
             (item.isEnabled === true);
    });

    if (typeParam) {
      filteredData = filteredData.filter(item => item.payers.some(t=>t.type === typeParam));
    }
    if (customerIDParam) {
      filteredData = filteredData.filter(item => item.payers.some(c=>c.customerID === customerIDParam));
    }
    if (accountNameParam) {
      filteredData = filteredData.filter(item => item.accountName === accountNameParam);
    }

    results ={
      customerID:"",
      customerAccountID:"",
      customerAccountName:"",
      TotalAmmountInclVat:0,
      TotalVatAmmount:0,
      numberOfTransaction:0

    }
    results.customerAccountID=filteredData[0]._id;
    const payerWithCustomerID = filteredData[0].payers.find(payer => payer.customerID); 
    results.customerID = payerWithCustomerID ? payerWithCustomerID.customerID : " ";
    results.customerAccountName=filteredData[0].accountName;
    const filePath2 = path.join("./util", 'AccountTransaction.json');
    const data2 = await fs.readFile(filePath2, 'utf-8');
    const jsonData2 = JSON.parse(data2);
    let filteredData2 = jsonData2.filter(item => {
      return (!idParam || item.accountID === idParam) &&
             (item.isCleared === true);
    });
    //  FILTER BY TRANSACTION DATE

const startDate=fromDate? new Date(fromDate): new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const endDate = toDate?new Date(toDate):new Date()

filteredData2 = filteredData2.filter(item => {
    const itemDate = new Date(item.transactionDate);
    return itemDate >= startDate && itemDate <= endDate;
});



    results.TotalAmmountInclVat = filteredData2.reduce(
      (sum, transaction) => sum + transaction.totalTransactionAmount + transaction.totalVatAmount,
      0
    );
    results.TotalVatAmmount = filteredData2.reduce(
      (sum, transaction) => sum + transaction.totalVatAmount ,
      0
    );
    results.numberOfTransaction=filteredData2.length;
    res.json({"statusCode":200,"message":"successful","data":results});
  } catch (error) {
    console.error('Error reading the JSON file:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Exporting both app and server
module.exports = { app, server };
