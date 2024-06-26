const db = require("../db/connection");

exports.fetchCommentsByArticleID = (article_id, limit = 10, p = 0) => {
  if ((limit && typeof +limit !== "number") || (p && typeof +p !== "number")) {
    return Promise.reject({ status: 400, message: "Bad Request" });
  }

  let offset = 0;
  if (p !== 0) {
    offset = (p - 1) * limit;
  }

  return db
    .query(
      `
      SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;;`,
      [article_id, limit, offset]
    )
    .then(({ rows: comments }) => {
      if (p > 0 && !comments.length)
        return Promise.reject({ status: 404, message: "Not Found" });
      return comments;
    });
};

exports.insertCommentByArticleId = (article_id, username, body) => {
  return db
    .query(
      `
      INSERT INTO comments (body, author, article_id) VALUES ($1, $2, $3) RETURNING *;`,
      [body, username, article_id]
    )
    .then(({ rows: comment }) => {
      if (comment.length === 0) {
        return Promise.reject({ status: 404, message: "Not Found" });
      }
      return comment[0];
    });
};

exports.removeCommentById = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *`, [
      comment_id,
    ])
    .then(({ rows: comment }) => {
      if (comment.length === 0) {
        return Promise.reject({ status: 404, message: "Not Found" });
      }
    });
};

exports.updateCommentVotes = (inc_votes, comment_id) => {
  return db
    .query(
      `
  UPDATE comments
  SET votes = votes + $1
  WHERE comment_id = $2
  RETURNING *;`,
      [inc_votes, comment_id]
    )
    .then(({ rows: comment }) => {
      if (!comment.length) {
        return Promise.reject({ status: 404, message: "Not Found" });
      }
      return comment[0];
    });
};
