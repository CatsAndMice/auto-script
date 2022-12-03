const http = require('http');
const path = require('path');
const fs = require('fs');
const server = http.createServer((req, res) => {
    const json = fs.readFileSync(path.join(__dirname, '../questions.json'), 'utf-8')
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.write(json)
    res.end()
})

server.listen(8080, () => {
    console.log('成功开启8080端口');
})