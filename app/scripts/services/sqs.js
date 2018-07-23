'use strict';

/**
 * @ngdoc service
 * @name moveditorApp.mvNav
 * @description
 * # mvNav
 * Service in the moveditorApp.
 */
angular.module('moveditorApp')
    .service('SQSService', [
        'MvHelperService',
        'ContentService',
        'TimelineService',
        function (MvHelperService, ContentService, TimelineService) {
            var self = this;
            this.sqs = null;
            this.receiveTimeOut = null;
            this.waitForReceiveTime = 100;

            this.sendQueueURL = "https://sqs.eu-west-1.amazonaws.com/362232955499/transcode_requests.fifo";
            this.receiveQueueURL = "https://sqs.eu-west-1.amazonaws.com/362232955499/transcode_results.fifo";

            this.index = 0;
            this.isInProcess = false;
            this.timelineListCopy = null;
            this.contentListCopy = null;

            this.progress = {
                progressBar: null,
                progressButton: null,
                done: 0,
                total: 0
            };

            this.init = function () {
                self.sqs = new AWS.SQS({"accessKeyId":"AKIAIZ2BRMVVYB5IWGYQ", "secretAccessKey": "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", "region": "eu-west-1"});
                // console.log('init:', self.sqs);
            };

            // ====================================================================================================
            // SQS SEGMENTATION
            // ====================================================================================================

            this.requestSegmentation = function (index) {

                if (index === 0) {
                    self.timelineListCopy = angular.copy(TimelineService.timelineList);
                    self.contentListCopy = angular.copy(ContentService.getContentList());
                }

                self.index = index;
                self.isInProcess = true;
                var chunk = self.timelineListCopy['video'][index];
                self.makeTotalProgress(index, self.timelineListCopy['video'].length);
                
                if (self.contentListCopy[chunk.objectListId].mpd === "") {
                    var segmentationId = String(chunk.objectListId);
                    var chunkUrl = self.contentListCopy[chunk.objectListId].url;
                    var chunkType = self.contentListCopy[chunk.objectListId].type;
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
                    console.log("SQS segmentation message: ", msg);

                    self.sendSegmentation(msg);
                    self.receiveSegmentation(segmentationId);
                } else {
                    self.finishedSegmentation();
                }
            };

            this.sendSegmentation = function (msg){
                var sqsParams = {
                    MessageBody: JSON.stringify(msg),
                    QueueUrl: self.sendQueueURL,
                    MessageGroupId: 'we3'
                };
                self.sqs.sendMessage(sqsParams, function(err, data) {
                    if (err) {
                        console.log('ERR', err);
                    }
                    console.log("send segmentation request successfully");
                    console.log("--------------------------------------------------------------");
                });
            };

            // modified from https://milesplit.wordpress.com/2013/11/07/using-sqs-with-node/
            this.receiveSegmentation = function (segmentationID) {
                var sqsParams = {
                    QueueUrl: self.receiveQueueURL,
                    // MessageGroupId: 'wesealize2',
                    MaxNumberOfMessages: 1,

                    // VisibilityTimeout: 60, // seconds - how long we want a lock on this job
                    // WaitTimeSeconds: 3 // seconds - how long should we wait for a message?
                };

                self.sqs.receiveMessage(sqsParams, function(err, data) {

                    if (data.Messages) {
                        if (data.Messages.length > 0) {
                            var message = data.Messages[0];
                            var body = JSON.parse(message.Body);

                            if (body.jobID === segmentationID) {

                                if (angular.isDefined(body.resultS3URL)) {
                                    console.log("received segmentation response", body);
                                    self.saveMpdUrlToContent(body.resultS3URL);
                                    clearTimeout(self.receiveTimeOut);
                                    self.makeProgress(100);
                                    self.finishedSegmentation();

                                } else if (angular.isDefined(body.progress)) {
                                    console.log("received data for jobID: " + body.jobID + ", progress: " + body.progress);
                                    self.makeProgress(body.progress);
                                    self.receiveTimeOut = setTimeout(function () { self.receiveSegmentation(segmentationID); }, self.waitForReceiveTime);
                                }

                                self.removeFromQueue(message);
                            } else {
                                self.receiveTimeOut = setTimeout(function () { self.receiveSegmentation(segmentationID); }, self.waitForReceiveTime);
                            }
                        } else {
                            self.receiveTimeOut = setTimeout(function () { self.receiveSegmentation(segmentationID); }, self.waitForReceiveTime);
                        }
                    }
                });
            };

            // ====================================================================================================
            // SQS STITCHING
            // ====================================================================================================

            this.requestStitching = function () {
                var configStitching = {
                    "LOG_LEVEL": "info",
                    "server": {
                        "url": "http://localhost:8090",
                        "staticFolder": "adstitcher-srv/public/mpds",
                        "dashEndpoint": "/Users/fr/Documents/adstitcher-srv/public/mpds/"
                    },
                    "content": []
                };

                for (var i = 0; i < self.timelineListCopy['video'].length; i++) {
                    var chunk = self.timelineListCopy['video'][i];
                    var mediaContent = {"type": self.contentListCopy[chunk.objectListId].type, "begin": chunk.start, "end": chunk.end, "offset": chunk.offset, "mute": chunk.mute, "hide": false, "url": self.contentListCopy[chunk.objectListId].mpd};
                    configStitching.content.push(mediaContent);
                };

                var stitchingId = MvHelperService.generateRandomHash(20);
                var msg = { jobID: stitchingId, config: configStitching, requestEnqueueTime: +new Date() };
                console.log("SQS stitching message: ", msg);

                self.sendStitchingConfig(msg);
                self.receiveStitchingConfig(stitchingId);
            };

            this.sendStitchingConfig = function (msg) {
                var sqsParams = {
                    MessageBody: JSON.stringify(msg),
                    QueueUrl: self.sendQueueURL,
                    MessageGroupId: 'we3'
                };
                self.sqs.sendMessage(sqsParams, function(err, data) {
                    if (err) {
                        console.log('ERR', err);
                    }
                    console.log("send stitching request successfully");
                    console.log("--------------------------------------------------------------");
                });
            };

            this.receiveStitchingConfig = function (stitchingId) {
                var sqsParams = {
                    QueueUrl: self.receiveQueueURL,
                    // MessageGroupId: 'wesealize2',
                    MaxNumberOfMessages: 1,

                    // VisibilityTimeout: 60, // seconds - how long we want a lock on this job
                    // WaitTimeSeconds: 3 // seconds - how long should we wait for a message?
                };

                self.sqs.receiveMessage(sqsParams, function(err, data) {

                    if (data.Messages) {
                        if (data.Messages.length > 0) {
                            var message = data.Messages[0];
                            var body = JSON.parse(message.Body);

                            if (body.jobID === stitchingId) {

                                if (angular.isDefined(body.resultS3URL)) {
                                    console.log("received stitching response", body);
                                    self.stopStitchingProcess();

                                } else if (angular.isDefined(body.progress)) {
                                    console.log("received data for jobID: " + body.jobID + ", progress: " + body.progress);
                                    self.makeProgress(body.progress);
                                    self.receiveTimeOut = setTimeout(function () { self.receiveStitchingConfig(stitchingId); }, self.waitForReceiveTime);
                                }

                                self.removeFromQueue(message);
                            } else {
                                self.receiveTimeOut = setTimeout(function () { self.receiveSegmentation(segmentationID); }, self.waitForReceiveTime);
                            }
                        } else {
                            self.receiveTimeOut = setTimeout(function () { self.receiveStitchingConfig(stitchingId); }, self.waitForReceiveTime);
                        }
                    }
                });
            };

            // ====================================================================================================
            // SQS service helper functions
            // ====================================================================================================

            this.removeFromQueue = function(message) {
                self.sqs.deleteMessage({
                    QueueUrl: self.receiveQueueURL,
                    ReceiptHandle: message.ReceiptHandle
                }, function(err, data) {
                    err && console.log(err);
                });
            };

            this.saveMpdUrlToContent = function (mpdUrl) {
                console.log("save mpd: ", mpdUrl);
                var chunk = self.timelineListCopy['video'][self.index];
                self.contentListCopy[chunk.objectListId].setMpd(mpdUrl);
            };

            this.finishedSegmentation = function () {
                self.makeTotalProgress((self.index + 1), self.timelineListCopy['video'].length);
                console.log("finished segmentation: " + (self.index + 1) + "/" + self.timelineListCopy['video'].length);
                if (self.timelineListCopy['video'].length - 1 === self.index) {
                    self.makeProgress(0);
                    self.requestStitching();
                } else {
                    var indexNext = self.index + 1;
                    self.requestSegmentation(indexNext);
                }
            };

            this.makeProgress = function (progress) {
                this.progress.progressBar = angular.element(document.getElementById('progressBar'));
                this.progress.progressBar[0].value = progress;
                if(progress > 100) {
                    this.progress.progressBar[0].value = 100;
                }

                if(progress < 0) {
                    this.progress.progressBar[0].value = 0;
                }
            };

            this.makeTotalProgress = function (done, total) {
                this.progress.progressButton = angular.element(document.getElementById('progressSendSQSButton'));
                this.progress.progressButton[0].innerHTML = done + ' / ' + total;
            };

            this.stopStitchingProcess = function () {
                clearTimeout(self.receiveTimeOut);
                self.makeProgress(0);
                self.progress.progressButton[0].innerHTML = 'send';
                self.timelineListCopy = null;
                self.contentListCopy = null;
                self.isInProcess = false;
            };

            this.receive10 = function () {
                console.log("receive 10");

                var sqsParams = {
                    QueueUrl: self.receiveQueueURL,
                    MaxNumberOfMessages: 10,

                    // VisibilityTimeout: 60, // seconds - how long we want a lock on this job
                    WaitTimeSeconds: 3 // seconds - how long should we wait for a message?
                };

                self.sqs.receiveMessage(sqsParams, function(err, data) {
                    if (data.Messages) {
                        console.log("data: ", data);
                    }
                });
            };

            self.init();
        }]);