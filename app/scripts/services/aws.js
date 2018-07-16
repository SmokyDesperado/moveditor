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
        'TimelineService',
        function (MvHelperService, ContentService, TimelineService) {
            var self = this;
            this.sqs = null;
            this.receiveTimeOut = null;

            this.sendQueueURL = "https://sqs.eu-west-1.amazonaws.com/362232955499/transcode_requests.fifo";
            this.receiveQueueURL = "https://sqs.eu-west-1.amazonaws.com/362232955499/transcode_results.fifo";

            this.index = 0;

            this.init = function () {
                this.sqs = new AWS.SQS({"accessKeyId":"AKIAIZ2BRMVVYB5IWGYQ", "secretAccessKey": "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", "region": "eu-west-1"});
                console.log('init:', this.sqs);
            };

            this.requestSegmentation = function (index) {

                self.index = index;
                var chunk = TimelineService.timelineList['video'][index];

                console.warn(chunk, index);
                var contentList = ContentService.getContentList();
                var segmentationId = String(MvHelperService.generateRandomHash(6));
                var chunkUrl = contentList[chunk.objectListId].url;
                var chunkType = contentList[chunk.objectListId].type;
                var chunkLength = chunk.end - chunk.start;

                switch (chunkType) {

                }
                var msg = {jobID: segmentationId, S3URL: chunkUrl, encodingprofile: "default", requestEnqueueTime: +new Date()};

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

                this.sendSqs(msg);
                this.receiveSqs(segmentationId, index);

                //this.requestStitching(timelineList);

            };

            this.requestStitching = function (timelineList) {
                var configIni = {"LOG_LEVEL":"info", "server":{"url":"http://localhost:9000","staticFolder":"adstitcher-srv/public/mpds","dashEndpoint":"/Users/fr/Documents/adstitcher-srv/public/mpds/"}};
                var content = {"content":[]};

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
                for (var i = 0; i < TimelineService.timelineList['video'].length; i++) {
                    //ToDo Han

                }

                var msg = { config: configStitching, requestEnqueueTime: + new Date() };
                // this.sendSqs(msg);
            };

            this.sendSqs = function (msg){
                var sqsParams = {
                    MessageBody: JSON.stringify(msg),
                    QueueUrl: this.sendQueueURL,
                    MessageGroupId: 'we3'
                };
                this.sqs.sendMessage(sqsParams, function(err, data) {
                    if (err) {
                        console.log('ERR', err);
                    }
                    console.log("send complete: ", data);
                    console.log("--------------------------------------------------------------");
                });
            };

            // modified from https://milesplit.wordpress.com/2013/11/07/using-sqs-with-node/
            this.receiveSqs = function (segmentationID, index) {
                var sqsParams = {
                    QueueUrl: this.receiveQueueURL,
                    // MessageGroupId: 'wesealize2',
                    MaxNumberOfMessages: 1,

                    // VisibilityTimeout: 60, // seconds - how long we want a lock on this job
                    // WaitTimeSeconds: 3 // seconds - how long should we wait for a message?
                };

                this.sqs.receiveMessage(sqsParams, function(err, data) {

                    // If there are any messages to get
                    if (data.Messages) {
                        // console.log("data: ", data);

                        // Get the first message (should be the only one since we said to only get one above)
                        if (data.Messages.length > 0) {
                            var message = data.Messages[0];

                            var body = JSON.parse(message.Body);
                            if (angular.isDefined(body.resultS3URL) && body.jobID === segmentationID) {
                                self.saveMpdUrlToContent(body.resultS3URL);  // whatever you wanna do
                                clearTimeout(self.receiveTimeOut);
                            } else {
                                self.receiveTimeOut = setTimeout(self.receiveSqs(segmentationID), 3000);
                            }
                            // Clean up after yourself... delete this message from the queue, so it's not executed again
                            console.log("jobID: ", body.jobID);
                            if (body.jobID === segmentationID) {
                                self.removeFromQueue(message, body.jobID, body.progress, self.index);
                            }
                        } else {
                            self.receiveTimeOut = setTimeout(self.receiveSqs(segmentationID), 3000);
                        }
                    }
                });
            };

            this.receive10 = function () {
                console.log("receive 10");

                var sqsParams = {
                    QueueUrl: this.receiveQueueURL,
                    // MessageGroupId: 'wesealize2',
                    MaxNumberOfMessages: 10,

                    // VisibilityTimeout: 60, // seconds - how long we want a lock on this job
                    WaitTimeSeconds: 3 // seconds - how long should we wait for a message?
                };

                this.sqs.receiveMessage(sqsParams, function(err, data) {

                    // If there are any messages to get
                    if (data.Messages) {
                        console.log("data: ", data);
                    }
                });
            };

            this.saveMpdUrlToContent = function (mpdUrl) {
                console.log("mpdUrl: ", mpdUrl);
            };

            this.removeFromQueue = function(message, jobID, progress) {

                this.sqs.deleteMessage({
                    QueueUrl: this.receiveQueueURL,
                    ReceiptHandle: message.ReceiptHandle
                }, function(err, data) {
                    // If we errored, tell us that we did
                    err && console.log(err);
                });

                if (angular.isDefined(progress)) {
                    console.log("ID: " + jobID + ", progress: " + progress);
                } else {
                    console.log("finish");

                    if (TimelineService.timelineList['video'].length - 1 === self.index) {
                        self.requestStitching(TimelineService.timelineList['video']);
                    } else {
                        var indexNext = self.index + 1;
                        self.requestSegmentation(indexNext);
                    }
                }
            };

            this.init();
        }]);
