const Url = require("../models/urlModel")
var validUrl = require('valid-url')
const shortid = require('shortid')
const mongoose = require('mongoose')

const isvalidRequest = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if(typeof value === "string")
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

                const shortUrl =(`${baseUrl + '/' + urlCode}`)//concat base with urlcode

                url = new Url({
                    longUrl,
                    shortUrl,
                    urlCode
                })
                await url.save()
                //------------send response--------------------------------------
                res.status(201).send({ status: true, data: url })
            }
        } else {
            res.status(400).send({status:false,message:'Invalid longUrl'})
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
        let urlCode = req.params.urlCode
      
        //---------find urlcode-------------------------------
        let urlData = await Url.findOne({ urlCode: urlCode }).select({_id: 0,longUrl:1})
        if (!urlData) return res.status(400).send({ status: false, msg: "urlcode is not found" })
        
        //-----------------send response--------------------------------------
        return res.status(302).redirect(`${urlData.longUrl}`)
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })

    }

}


module.exports.createUrl = createUrl

module.exports.getUrl = getUrl


