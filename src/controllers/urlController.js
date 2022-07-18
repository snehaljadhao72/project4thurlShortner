const urlModel=require("../models/urlModel")
var validUrl = require('valid-url')
const shortid = require('shortid')
const mongoose = require('mongoose')
const isvalidRequest = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const createUrl= async function(req,res){
    let requestbody=req.body.longUrl
    if(!isvalidRequest(requestbody)) return res.status(400).send({status:false,messege:"request body is empty"})

    baseUrl: http://localhost:3000/xyz

}