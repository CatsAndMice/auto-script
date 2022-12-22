const axios = require('axios');
const { JSDOM } = require('jsdom');
let $ = require('jquery');
const fs = require('fs');
const path = require('path');

(async () => {
    const { data } = await axios.get('https://fabiaoqing.com/bqb/lists/type/hot.html')
    const page = new JSDOM(data)
    const window = page.window
    $ = $(window)
    $('.bqppdiv').each(async (index, e) => {
        const src = $(e).find('.image')[0].getAttribute('data-original')
        const type = path.extname(src)
        console.log(type);
        const fileName = Date.now() + type
        const { data } = await axios.get(src)
        const download = path.join(__dirname, fileName)
        fs.writeFileSync(download, data)
    })
})()