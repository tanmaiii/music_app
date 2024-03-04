import jwt from "jsonwebtoken";

const jwtService = {
  // Hàm tạo token
  generateToken: (payload) => {
    return jwt.sign(payload, process.env.MY_SECRET, { expiresIn: "7d" });
  },

  // Hàm kiểm tra token
  verifyToken: (token) => {
    return new Promise((resolve, reject) => {
      if (!token) {
        reject({ conflictError: "Không tìm thấy token !" });
      }
      jwt.verify(token, process.env.MY_SECRET, (err, decoded) => {
        if (err) {
          reject({ conflictError: "Token không hợp lệ !" });
        } else {
          resolve(decoded);
        }
      });
    });
  },
};

export default jwtService;