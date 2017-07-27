'use strict';

var twitterApi = class TwitterApi {
    //--- reddit content to be tweeted
    setContent(content){
        var tweet = content.user + ':\n\n';
        tweet += content.body;
        tweet += content.link;

        return tweet;
    }
};

module.exports = twitterApi;