const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');

const { Video } = require("../models/Video");
const { Subscriber } = require("../models/Subscriber");
const { auth } = require("../middleware/auth");


var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.mp4') {
            return cb(res.status(400).end('only mp4 is allowed'), false);
        }
        cb(null, true)
    }
})

var upload = multer({ storage: storage }).single("file")

//=================================
//             Video
//=================================

router.post("/uploadfiles", (req, res) => {
    //클라이언트로부터 받은 비디오 파일을 서버에 저장
    upload(req, res, err => {
        if (err) {
            return res.json({ success: false, err })
        }
        return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename })
    })

});
router.post("/thumbnail", (req, res) => {
    //썸네일 생성하고 비디오 러닝타임도 가져오기.

    let thumbsFilePath ="";
    let fileDuration ="";

    // ffmpeg.setFfmpegPath("C:\Program Files\ffmpeg\bin\\ffmpeg.exe")

    //비디오 정보 가져오기
    ffmpeg.ffprobe(req.body.filePath, function(err, metadata){
        console.dir(metadata);
        console.log(metadata.format.duration);

        fileDuration = metadata.format.duration;
    })

    //썸네일 생성
    ffmpeg(req.body.filePath) //클라이언트에서 본 저장 경로 (uploads/안에 저장된 비디오 경로)
        .on('filenames', function (filenames) {
            console.log('Will generate ' + filenames.join(', '))
            thumbsFilePath = "uploads/thumbnails/" + filenames[0];
        })
        .on('end', function () {
            console.log('Screenshots taken');
            return res.json({ success: true, thumbsFilePath: thumbsFilePath, fileDuration: fileDuration})
        })
        .screenshots({
            // Will take screens at 20%, 40%, 60% and 80% of the video
            count: 3,
            folder: 'uploads/thumbnails',
            size:'320x240',
            // %b input basename ( filename w/o extension )
            filename:'thumbnail-%b.png'
        });
});


//mongoDB에 비디오 데이터 저장하기 - VideoPage
router.post("/uploadVideo", (req, res) => {
    //비디오 정보들을 DB에 저장
    const video = new Video(req.body)

    //mongoDB에 저장
    video.save( (err, doc) => {
        if(err) return res.json( { success : false, err } )
        res.status(200).json( { success: true } )
    }) 
});

//mongoDB로부터 비디오 데이터 가져오기 - LandingPage
router.get("/getVideos", (req, res) => {
    //비디오 정보들을 DB로부터 가져와 클라이언트에 전달하기
    Video.find()
        .populate('writer')
        .exec( (err, videos) => {
            if(err) return res.status(400).send(err);
            res.status(200).json( {success: true, videos})
        })
});

//mongoDB로부터 비디오 데이터 가져오기 - VideoDetailPage
router.post("/getVideoDetail", (req, res) => {
    //클라이언트가 보낸 비디오 ID를 사용하여 DB에서 해당 비디오 데이터 가져오기
    Video.findOne({ "_id" : req.body.videoId })
        .populate('writer')
        .exec( (err, videoDetail) => {
            if(err) return res.status(400).send(err);
            res.status(200).json( {success: true, videoDetail})
        })
});

//mongoDB로부터 구독한 유저들의 비디오 데이터 가져오기 - SubscriptionPage
router.post("/getSubscriptionVideos", (req, res) => {
    //step 1 : 자신의 아이디를 가지고 구독하는 사람들을 찾는다.
    Subscriber.find({ "userFrom": req.body.userFrom })
    .exec( (err, subscriberInfo) => {
        if(err) return res.status(400).send(err);

        let subscribedUser = [];
        subscriberInfo.map( (subscriber, idx) => {
            subscribedUser.push(subscriber.userTo)
        })

        //step 2 : 찾은 사람들의 비디오를 가지고 온다.
        Video.find({ writer: { $in : subscribedUser } })
            .populate('writer')
            .exec( (err, videos) => {
                if(err) return res.status(400).send(err);
                res.status(200).json( {success: true, videos})
            })
    })
});



module.exports = router;
