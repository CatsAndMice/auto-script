const fs = require('fs');
const { path } = require('../config.js');
const mdIt = require('markdown-it')();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const replaceCodeTab = (str = '') => {
    return str.replace(/\<code\>/g, '`')
        .replace(/\<\/code\>/g, '`')
        .replace(/\<em\>/g, '**')
        .replace(/\<\/em\>/g, '**')
        .replace(/\<i\>/g, '*')
        .replace(/\<\/i\>/g, '*')
}

const parseSelect = (doms, cb) => {
    doms.each((index, li) => {
        const liContent = replaceCodeTab(li.innerHTML)
        const result = /(\w)(: )?/m.exec(liContent)
        const selectItem = result[1]
        cb(selectItem, liContent)
    });
}

const parseAnswer = (ps) => {
    const len = ps.length - 1
    let str = ''
    ps.each((index, p) => {
        if (index === len || index === 0) return
        const content = replaceCodeTab(p.innerHTML)
        str += content + '\n'
    });

    return str
}

const parseMd = (md = '') => {
    const mdHtml = mdIt.render(md)
    const dom = new JSDOM(mdHtml)
    const { window } = dom
    return window
}


const getMdMapValue = (mds = []) => {
    const mdMap = new Map();
    mds.forEach((md, index) => {
        const id = index + 1
        const window = parseMd(md)
        const $ = require('jquery')(window);
        const answer = parseAnswer($('p'))
        const obj = { id, title: $('h6').text(), result: $('h4').text(), code: $('.language-javascript').text(), answer }
        // 如果选项解析失败，则抛弃该题目
        try {
            parseSelect($('ul>li'), (key, value) => {
                const option = { key, value }
                if (obj.options) {
                    obj.options.push(option)
                    return
                }
                obj.options = [option]
            })
            mdMap.set(id, obj)
        } catch (error) {
            console.warn('解析出错:', error)
        }
    })
    return Array.from(mdMap.values())
}


const readMd = (path) => {
    let content = fs.readFileSync(path, { encoding: 'utf-8' });
    content = content.split('---');
    // 去除开头无用开头内容
    content.shift(0, 1);
    return content;
}

const jsonWriteToMd = (jsonContent) => {
    const path = require('path')
    const outPath = path.join(__dirname, '../questions.json')
    fs.writeFileSync(outPath, jsonContent, 'utf8')
}

(() => {
    const mds = readMd(path)
    const mdArray = getMdMapValue(mds)
    const json = JSON.stringify(mdArray)
    jsonWriteToMd(json)
})()
