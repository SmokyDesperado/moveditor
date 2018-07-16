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
            this.isInProcess = false;

            this.init = function () {
                this.sqs = new AWS.SQS({"accessKeyId":"AKIAIZ2BRMVVYB5IWGYQ", "secretAccessKey": "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", "region": "eu-west-1"});
                console.log('init:', this.sqs);
            };

            this.requestSegmentation = function (index) {

                self.index = index;
                this.isInProcess = true;
                var chunk = TimelineService.timelineList['video'][index];
                var contentList = ContentService.getContentList();
                
                if (contentList[chunk.objectListId].mpd === "") {
                    var segmentationId = String(MvHelperService.generateRandomHash(6));
                    var chunkUrl = contentList[chunk.objectListId].url;
                    var chunkType = contentList[chunk.objectListId].type;
                    var chunkLength = chunk.end - chunk.start;

                    var msg = null;
                    switch (chunkType) {
                        case 'video':
                            msg = { jobID: segmentationId, S3URL: chunkUrl, encodingprofile: "default", requestEnqueueTime: +new Date() };
                            break;
                        case 'image':
                            msg = { jobID: segmentationId, S3URL: chunkUrl, loop: chunkLength, encodingprofile: "default", requestEnqueueTime: +new Date() };
                            break;
                        case 'audio':
                            msg = { jobID: segmentationId, S3URL: chunkUrl, onlyaudio: "true", encodingprofile: "default", requestEnqueueTime: +new Date() };
                            break;
                        default:
                            break;
                    };

                    this.sendSegmentation(msg);
                    this.receiveSegmentation(segmentationId);
                } else {
                    self.finishedSegmentation();
                }
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
                var contentList = ContentService.getContentList();
                var timelineList = TimelineService.getTimelineList();
                for (var i = 0; i < timelineList['video'].length; i++) {
                    //ToDo Han
                    var chunk = TimelineService.timelineList['video'][i];
                    var chunkMpd = contentList[chunk.objectListId].mpd;

                }

                var configStitching = null;
                var msg = { config: configStitching, requestEnqueueTime: + new Date() };
                // this.sendSegmentation(msg);
            };

            this.sendSegmentation = function (msg){
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
            this.receiveSegmentation = function (segmentationID) {
                var sqsParams = {
                    QueueUrl: this.receiveQueueURL,
                    // MessageGroupId: 'wesealize2',
                    MaxNumberOfMessages: 1,

                    // VisibilityTimeout: 60, // seconds - how long we want a lock on this job
                    // WaitTimeSeconds: 3 // seconds - how long should we wait for a message?
                };

                this.sqs.receiveMessage(sqsParams, function(err, data) {

                    if (data.Messages) {

                        // console.log("data: ", data);
                        if (data.Messages.length > 0) {
                            var message = data.Messages[0];

                            var body = JSON.parse(message.Body);
                            if (angular.isDefined(body.resultS3URL) && body.jobID === segmentationID) {
                                self.saveMpdUrlToContent(body.resultS3URL);  // whatever you wanna do
                                clearTimeout(self.receiveTimeOut);
                            } else {
                                self.receiveTimeOut = setTimeout(self.receiveSegmentation(segmentationID), 3000);
                            }

                            // Clean up after yourself... delete this message from the queue, so it's not executed again
                            if (body.jobID === segmentationID) {
                                self.removeFromQueue(message, body.jobID, body.progress, self.index);
                            }
                        } else {
                            self.receiveTimeOut = setTimeout(self.receiveSegmentation(segmentationID), 3000);
                        }
                    }
                });
            };

            this.saveMpdUrlToContent = function (mpdUrl) {
                console.log("save mpd: ", mpdUrl);
                var chunk = TimelineService.timelineList['video'][self.index];
                var contentList = ContentService.getContentList();
                contentList[chunk.objectListId].setMpd(mpdUrl);
            };

            this.removeFromQueue = function(message, jobID, progress) {

                this.sqs.deleteMessage({
                    QueueUrl: this.receiveQueueURL,
                    ReceiptHandle: message.ReceiptHandle
                }, function(err, data) {
                    err && console.log(err);
                });

                if (angular.isDefined(progress)) {
                    console.log("received data for jobID: " + jobID + ", progress: " + progress);
                } else {
                    console.log("finish");
                    self.finishedSegmentation();
                }
            };

            this.finishedSegmentation = function () {
                if (TimelineService.timelineList['video'].length - 1 === self.index) {
                    self.requestStitching(TimelineService.timelineList['video']);
                    this.isInProcess = false; // TODO: should later be moved to receiveStitching when everything is realy finished
                } else {
                    var indexNext = self.index + 1;
                    self.requestSegmentation(indexNext);
                }
            }

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
                    if (data.Messages) {
                        console.log("data: ", data);
                    }
                });
            };

            this.init();
        }]);
