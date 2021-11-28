// take a db connection and a call type and increment
module.exports = {
  increment_call_count: function (connection, call_type) {
    let query_string = `SELECT * FROM stats WHERE method = '${call_type}'`;
    let update_query = "";
    connection.query(query_string, (err, result) => {
      if (err) throw err;
      let old_score = result.uses;
      update_query = `UPDATE stats SET uses= '${
        old_score + 1
      }' WHERE method='${call_type}'`;
    });
    connection.query(update_query, (err, result) => {
      if (err) throw err;
    });
  },

  // shuffle an array (of questions)
  shuffleArray: function (array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  },

  // take a DB connection and a userid, increment the user's score.
  increment_score: function (connection, userid) {
    let score = 0;
    let query_string = `SELECT * FROM score WHERE userid = '${userid}'`;
    let update_query = "";
    connection.query(query_string, (err, result) => {
      if (err) throw err;
      let score = result.score + 1;
      update_query = `UPDATE score SET score= '${score}' WHERE userid='${userid}'`;
    });
    connection.query(update_query, (err, result) => {
      if (err) throw err;
    });
    return score;
  },
};
