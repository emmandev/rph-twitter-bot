/**
 * Reddit Bot
 * https://www.reddit.com/user/rph_twitter_bot
 *
 * Twitter Bot
 * https://twitter.com/rph_bot
 *
 */

'use strict';

require('dotenv').config();

const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');
const Twit = require('twit'); 
const Reddit = require('./reddit');
const Twitter  = require('./twitter');

const striptags = require('striptags');

// Custom api
const reddit = new Reddit();
const twitter = new Twitter();

// Build Snoowrap and Snoostorm clients
const r = new Snoowrap({
    userAgent: 'reddit-bot-example-node',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});
const client = new Snoostorm(r);

const t = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: process.env.TWITTER_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
});


// Configure options for stream
const streamOpts = {
    subreddit: 'testingground4bots',
    // subreddit: 'philippines',
    results: 15
};


// Create a Snoostorm submissionStream  with the specified options
const comments = client.CommentStream(streamOpts);


// On comment, see if user is asking to tweet ancestor content
comments.on('comment', (comment) => {
    /*
     * Catches the phrase 'phlease tweet this!'
     *
     * (Coming soon?)
     * Optional query /^n/ where:
     *      n   =>   number of ancestors to include in the tweet (defaults to 1, which is the parent)
     * example: 'phlease tweet this! ^2'
     */
    var regex = /phlease tweet this!\s*(\^{1}\d)?/gi,
        match = regex.exec( comment.body );

    if( match ){

        // coming soon
        if( match.indexOf( '^' ) !== -1 ){
            var ancestors = match.split('^');
            ancestors = ancestors[1];
        }
        // coming soon

        // get parent comment
        r.getComment(comment.parent_id)
            .fetch()
            .then((parentComment) => {

                // tweet it
                t.post(
                    'statuses/update',
                    { 
                        status: twitter.setContent({
                            id:  comment.parent_id,
                            body: striptags( parentComment.body_html ),
                            user: parentComment.author.name,
                            link: comment.link_permalink + parentComment.id
                        }),
                        enable_dm_commands: false
                    },
                    (error, data, response) => { 
                        if( !error ){
                            // Reply to user
                            comment.reply( '[Tweeted!](https://twitter.com/statuses/' + data.id_str + ')' );
                        }
                        else {
                            console.log(error);
                        }
                    }
                );
            });
    }
});
