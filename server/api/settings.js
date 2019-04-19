'use strict'
const express = require('express');
const config = require('../../config');
const db = require('mariasql');
const fs = require('fs');
const ejs = require('ejs');
const pages = __dirname + '/../../public/templates/';
const settings = express.Router();
const builder = require('./builder');

settings.get('/refreshTemplates', updateSettings);

async function updateSettings(req, res){
  const con = new db(config.mysql);
  con.query('SELECT * FROM pages;', null, {useArray: true}, function(err, rows){
    if (err)
      throw err;
      res.json({rows: rows});
  })
  con.end();
}


settings.get('/iframe/:type/:id', function(req, res){
  const con = new db(config.mysql);
  let pageType = req.params.type;
  let pageID = parseInt(req.params.id);
  switch (pageType){
    case "text":
      con.query(`SELECT value FROM content WHERE pageId = ${pageID}`, null, {useArray: true}, function(err, row){
        if (err)
          throw err
        let textArr = row[0];
        let text = textArr[0];
        con.query(`SELECT element, property, value FROM styles WHERE pageId = ${pageID}`, {useArray : true}, function(err, rows){
          if (err)
            throw err
          let styleObjetcs = rows.slice(0, 2);
          console.log(styleObjetcs);
          let styleString = "";
          styleObjetcs.forEach(function(item){
            styleString = styleString.concat(item.element,"{ ", item.property, ": ", item.value, ";}");
          })
          console.log(styleString);
          ejs.renderFile(`${pages}/text.ejs`, {title: "",text: text, source: "server", styling: styleString}, function(err, str){
            if (err)
              throw err
            res.set('Content-Type','text/html').send(str);
          });
        });
      });
      break;
    case "quote":
      con.query(`SELECT value FROM content WHERE pageId = ${pageID}`, null, {useArray: true}, function(err, row){
        if (err)
          throw err
        let textArr = row[0];
        let texts = textArr[0].split("-");
        let text = texts[0];
        let by = "";
        by = by.concat("- ", texts[1]);
        console.log(by);
        con.query(`SELECT element, property, value FROM styles WHERE pageId = ${pageID}`, {useArray : true}, function(err, rows){
          if (err)
            throw err
          let styleObjetcs = rows.slice(0, 2);
          console.log(styleObjetcs);
          let styleString = "";
          styleObjetcs.forEach(function(item){
            styleString = styleString.concat(item.element,"{ ", item.property, ": ", item.value, ";}");
          })
          console.log(styleString);
          ejs.renderFile(`${pages}/quote.ejs`, {title: "", text: text,by: by, source: "server", styling: styleString}, function(err, str){
            if (err)
              throw err
            res.set('Content-Type','text/html').send(str);
          });
        });
      });
      break;

    con.end()


  }
});



module.exports = {
  settings: settings
}





// let fileNames = {};
// fs.readdir(pages, (err, files) => {
//   if(err){
//     console.log(err);
//   }else{
//     files.forEach(function(file, index){
//       let fileName = file.split('.', 1);
//       fileNames[Number(index)] = fileName.toString();
//     });
//     res.send(JSON.stringify(fileNames));
//   }
// });
