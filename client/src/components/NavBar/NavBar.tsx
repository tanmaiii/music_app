import React, { HtmlHTMLAttributes, useEffect, useRef, useState } from "react";
import "./navbar.scss";
import { PATH } from "../../constants/paths";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { changeOpen, changePath } from "./navbarSlide";

const navbar = [
  {
    title: "Discover",
    items: [
      { id: 1, title: "Home", icon: <i className="fa-light fa-house-blank"></i>, path: PATH.HOME },
      {
        id: 2,
        title: "Artist",
        icon: <i className="fa-light fa-user-music"></i>,
        path: PATH.ARTIST,
      },
      {
        id: 3,
        title: "Album",
        icon: <i className="fa-light fa-album-collection"></i>,
        path: PATH.ARTIST,
      },
      {
        id: 4,
        title: "Podcast",
        icon: <i className="fa-light fa-microphone"></i>,
        path: PATH.ARTIST,
      },
    ],
  },
  {
    title: "Library",
    items: [
      { id: 1, title: "Recent", icon: <i className="fa-light fa-clock"></i>, path: PATH.ARTIST },
      {
        id: 2,
        title: "Favourit",
        icon: <i className="fa-light fa-heart"></i>,
        path: PATH.FAVOURITE,
      },
      { id: 3, title: "Playlist", icon: <i className="fa-light fa-music"></i>, path: PATH.ARTIST },
    ],
  },
];

export default function Navbar() {
  const path = useSelector((state: RootState) => state.navbar.path);
  const openMenu = useSelector((state: RootState) => state.navbar.openMenu);
  const navbarRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();

  const { pathname } = useLocation();

  const handleClick = (PATH: string) => {
    dispatch(changePath(PATH));
  };

  useEffect(() => {
    dispatch(changePath(pathname));
  }, [pathname]);

  useEffect(() => {
    function handleMousedown(event: MouseEvent) {
      const node = event.target as Node;
      if (!navbarRef.current?.contains(node)) {
        dispatch(changeOpen(false));
      }
    }
    document.addEventListener("mousedown", (event) => handleMousedown(event));
    return () => document.removeEventListener("mousedown", (event) => handleMousedown(event));
  });

  return (
    <div ref={navbarRef} className={`navbar ${openMenu ? "openMenu" : ""}`}>
      <div className="navbar__container">
        <div className="navbar__container__top">
          <div className={`navbar__container__top__logo`}>
            <i className="fa-regular fa-headphones-simple"></i>
            <h2>Sound</h2>
          </div>
        </div>

        <div className={`navbar__container__content`}>
          {navbar.map((navbar, index) => (
            <div key={index} className="navbar__container__content__group">
              <h4 className="navbar__container__content__group__title">{navbar.title}</h4>
              <div className="navbar__container__content__group__list">
                {navbar.items.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className={`navbar__container__content__group__list__item ${
                      path === item.path ? "active" : ""
                    }`}
                    onClick={() => handleClick(item.path)}
                  >
                    <div className="navbar__container__content__group__list__item__icon">
                      {item.icon}
                    </div>
                    <h4 className={`navbar__container__content__group__list__item__title`}>
                      {item.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
