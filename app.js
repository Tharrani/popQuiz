

const express = require('express'),
     bodyparser = require('body-parser'),
     mongoclient = require('mongodb').MongoClient,
     assert = require('assert'),
     ObjectId = require('mongodb').ObjectId,
     path = require('path')

//const mongourl = 'mongodb://mguser:test123@ds123372.mlab.com:23372/day2'; //mongo url
//const dbname = 'day2'; // database name

const mongourl = process.env.MONGOURL 
console.log(process.env.PORT);
console.log(mongourl)

//initialize the express object.
var app = express()

//to declare handlebar path
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

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

mongoclient.connect(mongourl, {useNewUrlParser : true}, function(err, client){
    assert.equal(null, err);
    console.log('connecting to mongodb');
    const db = client.db(); // to get database object
    var quizCollection = db.collection('quiz')

       router.get('/list-quizes', (req,res,next)=>{
        quizCollection.find({}).project({correctAnswer: 0}).toArray(function(err, quizes){
            console.log('from mongodb....')
            console.log(JSON.stringify(quizes))
            res.render('listQuiz',{quizes: quizes})
       }) 
    })

    //this is an end point for cli - returns JSON
    //project is used to specify which you want and dont want, 1- fetch , 0 - dont fetch
    router.get('/quiz', function(request, response, next){
        quizCollection.find({}).project({correctAnswer: 0}).toArray(function(err, quizes){
            console.log('from mongodb....')
            console.log(JSON.stringify(quizes))
            response.json(quizes)
        })
        // response.json(popQuiz)
    })

    router.get('/show-newQuizform', function(request, response, next){
        response.render('newQuiz',{})
    })
    
    router.post('/newQuiz', function(request, response, next){
        var newpopQuizForm = request.body;
        var newpopQuiz = {
            question: newpopQuizForm.question,
            answers: [],
            correctAnswer: newpopQuizForm.correctAnswer
        }
        newpopQuiz.answers= [
            { selection: 'a', value: newpopQuizForm.answer1},
            { selection: 'b', value: newpopQuizForm.answer2},
            { selection: 'c', value: newpopQuizForm.answer3},
            { selection: 'd', value: newpopQuizForm.answer4},
    ]
        quizCollection.insertOne(newpopQuiz, function(err, result){
            console.log(result)
            client.close()
        });
        response.redirect('/list-quizes')
    })

    router.get('/show-EditQuiz/:qid', function(request, response, next){
                var qid = request.params.qid;
                console.log(qid);
                var oid = new ObjectId(qid);
                quizCollection.findOne({_id:oid}, (err, result)=>{
                    console.log('error in findOne', err);
                    console.log('result in findOne',JSON.stringify(result))  

                    var editquiz = {
                        id: qid,
                        question: result.question,
                        answer1: result.answers[0].value,
                        answer2: result.answers[1].value,
                        answer3: result.answers[2].value,
                        answer4: result.answers[3].value,
                        correctAnswer: result.correctAnswer
                    }

                response.render('editQuiz', {editquiz: editquiz})  
                })
                //response.json({id: qid})
    })

    router.post('/saveQuizform', function(request, response, next){
            console.log(JSON.stringify(request.body))
            var id = request.body.id;
            var oid = new ObjectId(id);
            quizCollection.updateOne(
                { '_id' : oid},
                { $set: { question: request.body.question,
                          answers: [
                        { selection: 'a', value: request.body.answer1},
                        { selection: 'b', value: request.body.answer2},
                        { selection: 'c', value: request.body.answer3},
                        { selection: 'd', value: request.body.answer4},
                ],
                    correctAnswer: request.body.correctAnswer
                     } 
                },
              function(err, result){
                console.log(result)
                response.redirect('/list-quizes')
            });
        })

    router.post('/check-answer', function(req,res,next){
        var answer = req.body;
        var isCorrect = false;
        console.log(answer.answer)
        console.log(answer.id)

        var oid = new ObjectId(answer.id);
        //JSON.stringfy - flatten data ; to remove unwanted stuff from json objects
        quizCollection.findOne({_id: oid}, (err, result)=>{
            console.log(JSON.stringify(result))
            
        console.log(result.correctAnswer)
        if(result.correctAnswer === answer.answer){
            console.log("CORRECT !");
            isCorrect = true
            }
        else{
            console.log("NOT CORRECT !");
            }
        res.json({result:isCorrect});
        })

    });
})

//1337
app.listen(process.env.PORT, function(){
    console.log('server is running')
})

