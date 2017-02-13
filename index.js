const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
const readline = require('readline');

app.get('/', (req, res) => {
    res.send('application started.');
})
app.get('/convert/csv/to/json', (req, res) => {
    var fileName = `${new Date()}.csv`
    var file = fs.createWriteStream(fileName)
    var request = https.get(req.query.q, function (response) {
        var msg = 0;
        var arrHeaders = null;

        response.on('data', (data) => {
            file.write(data)
        })

        response.on('end', () => {
            let json = [];
            let count = 0;
            let headers = [];
            let rl = readline.createInterface({
                input: fs.createReadStream(fileName)
            });

            rl.on('line', (line) => {
                if (count == 0) {
                    headers = line.split(',');
                } else {
                    var tempLine = line.split(',');
                    var tempJson = {};
                    for (var i in headers) {
                        if (tempLine[i] !== "NULL")
                            tempJson[headers[i]] = tempLine[i];
                    }
                    json.push(tempJson);
                }
                count++;
            });

            rl.on('close', () => {
                fs.unlink(fileName, (err) => {
                    if (err) throw err;
                    console.log(`successfully deleted ${fileName}`);
                });
                res.json(json)
            });

        })
    });
})

// Handle 404
app.use((req, res) => {
    res.status(404).json('404: Page not Found');
});

// Handle 500
app.use((error, req, res, next) => {
    res.status(500).json('500: Internal Server Error' + error);
    next();
});

app.listen(process.env.PORT || 3000, () => {
    console.log('application running...');
});