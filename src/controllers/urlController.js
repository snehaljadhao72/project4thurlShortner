const Url=require("../models/urlModel")
var validUrl = require('valid-url')
const shortid = require('shortid')
const mongoose = require('mongoose')

const isvalidRequest = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const baseUrl = 'http:localhost:3000'

const createUrl= async (req, res) => {

    let requestbody=req.body
    if(!isvalidRequest(requestbody)) return res.status(400).send({status:false,messege:"request body is empty"})

    const {longUrl} = requestbody 
    if (!validUrl.isUri(baseUrl)) {
        
        return res.status(400).send({status:false, message:'Invalid base URL'})
    }
    
    const urlCode = shortid.generate()

    if (validUrl.isWebUri(longUrl)) {
        
        try {

            let url = await Url.findOne({ longUrl }).select({__v:0,createdAt:0,updatedAt:0,_id:0})

            if (url) 
            { 
                res.status(200).send({message:"This url is already shorten", data:url}) 
            } else {
                const shortUrl = baseUrl + '/' + urlCode

                url = new Url({
                    longUrl,
                    shortUrl,
                    urlCode
                })
                await url.save()
                res.status(201).send({status:true, data:url})
            }
        }
        
        catch (err) {
            console.log(err)
            res.status(500).send({status:false, message:'Server Error'})
        }

    } else {
        res.status(400).send('Invalid longUrl')
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////





// const getUrl =  async (req, res) => {
//     try {
//         const url = await Url.findOne({
//             urlCode: req.params.urlCode
//         })
//         if (url) {
//             return res.redirect(url.longUrl)
//         } else {
//             return res.status(404).send('No URL Found')
//         }

//     }
//     catch (err) {
//         console.error(err)
//         res.status(500).send('Server Error')
//     }
// }







const getUrl=async function(req,res){
    let urlCode=req.params.urlCode
    // if(!data) return res.send({status:false,msg:"url body is empty"})

    let urlData= await Url.findOne({urlCode:urlCode})
    if(!urlData) return res.status(400).send({status:false,msg:"urlcode is not found"})
     return res.status(302).redirect(`${urlData.longUrl}`)
}




module.exports.createUrl = createUrl

module.exports.getUrl = getUrl


