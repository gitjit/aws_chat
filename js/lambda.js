var AWS = require('aws-sdk');
var S3 = new AWS.S3();
var bucket = 'jit-aws-chat';

exports.handler = function(event, context, callback) {

    // console.log(context);
    const path = event.pathParameters.proxy;
    console.log('Chat Path = ' + path);

    const done = function(err, res) {
        callback(null, {
            statusCode: err ? '400' : '200',
            body: err ? err.message : JSON.stringify(res),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    };

    if (path == "conversations") {
        S3.getObject({
            Bucket: bucket,
            Key: 'data/conversations.json'
        }, function(err, data) {
            done(err, err ? null : JSON.parse(data.Body.toString()));
        });
    }
    else if (path.startsWith('conversations/')) {
        var id = path.substring('conversations/'.length);
        S3.getObject({
            Bucket: bucket,
            Key: 'data/conversations/' + id + '.json'
        }, function(err, data) {
            done(err, err ? null : JSON.parse((data.Body.toString())));
        });
    }
    else {
        done('No cases hit');
    }
};
