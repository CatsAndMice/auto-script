const fs = require('fs');
const { path } = require('../config.js');
const mdIt = require('markdown-it')();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const replaceCodeTab = (str = '') => {
    return str.replace(/<code>(.+)<\/code>/g, (match, p1) => {
        return '`' + p1 + '`'
    })
}

const parseSelect = (doms, cb) => {
    doms.each((index, li) => {
        const liContent = replaceCodeTab(li.innerHTML)
        const result = /(\w)(: )?/m.exec(liContent)
        try {
            const selectItem = result[1]
            cb(selectItem, liContent)
        } catch (error) {
            console.log(error);
        }
    });
}

const parseAnswer = (ps) => {
    const len = ps.length - 1
    let str = ''
    ps.each((index, p) => {
        if (index === len || index === 0) return
        const content = replaceCodeTab(p.innerHTML)
        str += content+'\n'
    });

    return str
}

const parseMd = (mds = []) => {
    const mdMap = new Map();
    mds.forEach((md) => {
        const mdHtml = mdIt.render(md)
        const dom = new JSDOM(mdHtml);
        const { window } = dom
        const $ = require('jquery')(window);
        const answer = parseAnswer($('p'))
        const obj = {
            title: $('h6').text(),
            result: $('h4').text(),
            code: $('.language-javascript').text(),
            answer
        }
        parseSelect($('ul>li'), (key, value) => {
            const option = { key, value }
            if (obj.options) {
                obj.options.push(option)
                return
            }
            obj.options = [option]
        })

        console.log(obj);
    })

}

const readMd = (path) => {
    let content = fs.readFileSync(path, { encoding: 'utf-8' });
    content = content.split('---');
    // 去除开头无用开头内容
    content.shift(0, 1);
    return content;
}

(() => {
    const mds = readMd(path)
    parseMd(mds)
})()
