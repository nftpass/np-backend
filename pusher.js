var AWS = require('aws-sdk');

module.exports = {
    init: function() {
        AWS.config.credentials.accessKeyId = process.env.AWS_ACCESS_KEY_ID
        AWS.config.credentials.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
        AWS.config.update({region: 'REGION'});
        this.SQS_QUEUE_URL = process.env.SQS_QUEUE_URL ;
        this.sqs = new AWS.SQS({apiVersion: '2012-11-05'});
    },
    sendMessage: function(msgAttributes, msgBody, callback){
        var params = {
            MessageAttributes: msgAttributes,
            MessageBody: msgBody,
            QueueUrl: this.SQS_QUEUE_URL
        };
        console.log(params)
        this.sqs.sendMessage(params, function(err, data) {
            if (err) {
                console.log("Error", err);
                callback(false);
            } else {
                console.log("Success", data.MessageId);
                callback(true);
            }
        });
    }

}
