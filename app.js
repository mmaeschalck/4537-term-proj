var utils = require("./utils/utils");

const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const app = express();
const endPointRoot = "/API/v1/";
const PORT = 80;
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "termproj",
  // port: "3306",
});

// TODO's
// * Use utils.increment_call_count in every request block to update stats
// * Add a PUT request.

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  next();
});

// get JSON array of API call stats from stats table. ## VERIFIED WORKING
app.get("/API/v1/stats/", (req, res) => {
  utils.increment_call_count(connection, "GET stats");
  console.log("GET received.");
  console.log(req.query);
  if (req.query.username == "root" && req.query.pass == "root") {
    connection.query("SELECT * FROM stats", (err, result) => {
      if (err) throw err;
      res.send(JSON.stringify(result, null, "\t"));
    });
  } else {
    res.send("Incorrect Info");
  }
});

// Get a random question from the database, scramble answers. ## VERIFIED WORKING
app.get("/API/v1/question/", (req, res) => {
  utils.increment_call_count(connection, "GET question");
  let amount = 1;
  if (req.query.amount > 1) {
    amount = req.query.amount;
  }
  if (req.query.questionid) {
    connection.query(
      `SELECT * FROM questions WHERE questionid = ${req.query.questionid}`,
      (err, result) => {
        if (err) throw err;
        res.send(result);
      }
    );
  } else {
    connection.query(
      `SELECT * FROM questions ORDER BY RAND() LIMIT ${amount};`,
      (err, result) => {
        if (err) throw err;
        console.log(result);
        let answers_list = JSON.parse(result[0].incorrect_answer);
        answers_list.push(result[0].correct_answer);
        utils.shuffleArray(answers_list);
        let info_to_send = {
          questionid: result[0].questionid,
          category: result[0].category,
          type: result[0].type,
          question: result[0].question,
          answers_list: answers_list,
        };
        res.send(info_to_send);
      }
    );
  }
});

// Get all top number of user scores ## VERIFIED WORKING
app.get("/API/v1/score/", urlencodedParser, (req, res) => {
  utils.increment_call_count(connection, "GET score");
  let count = 1;
  let data = JSON.parse(JSON.stringify(req.body));
  if (data.count > 1) {
    count = data.count;
  }
  let query_string = `SELECT * FROM scores ORDER BY score DESC`;
  connection.query(query_string, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// post a user response to question ## VERIFIED WORKING
app.post("/API/v1/answer/", urlencodedParser, (req, res) => {
  utils.increment_call_count(connection, "POST answer");
  let answer_data = JSON.parse(JSON.stringify(req.body));
  /* ans = {
    questionid: ,
    answer: ,
    userid: , ## NOT NECESSARY
  }
  */
  console.log(answer_data);
  connection.query(
    `SELECT * FROM questions WHERE questionid = '${parseInt(
      answer_data.questionid
    )}'`,
    (err, result) => {
      if (err) throw err;
      console.log("skdjfl");
      console.log(result[0]);
      let is_correct = result[0].correct_answer == answer_data.answer;
      console.log(result[0].correct_answer);
      console.log(answer_data.answer);
      let to_send = {
        questionid: answer_data.questionid,
        is_correct: is_correct,
      };
      console.log(to_send);
      res.send(to_send);
    }
  );
});

// post a question to the database. ## VERIFIED WORKING
app.post("/API/v1/question/", urlencodedParser, (req, res) => {
  utils.increment_call_count(connection, "POST question");
  let question = JSON.parse(JSON.stringify(req.body));
  let insert_query =
    `INSERT INTO questions (category, type, difficulty, question, correct_answer, incorrect_answer) VALUES (` +
    `'${question.category}', ` +
    `'${question.type}', ` +
    `'${question.difficulty}', ` +
    `'${question.question}', ` +
    `'${question.correct_answer}', ` +
    `'${question.incorrect_answer}' )`;
  insert_query.replace('"', '""');
  connection.query(insert_query, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Add a new user to the database ## NOT USED
app.post("/API/v1/user/", (req, res) => {
  utils.increment_call_count(connection, "POST user");
  let name = req.query.username;
  let add_query = `INSERT INTO users (username) VALUES ('${name}')`;
  connection.query(add_query, (err, result) => {
    if (err) throw err;
    let to_send = {
      userid: result.insertId,
      username: name,
    };
    res.send(to_send);
  });
});

// post a new score to the database ## VERIFIED WORKING
app.post("/API/v1/score/", urlencodedParser, (req, res) => {
  utils.increment_call_count(connection, "POST score");
  let scoreJ = JSON.parse(JSON.stringify(req.body));
  console.log(scoreJ);
  let username = scoreJ.username;
  let score = scoreJ.score;
  let add_query = `INSERT INTO scores (username, score) VALUES ('${username}', ${parseInt(
    score
  )})`;
  connection.query(add_query, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// PUT new information in place of an existing question. ## VERIFIED WORKING
app.put("/API/v1/question/", urlencodedParser, (req, res) => {
  utils.increment_call_count(connection, "PUT question");
  let data = JSON.parse(JSON.stringify(req.body));
  let questionid = data.questionid;
  let question = data;
  let update_query =
    `UPDATE questions SET ` +
    `category = '${question.category}', ` +
    `type = '${question.type}', ` +
    `difficulty = '${question.difficulty}', ` +
    `question = '${question.question}', ` +
    `correct_answer = '${question.correct_answer}', ` +
    `incorrect_answer = '${question.incorrect_answer}' ` +
    `WHERE questionid = ${questionid}`;
  connection.query(update_query, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// delete question from DB given its question id ## VERIFIED WORKING
app.delete("/API/v1/question/", (req, res) => {
  utils.increment_call_count(connection, "DELETE question");
  let questionid = req.query.questionid;
  let del_query = `DELETE FROM questions WHERE questionid=${questionid}`;
  connection.query(del_query, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

console.log("STARTING PROJ SERVER");
app.listen(PORT, (err) => {
  if (err) throw err;
  console.log("LISTENING ON PORT", PORT);
});
