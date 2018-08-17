//Day2 

const express = require('express')
const bodyparser = require('body-parser')
const mongoclient = require('mongodb').MongoClient
const assert = require('assert')

const mongourl = 'mongodb://mguser:test123@ds123372.mlab.com:23372/day2'; //mongo url
//const dbname = 'day2'; // database name

//initialize the express object
var app = express()
//init router
var router = express.Router();
//load router into express object
app.use(bodyparser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyparser.json({limit:'50mb'}))
app.use('/', router)

//model for quiz
// var popQuiz = {
//     question: 'What is your name', 
//     answers: [{selection: 'a', value: 'Tharrani'},
//               {selection: 'b', value: 'Sam'},
//               {selection: 'c', value: 'Kvothe'}],
//     correctAnswer: 'a'
// }

mongoclient.connect(mongourl, function(err, client){
    assert.equal(null, err);
    console.log('connecting to mongodb');
    const db = client.db(); // to get database object
    var quizCollection = db.collection('quiz')

    router.get('/quiz', function(request, response, next){
        quizCollection.find({}).toArray(function(err, quizes){
            console.log('from mongodb....')
            console.log(JSON.stringify(quizes))
            response.json(quizes)
        })
        // response.json(popQuiz)
    })
    
    router.get('/testing', function(request, response, next){
        quizCollection.insertOne(popQuiz, function(err, result){
            console.log(result)
            client.close()
        });
        response.json({})
    })
})

router.post('/check-answer', function(req,res,next){
    var answer = req.body;
    var isCorrect = false;
    console.log(answer.answer)
    console.log(popQuiz.correctAnswer)
    if(popQuiz.correctAnswer === answer.answer){
        console.log("CORRECT !");
        isCorrect = true
    }
    else{
        console.log("NOT CORRECT !");
    }
    
    res.json({result:isCorrect});
});

app.listen(1337, function(){
    console.log('server is running')
})

//------------------------------------------------------------------------------------//

