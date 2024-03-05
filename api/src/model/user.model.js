import { db, promiseDb } from "../config/connect.js";
import bcrypt from "bcrypt";

const User = function (user) {
  this.email = user.email;
  this.password = user.password;
  this.name = user.name;
  this.image_path = user.image_path;
  this.verified = user.verified;
  this.is_admin = user.is_admin;
};

User.create = (newUser, result) => {
  db.query("insert into users set ? ", newUser, (err, res) => {
    if (err) {
      console.log("ERROR", err);
      result(err, null);
      return;
    }
    console.log("CREATE USER : ", { res });
    result(null, { id: res.insertId, ...newUser });
  });
};

User.update = (userId, newUser, result) => {
  User.findById(userId, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    db.query(`update users set ? where id = ${userId}`, newUser, (err, res) => {
      if (err) {
        console.log("ERROR", err);
        result(err, null);
        return;
      }
      console.log("UPDATE USER : ", { res });
      result(null, { id: res.insertId, ...newUser });
    });
  });
};

User.findByEmail = (email, result) => {
  db.query(`SELECT * from users WHERE email = '${email}'`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }
    result(null, null);
  });
};

User.findById = (id, result) => {
  db.query(`SELECT * from users WHERE id = '${id}'`, (err, user) => {
    if (err) {
      result(err, null);
      return;
    }
    if (user.length) {
      result(null, user[0]);
      return;
    }
    result(`Không tìm thấy người dùng có id là ${id}`, null);
  });
};

//kiểm tra email đã được dùng chưa
User.isEmailAlreadyExists = (email, result) => {
  db.query(`SELECT * from users WHERE email = '${email}'`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }
    result(null, null);
  });
};

User.getAll = async (query, result) => {
  const q = query?.q;
  const page = query?.page;
  const limit = query?.limit;
  const sort = query?.sort || "new";

  const offset = (page - 1) * limit;

  const [data] = await promiseDb.query(
    `SELECT email, name, image_path, verified, is_admin FROM users ${
      q ? `WHERE users.name LIKE "%${q}%"` : ""
    } ` + ` limit ${+limit} offset ${+offset}`
  );

  const [totalCount] = await promiseDb.query(
    `SELECT COUNT(*) AS totalCount FROM users ${q ? `WHERE users.name LIKE "%${q}%"` : ""}`
  );

  if (data && totalCount) {
    const totalPages = Math.ceil(totalCount[0].totalCount / limit);

    result(null, {
      data,
      pagination: {
        page: +page,
        limit: +limit,
        totalCount: totalCount[0].totalCount,
        totalPages,
        q,
      },
    });
    return;
  }
  result("Không tìm thấy !", null);
};

User.verify = function (email, result) {
  db.query(
    `UPDATE users SET email_verified_at = ? WHERE email = ?`,
    [new Date(), email],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { email: email });
    }
  );
};

export default User;
