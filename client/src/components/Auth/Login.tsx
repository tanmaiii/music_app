import React, { MouseEvent, useState } from "react";
import "./auth.scss";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";

import userApi from "../../apis/user/userApi";
import authApi from "../../apis/auth/authApi";
import { Link } from "react-router-dom";
import { PATH } from "../../constants/paths";
import { useAuth } from "../../context/authContext";
import { useTranslation } from "react-i18next";

export default function Login() {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const { currentUser, setCurrentUser } = useAuth();
  const { t } = useTranslation("auth");

  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClick = async () => {
    try {
      const res = await authApi.signin(inputs.email, inputs.password);
      setCurrentUser(res);
    } catch (err: any) {
      setErr(err.response.data.conflictError);
    }
  };

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__container__title">
          <h2>{t("login.Title")}</h2>
        </div>

        {err && (
          <div className="error">
            <i className="fa-sharp fa-light fa-circle-exclamation"></i>
            <span>{err}</span>
          </div>
        )}
        <div className="auth__container__group">
          <h4 className="title">{t("login.Email")}</h4>
          <div className="input ">
            <input
              autoComplete="off"
              type="text"
              name="email"
              placeholder="Email"
              onChange={(e) => handleChange(e)}
            />
          </div>
        </div>
        <div className="auth__container__group">
          <h4 className="title">{t("login.Password")}</h4>
          <div className="input">
            <input
              autoComplete="off"
              type={`${show ? "text" : "password"}`}
              name="password"
              placeholder="Password"
              onChange={(e) => handleChange(e)}
            />
            <span className="tooglePassword" onClick={() => setShow(!show)}>
              {show ? (
                <i className="fa-light fa-eye"></i>
              ) : (
                <i className="fa-light fa-eye-slash"></i>
              )}
            </span>
          </div>
        </div>
        <div className="auth__container__group">
          <a className="forgot">{t("login.Forgot your password ?")}</a>
          <button className="btn_submit" onClick={() => handleClick()}>
            {t("login.Login")}
          </button>
          <span className="auth__navigation">
            {t("login.Don't have an account?")}
            <Link to={PATH.SIGNUP}>{t("login.Sign up for Sound hub")}</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
