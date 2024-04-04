import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBookOpen, FaMoon, FaSun, FaUser } from "react-icons/fa";
import { useMedia } from "react-use";
import OutsideClickHandler from "./OutsideClickHandler";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

function Navbar({ isDarkMode, onDarkModeChange, currentUser }) {
  const isMediumScreen = useMedia("(min-width: 768px)");
  const [menuDisplayed, setMenuDisplayed] = useState(isMediumScreen);
  return (
    <div className="px-8  z-[1] bg-emerald-50 dark:bg-emerald-800 drop-shadow-lg sticky w-full top-0">
      <ul className="flex justify-between items-center pt-4 pb-4 text-emerald-900 dark:text-white">
        <li className="font-extrabold ">
          <Link to="/">
            <span className="text-xl mx-1">منصة القرآن</span>
            <FaBookOpen className="inline-block pr-2 mb-1" size="30" />
          </Link>
        </li>
        <li className="relative md:flex ">
          <FaUser
            id="menuBoxToggler"
            className="text-xl cursor-pointer w-6 h-6 md:hidden"
            onClick={() => {
              setMenuDisplayed(!menuDisplayed);
            }}
          />
          <OutsideClickHandler
            onOutsideClick={() => {
              if (!isMediumScreen) {
                setMenuDisplayed(false);
              }
            }}
            excludedSelectors={["#menuBox", "#menuBoxToggler"]}
          >
            {menuDisplayed && (
              <ul
                id="menuBox"
                className={`absolute w-[240px]  left-0 top-[30px] z-3 flex flex-col items-center gap-5 p-4 bg-white dark:bg-[rgb(41,41,41)] border-[1px] border-gray-500 shadow-lg shadow-black/20
              md:static md:flex-row md:z-0 md:w-full md:bg-transparent md:border-none md:shadow-none md:dark:bg-transparent`}
              >
                {currentUser == null ||
                (currentUser != null && currentUser.emailVerified == false) ? (
                  <>
                    <li>
                      <Link to="user/login" className=" font-bold">
                        تسجيل الدخول
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="user/signup"
                        className="text-white font-bold py-3 px-6 rounded-full bg-emerald-800 hover:bg-emerald-700 dark:bg-amber-500"
                      >
                        تسجيل
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="mt-2">
                      <Link
                        to="user/profile"
                        className="text-white font-bold py-3 px-6 rounded-full bg-emerald-800 hover:bg-emerald-700 dark:bg-amber-500"
                      >
                        الحساب الشخصي
                      </Link>
                    </li>
                    <li
                      className="text-white font-bold py-3 px-6 rounded-full cursor-pointer bg-emerald-800 hover:bg-emerald-700 dark:bg-amber-500"
                      onClick={() => {
                        signOut(auth);
                      }}
                    >
                      تسجيل الخروج
                    </li>
                  </>
                )}
                <li className="text-gray-700 dark:text-white">
                  {isDarkMode ? (
                    <FaSun
                      className=" cursor-pointer text-2xl"
                      onClick={() => {
                        onDarkModeChange(!isDarkMode);
                      }}
                    />
                  ) : (
                    <FaMoon
                      className="cursor-pointer text-2xl"
                      onClick={() => {
                        onDarkModeChange(!isDarkMode);
                      }}
                    />
                  )}
                </li>
              </ul>
            )}
          </OutsideClickHandler>
        </li>
      </ul>
    </div>
  );
}

export default Navbar;
