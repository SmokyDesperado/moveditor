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
            this.progressBar = null;

            this.init = function () {
                self.sqs = new AWS.SQS({"accessKeyId":"AKIAIZ2BRMVVYB5IWGYQ", "secretAccessKey": "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", "region": "eu-west-1"});
                console.log('init:', self.sqs);
            };

            // ====================================================================================================
            // SQS SEGMENTATION
            // ====================================================================================================

            this.requestSegmentation = function (index) {

                self.index = index;
                self.isInProcess = true;
                var chunk = TimelineService.timelineList['video'][index];
                var contentList = ContentService.getContentList();
                
                if (contentList[chunk.objectListId].mpd === "") {

                    // setup progress bar
                    self.progressBar = document.getElementById('progress_bar');
                    var svgElements = self.progressBar.getElementsByTagName("svg");
                    while (svgElements[0]) {
                        svgElements[0].parentNode.removeChild(svgElements[0]);
                    }
                    self.progressBar = new ProgressBar.Line('#progress_bar', {
                        strokeWidth: 4,
                        easing: 'easeInOut',
                        duration: 1400,
                        color: '#36b436',
                        from: { color: '#fffc4c' },
                        to: { color: '#36b436' },
                        step: function(state, line, attachment) {
                            line.path.setAttribute('stroke', state.color);
                        }
                    });

                    var segmentationId = String(chunk.objectListId);
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
                                    self.progressBar.animate(1.0);
                                    self.finishedSegmentation();

                                } else if (angular.isDefined(body.progress)) {
                                    console.log("received data for jobID: " + body.jobID + ", progress: " + body.progress);
                                    self.progressBar.animate(body.progress / 100);
                                    self.receiveTimeOut = setTimeout(self.receiveSegmentation(segmentationID), 3000);
                                }

                                self.removeFromQueue(message);
                            }
                        } else {
                            self.receiveTimeOut = setTimeout(self.receiveSegmentation(segmentationID), 3000);
                        }
                    }
                });
            };

            // ====================================================================================================
            // SQS STITCHING
            // ====================================================================================================

            this.requestStitching = function (timelineList) {
                var configStitching = {
                    "LOG_LEVEL": "info",
                    "server": {
                        "url": "http://localhost:8090",
                        "staticFolder": "adstitcher-srv/public/mpds",
                        "dashEndpoint": "/Users/fr/Documents/adstitcher-srv/public/mpds/"
                    },
                    "content": []
                };

                var contentList = ContentService.getContentList();
                var timelineList = TimelineService.getTimelineList();

                for (var i = 0; i < timelineList['video'].length; i++) {
                    var chunk = TimelineService.timelineList['video'][i];
                    var mediaContent = {"type": contentList[chunk.objectListId].type, "begin": chunk.start, "end": chunk.end, "offset": chunk.offset, "mute": chunk.mute, "hide": false, "url": contentList[chunk.objectListId].mpd};
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
                                    clearTimeout(self.receiveTimeOut);
                                    self.progressBar.animate(0.0);
                                    self.isInProcess = false;

                                } else if (angular.isDefined(body.progress)) {
                                    console.log("received data for jobID: " + body.jobID + ", progress: " + body.progress);
                                    self.progressBar.animate(body.progress / 100);
                                    self.receiveTimeOut = setTimeout(self.receiveStitchingConfig(stitchingId), 3000);
                                }
                            
                                self.removeFromQueue(message);
                            }
                        } else {
                            self.receiveTimeOut = setTimeout(self.receiveStitchingConfig(stitchingId), 3000);
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
                var chunk = TimelineService.timelineList['video'][self.index];
                ContentService.getContentList()[chunk.objectListId].setMpd(mpdUrl);
            };

            this.finishedSegmentation = function () {
                console.log("finished segmentation: " + (self.index + 1) + "/" + TimelineService.timelineList['video'].length);
                if (TimelineService.timelineList['video'].length - 1 === self.index) {
                    self.progressBar.animate(0.0);
                    self.requestStitching(TimelineService.timelineList['video']);
                } else {
                    var indexNext = self.index + 1;
                    self.requestSegmentation(indexNext);
                }
            }

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
