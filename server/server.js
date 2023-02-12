const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("user.db");

let usersMap = {};
const users = [];
const app = express();
const httpServer = createServer(app);
app.use(cors());
app.use(express.json());

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  // console.log(req.body);
  const checkUser = (username, email) => {
    return new Promise((resolve, reject) => {
      let sql = `SELECT COUNT(*) as count FROM users WHERE username = ? OR email = ?`;
      db.get(sql, [username, email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row.count > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    });
  };

  checkUser(username, email)
    .then((result) => {
      if (result) {
        res.json({
          msg: `user exists`,
          status: false,
        });
      } else {
        db.run(
          "CREATE TABLE IF NOT EXISTS users (username TEXT, email TEXT, password TEXT)"
        );
        const stmt = db.prepare(
          "INSERT INTO users (username, email, password) VALUES (?,?,?)"
        );
        stmt.run(username, email, password);
        stmt.finalize((err, result) => {
          console.log("result is " + result);
          if (err) {
            res.json({
              msg: "something went wrong",
              status: false,
            });
          }
          res.json({
            msg: "user registered",
            status: true,
          });
          // console.log(err);
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/login", (req, res) => {
  // console.log(req.body);
  const { email, password } = req.body;
  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [req.body.email],
    (err, row) => {
      if (err) {
        console.error(err.message);
      }
      if (row) {
        if (row.password === password) {
          db.get(
            "SELECT * FROM users WHERE email = ? AND password = ?",
            [req.body.email, req.body.password],
            function (err, row) {
              if (row) {
                res.json({
                  msg: "logged in successfully",
                  status: true,
                  data: row,
                });
              } else {
                res.json({
                  msg: "something went wrong",
                  status: false,
                });
              }
            }
          );
        } else {
          res.json({
            msg: "invalid credentials",
            status: false,
          });
        }
      } else {
        console.log("User does not exist in the database");
        res.json({
          msg: "User not exist",
          status: false,
        });
      }
    }
  );

  // db.close();
});
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
  methods: ["GET", "POST"],
});

io.on("connection", (socket) => {
  socket.on("getMessage", (arg, username) => {
    io.emit("messages", arg, username);
  });

  socket.on("send-connected-users", function (data) {
    var { username, id } = data;
    const existingUser = users.find((user) => user.username === username);
    const user = { username: username, id: id };
    if (!existingUser) {
      users.push(user);
    }
    setInterval(function () {
      socket.emit("get-connected-users", users);
    }, 1000);
  });

  socket.on("logout", function (data) {
    const index = users.findIndex((user) => user.username === data);
    socket.emit("get-connected-users", users.splice(index, 1)[0]);
    socket.disconnect();
  });
});

httpServer.listen(3000);
