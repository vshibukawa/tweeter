/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

/*************************************************************************************
 DOCUMENT READY
*************************************************************************************/
$(document).ready(() => {

/*------------------------------------------------------------------------------------
  FUNCTIONS
------------------------------------------------------------------------------------*/

  const createTweetElement = (data) => {
    const $article = $('<article></article>');
    $article.addClass("tweet-article");

    // build header
    const $header = $('<header></header>');
    const $avatar = $(`<img>`);
    $avatar.attr("src",data.user.avatars.small);
    $header.append($avatar);
    const $nameLabel = $('<label></label>');
    const $nameStrong = $(`<strong></strong>`);
    $nameStrong.text(data.user.name);
    $nameLabel.append($nameStrong);
    $header.append($nameLabel);
    const $handleLabel = $(`<label></label>`);
    $handleLabel.addClass('tag');
    $handleLabel.text(data.user.handle);
    $header.append($handleLabel);

    // build main
    const $main = $('<main></main>');
    const $p = $('<p></p>');
    $p.text(data.content.text);
    $main.append($p);

    // build footer
    const $footer = $('<footer></footer>');
    const $label = $(`<label></label>`);
    $label.text(moment(Date.now()).from(data.created_at).replace('in', '') + ' ago');
    $footer.append($label);
    const $div = $('<div></div>');
    $div.addClass("icons");
    const $heart = $('<i></i>');
    $heart.addClass("fas fa-heart");
    const $retweet = $('<i></i>');
    $retweet.addClass("fas fa-retweet");
    const $flag = $('<i></i>');
    $flag.addClass("fas fa-flag");
    $div.append($heart);
    $div.append($retweet);
    $div.append($flag);
    $footer.append($div);

    // append
    $article.append($header);
    $article.append($main);
    $article.append($footer);

    return $article;
  }

  // loops through tweets
  // calls createTweetElement for each tweet
  // takes return value and appends it to the tweets container
  const renderTweets = (tweets) => {
    const newTweets = [];
    tweets.forEach(tweetData => {
      let $tweet = createTweetElement(tweetData);
      $('#tweets-container').append($tweet);
    });

    // to add it to the page so we can make sure it's got all the right elements, classes, etc.
    $('#tweets-container').append(newTweets);
  }

  const loadTweets = () => {
    $.ajax('/tweets', { method: 'GET' })
      .then(function (tweets) {
        if(tweets){ renderTweets(tweets); }
      });
  }

/*------------------------------------------------------------------------------------

------------------------------------------------------------------------------------*/
  $('.new-tweet .counter').text(charCount);

  loadTweets();

/*------------------------------------------------------------------------------------
    EVENTS
------------------------------------------------------------------------------------*/

  // compose
  $('#btn-compose').click( function(e){

    $( '.new-tweet' ).slideToggle();
    e.preventDefault();

    const $this = $(this);
    const clicked = 'btn-nav-cliked';
    const unclicked = 'btn-nav-uncliked';
    let remove = unclicked;
    let add = clicked;

    if($this.hasClass(clicked)){
      remove = clicked;
      add = unclicked;

    }else{
      messages.clearMessage('.new-tweet .message');
    }

    $('.new-tweet textarea').focus();

    $(this).removeClass(remove);
    $(this).addClass(add);
  });

  // submit tweet
  $('.new-tweet form').submit(function(e){
    e.preventDefault();


    // usrInput = "text=blablablaba"
    const usrInput = $('textarea', $(this).parent()).serialize();
    let inputs = usrInput.split('=');
    let message = '';

    if( ( !inputs[1] ) || ( !inputs[1].replace(/\s/g, '') ) ){
      message = 'Invalid text';
    }

    if( Number($('.counter', $(this).parent()).text()) < 0){
      message = 'Content is too long' ;
    }

    if(message){
      messages.setMessage('.new-tweet .message', message, messages.error);
    }else{

      $.post('/tweets', usrInput)
      .done(function(newTweet){

        if(newTweet){

          let $tweet = createTweetElement(newTweet);
          $('#tweets-container').prepend($tweet);
          $('.new-tweet textarea').val('');
          $('.new-tweet .counter').text(charCount);
          messages.clearMessage('.new-tweet .message');
         }
      })
      .fail(function(err){
        const { error, message } = XHR.responseJSON;
        messages.setMessage('.new-tweet .message', message, messages.error);
      });
    }
  });


});