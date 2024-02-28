import { db, promiseDb } from "../config/connect.js";

const Playlist = (playlist) => {
  this.id = playlist.id;
  this.name = playlist.name;
  this.image_path = playlist.image_path;
  this.user_id = playlist.user_id;
  this.genre_id = playlist.genre_id;
};

Playlist.create = (newPlaylist, result) => {
  db.query("insert into playlists set ? ", newPlaylist, (err, res) => {
    if (err) {
      console.log("ERROR", err);
      result(err, null);
      return;
    }
    console.log("CREATE : ", { res });
    result(null, { id: res.insertId, ...newPlaylist });
  });
};

Playlist.update = async (playlistId, newPlaylist, result) => {
  Playlist.findById(playlistId, (err, playlist) => {
    if (err) {
      console.log("ERROR", err);
      result(err, null);
      return;
    } else {
      db.query(`update playlists set ? where id = ${playlist.id}`, newPlaylist, (err, res) => {
        if (err) {
          console.log("ERROR", err);
          result(err, null);
          return;
        }
        console.log("CREATE : ", { res });
        result(null, { id: res.insertId, ...newPlaylist });
      });
    }
  });
};

Playlist.findById = (playlistId, result) => {
  db.query(`SELECT * from playlists WHERE id = '${playlistId}'`, (err, res) => {
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

Playlist.findByUserId = async (req, result) => {
  const q = req.query?.q;
  const page = req.query?.page;
  const limit = req.query?.limit;
  const sortBy = req.query?.sortBy;

  const offset = (page - 1) * limit;

  const userId = req.params.userId;

  const [data] = await promiseDb.query(
    `SELECT * FROM playlists WHERE user_id = '${userId}' limit ${+limit} offset ${+offset}`
  );

  const [totalCount] = await promiseDb.query(
    `SELECT COUNT(*) AS totalCount FROM playlists WHERE user_id = '${userId}'`
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
      },
    });
    return;
  }
  result(null, null);
};

Playlist.like = (playlistId, userId, result) => {
  // Tìm kiếm bài hát theo id
  Playlist.findById(playlistId, (err, playlist) => {
    if (err) {
      console.log("ERROR", err);
      result(err, null);
      return;
    }

    if (!playlist) {
      console.log("playlist không tồn tại");
      result("playlist không tồn tại", null);
      return;
    }

    // Kiểm tra xem người dùng đã thích bài hát này chưa
    db.query(
      "SELECT * FROM favourite_playlists WHERE user_id = ? AND playlist_id = ?",
      [userId, playlistId],
      (queryErr, rows) => {
        if (queryErr) {
          console.log("ERROR", queryErr);
          result(queryErr, null);
          return;
        }

        // Nếu người dùng đã thích bài hát này trước đó, không thực hiện thêm
        if (rows.length > 0) {
          console.log("playlist đã được thích bởi người dùng");
          result("playlist đã được thích bởi người dùng", null);
          return;
        }

        // Thêm bài hát vào danh sách bài hát yêu thích của người dùng
        db.query(
          "INSERT INTO favourite_playlists SET `user_id` = ?, `playlist_id`= ?",
          [userId, playlistId],
          (insertErr, insertRes) => {
            if (insertErr) {
              console.log("ERROR", insertErr);
              result(insertErr, null);
              return;
            }
            // Trả về thông tin bài hát đã được thêm vào danh sách yêu thích
            result(null, { playlist_id: playlistId, user_id: userId });
          }
        );
      }
    );
  });
};

Playlist.unlike = (playlistId, userId, result) => {
  // Kiểm tra xem bài hát đã được yêu thích bởi người dùng chưa
  db.query(
    "SELECT * FROM favourite_playlists WHERE user_id = ? AND playlist_id = ?",
    [userId, playlistId],
    (queryErr, rows) => {
      if (queryErr) {
        console.log("ERROR", queryErr);
        result(queryErr, null);
        return;
      }

      // Nếu không tìm thấy bài hát trong danh sách yêu thích của người dùng, trả về lỗi
      if (rows.length === 0) {
        console.log("Playlist không được thích bởi người dùng");
        result("Playlist không được thích bởi người dùng", null);
        return;
      }

      // Xóa bài hát khỏi danh sách yêu thích của người dùng
      db.query(
        "DELETE FROM favourite_playlists WHERE user_id = ? AND playlist_id = ?",
        [userId, playlistId],
        (deleteErr, deleteRes) => {
          if (deleteErr) {
            console.log("ERROR", deleteErr);
            result(deleteErr, null);
            return;
          }
          // Trả về thông tin bài hát đã bị xóa khỏi danh sách yêu thích
          result(null, { playlist_id: playlistId, user_id: userId });
        }
      );
    }
  );
};

Playlist.addSong = (playlistId, songId, userId, result) => {
  Playlist.findById(playlistId, (err, playlist) => {
    if (err) {
      console.log("ERROR", err);
      result(err, null);
      return;
    }

    if (!playlist) {
      result("Playlist không tồn tại", null);
      return;
    }

    if (playlist.user_id != userId) {
      result(`Playlist không thuộc sở hữu của người dùng`, null);
      return;
    }

    db.query(
      "SELECT * FROM playlist_songs WHERE song_id = ? AND playlist_id = ?",
      [songId, playlistId],
      (queryErr, rows) => {
        if (queryErr) {
          console.log("ERROR", queryErr);
          result(queryErr, null);
          return;
        }

        // Nếu người dùng đã thích bài hát này trước đó, không thực hiện thêm
        if (rows.length > 0) {
          console.log("ERROR: Bài hát đã tồn tại trong Playlist");
          result("Bài hát đã tồn tại trong Playlist", null);
          return;
        }

        // Thêm bài hát vào danh sách bài hát yêu thích của người dùng
        db.query(
          "INSERT INTO playlist_songs SET `song_id` = ?, `playlist_id`= ?",
          [songId, playlistId],
          (insertErr, insertRes) => {
            if (insertErr) {
              console.log("ERROR", insertErr);
              result(insertErr, null);
              return;
            }
            // Trả về thông tin bài hát đã được thêm vào danh sách yêu thích
            result(null, { playlist_id: playlistId, song_id: songId });
          }
        );
      }
    );
  });
};

Playlist.unAddSong = (playlistId, songId, userId, result) => {
  db.query(
    "SELECT * FROM playlist_songs WHERE song_id = ? AND playlist_id = ?",
    [songId, playlistId],
    (queryErr, rows) => {
      if (queryErr) {
        console.log("ERROR", queryErr);
        result(queryErr, null);
        return;
      }

      // Nếu người dùng đã thích bài hát này trước đó, không thực hiện thêm
      if (rows.length === 0) {
        console.log("Bài hát không tồn tại trong playlist");
        result("Bài hát không tồn tại trong playlist", null);
        return;
      }

      // Thêm bài hát vào danh sách bài hát yêu thích của người dùng
      db.query(
        "DELETE FROM playlist_songs WHERE song_id = ? and playlist_id= ?",
        [songId, playlistId],
        (insertErr, insertRes) => {
          if (insertErr) {
            console.log("ERROR", insertErr);
            result(insertErr, null);
            return;
          }
          // Trả về thông tin bài hát đã được thêm vào danh sách yêu thích
          result(null, { playlist_id: playlistId, song_id: songId });
        }
      );
    }
  );
};

export default Playlist;
