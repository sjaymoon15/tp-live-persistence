var express = require('express');
var router = express.Router();
var days = require('../../models/day');

router.get('/days', function (req, res, next){
  days.findAll({})
  .then (function (found){
    if(found.length ===0){
      days.create({number:1})
    } else {
      res.send(found)
    }
  })

   })




router.post('/days', function (req, res, next){
  console.log("this is data " , req.body.answer)
    days.create({number:req.body.answer})
    .then(function (created){
      res.send(created)
    })

})


module.exports = router;
