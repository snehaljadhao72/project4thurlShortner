const Url = require("../models/urlModel")
var validUrl = require('valid-url')
const shortid = require('shortid')
const mongoose = require('mongoose')
const redis = require("redis");

const { promisify } = require("util");
const redisClient = redis.createClient(
    17017,
    "redis-17017.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("AZlQ36id5VVz0gma42WNFhLbuTfUpmM1", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


//===============================validation============================================
const isvalidRequest = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "string")
        return true;
};


const baseUrl = 'http:localhost:3000'

const createUrl = async (req, res) => {
    try {
        let requestbody = req.body
        //-------check reqbody-------------------------------------
        if (!isvalidRequest(requestbody)) return res.status(400).send({ status: false, messege: "request body is empty" })
        //---------------destructing---------------------------
        const { longUrl } = requestbody

        //----------------check url----------------------------------------
        if (!isValid(longUrl))
            return res.status(400).send({ status: false, msg: "url is required " })

        //--------------------check baseurl--------------------------------------
        if (!validUrl.isUri(baseUrl)) {

            return res.status(400).send({ status: false, message: 'Invalid base URL' })
        }

        // const urlCode = shortid.generate().toLowerCase()
        //----------------check the longurl-------------------------------------------
        if (validUrl.isWebUri(longUrl)) {

            let url = await Url.findOne({ longUrl }).select({ __v: 0, createdAt: 0, updatedAt: 0, _id: 0 })

            if (url) {
                res.status(200).send({ message: `${longUrl} is already present` })
            } else {
                const urlCode = shortid.generate().toLowerCase()

                const shortUrl = (`${baseUrl + '/' + urlCode}`)//concat base with urlcode

                url = new Url({
                    longUrl,
                    shortUrl,
                    urlCode
                })
                await url.save()
                //------------send response--------------------------------------
                res.status(201).send({ status: true, data:{longUrl:url.longUrl,shortUrl:url.shortUrl,urlCode:url.urlCode}})
            }
        } else {
            res.status(400).send({ status: false, message: 'Invalid longUrl' })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}

//---------------------------------------geturl--------------------------------------------
const getUrl = async function (req, res) {
    try {
        let params = req.params
        let urlCode=params.urlCode
             let cahcedProfile = await GET_ASYNC(`${urlCode}`)
             let parse=JSON.parse(cahcedProfile)
        if (cahcedProfile) {
            return res.status(302).redirect(`${parse.longUrl}`)
        } else {

            //---------find urlcode-------------------------------
            let urlData = await Url.findOne({ urlCode: req.params.urlCode }).select({ _id: 0, longUrl: 1 })
            
            if (!urlData) return res.status(400).send({ status: false, msg: "urlcode is not found" })
            await SET_ASYNC(`${urlCode}`, JSON.stringify(urlData))
    
            //-----------------send response--------------------------------------
             return res.status(302).redirect(`${urlData.longUrl}`)
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })

    }

}


module.exports.createUrl = createUrl

module.exports.getUrl = getUrl


