'use strict';

/**
 * @ngdoc service
 * @name moveditorApp.mvNav
 * @description
 * # mvNav
 * Service in the moveditorApp.
 */
angular.module('moveditorApp')
    .service('AWSService', [
        'MvHelperService',
        'ContentService',
        function (MvHelperService, ContentService) {
            var self = this;

            //this.aws = null;
            this.aws = require('aws-sdk')

            this.init = function () {
                this.aws = new AWS.SQS({"accessKeyId":"AKIAIZ2BRMVVYB5IWGYQ", "secretAccessKey": "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", "region": "eu-west-1"});
                console.log('init:', this.aws);
            };

            this.requestSegmentation = function (contetnMaterialIndex, url) {
                timelineList = this.getTimelineList();
                //testUrl = "";

                // send segmentation request for each item in timeline
                // - Video
                //   msg = { jobID: "123456", S3URL: "https://s3-eu-west-1.amazonaws.com/advwebbucketnew/videoplayback.mp4", encodingprofile: "default", requestEnqueueTime: + new Date() };​
                //
                // - Image (the result in this example will be a 30 seconds video)
                //   msg = { jobID: "123456", S3URL: "https://s3-eu-west-1.amazonaws.com/advwebbucketnew/example.jpg", loop: "30", encodingprofile: "default", requestEnqueueTime: + new Date() };​
                //
                // - audio (currently not supported by the backend)
                //   msg = { jobID: "123456", S3URL: "https://s3-eu-west-1.amazonaws.com/advwebbucketnew/videoplayback.mp4", onlyaudio:"true", encodingprofile: "default", requestEnqueueTime: + new Date() };​

                for(var i = 0; i<timelineList.length; i++) {
                    segmentationId = "231982"; //String(this.generateRandomHash(6));

                    //ToDO if type is video, image or audio
                    msg = {jobID: segmentationId, S3URL: timelineList[i].getUrl(), encodingprofile: "default", requestEnqueueTime: +new Date()};

                    this.sendSqs(msg);
                    this.receiveSqs();
                }
                //this.receiveSqs();

                this.requestStitching(timelineList);

                };

                this.requestStitching = function (timelineList) {
                    configIni = {"LOG_LEVEL":"info", "server":{"url":"http://localhost:9000","staticFolder":"adstitcher-srv/public/mpds","dashEndpoint":"/Users/fr/Documents/adstitcher-srv/public/mpds/"}};
                    content = {"content":[]};

                    // add each item in timeline into stitching config;
                    //        {
                    //         "type": "video",
                    //         "begin": 7000,
                    //         "end":0,
                    //         "offset":0,
                    //         "mute": false,
                    //         "hide": false,
                    //         "url": "http://dash.fokus.fraunhofe.com/jhk/Manifest.mpd"
                    //       },
                    for (var i = 0; i < timelineList.length; i++) {
                        //ToDo Han

                    }

                    msg = { config: configStitching, requestEnqueueTime: + new Date() };
                    this.sendSqs(msg);
            };

            this.sendSqs = function (msg){
                var sqsParams = {
                    MessageBody: JSON.stringify(msg),
                    QueueUrl: config["https://sqs.eu-west-1.amazonaws.com/362232955499/transcode_requests.fifo"],
                    MessageGroupId: 'we3'
                };
                sqs.sendMessage(sqsParams, function(err, data) {
                    if (err) {
                        console.log('ERR', err);
                    }
                    console.log(data);
                    console.log("--------------------------------------------------------------");
                });
            };

            this.receiveSqs = function () {
                var sqsParams = {
                    QueueUrl: "https://sqs.eu-west-1.amazonaws.com/362232955499/transcode_results.fifo",
                    MessageGroupId: 'we3',
                    MaxNumberOfMessages: 10

                };
                sqs.receiveMessage(params, function(err, data) {
                    console.log(data);
                });
            };

            this.init();
        }]);
