const prompt = require('prompt')
const request = require('request')

var schema ={
    properties: 
    {
     answer: {
                required: true
               }
    }
}

const API_URL = "http://localhost:1337/";
const QUIZ_API_URL = `${API_URL}quiz`;
const CHECK_ANSWER_API_URL = `${API_URL}check-answer`;
//const QUIZ_API_URL = "http://localhost:1337/quiz"
prompt.start()

request(QUIZ_API_URL, function (error, response, body) {
    //console.log('error:', error); // Print the error if one occurred
    //console.log(body);
    var popQuiz = JSON.parse(body);
    //console.log(popQuiz);

    console.log(popQuiz.length());
    var randonpopQuiz = Math.floor(Math.random() * Math.floor(popQuiz.length));
    console.log(randonpopQuiz);

    finalpopQuiz =  popQuiz[randonpopQuiz] ;
    console.log(finalpopQuiz._id)
    console.log(popQuiz.question + "\n");
    popQuiz.answers.forEach(element => {
         console.log(element.selection + ". "  + element.value + "\n");
    });
});

setTimeout(function(){
//use node app.js instead of nodemon... else it autoenters password also doesnt hide password
prompt.get(schema, function(err, result) {
    console.log('Answer: '+ result.answer)    
    
    var inputAnswer = {
        answer: result.answer,
        id: finalpopQuiz._id
    }
    request({
        url: CHECK_ANSWER_API_URL,
        method: "POST",
        json: inputAnswer
    }, function(error, response, body){
        console.log("Body", body);
        console.log("TypeofBody",typeof(body.result));
        if(body.result === true){
            console.log("BINGO !");
            }
        else{
            console.log("TRY AGAIN !");
            }
        process.exit(1);
        })
    });
}, 2000)
