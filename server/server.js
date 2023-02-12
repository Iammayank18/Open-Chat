const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("user.db");

const users = [];
const app = express();
const httpServer = createServer(app);
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.get("/api/openchat/", (req, res) => {
  res.send("working");
});
app.post("/api/openchat/register", (req, res) => {
  const { username, email, password } = req.body;

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
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/api/openchat/login", (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
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
      res.json({
        msg: "User not exist",
        status: false,
      });
    }
  });

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
      console.log("ad");
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
