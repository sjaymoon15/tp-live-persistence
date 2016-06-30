var express = require('express');
var router = express.Router();
var days = require('../../models/day');

router.get('/days', function (req, res, next){
  days.findAll({})
  .then (function (found){
    {
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


router.put("/days", function(req, res, next){

  days.findOne({
    where: {
      number: req.body.dayId 
    }
  })
  .then(function(foundDay){
    console.log(foundDay);
    console.log(req.body.itemId);
    
    foundDay.update({
      hotelId: req.body.itemId
    }); 
  })


})



module.exports = router;
