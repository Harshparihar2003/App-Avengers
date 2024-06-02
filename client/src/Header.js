import {Link} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {UserContext} from "./UserContext";

export default function Header() {
  const {setUserInfo,userInfo} = useContext(UserContext);
  useEffect(() => {
    fetch('http://localhost:4000/profile', 
    {
      credentials: 'include',
    }
  ).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  function logout() {
    fetch('http://localhost:4000/logout', {
      credentials: 'include',
      method: 'POST',
    });
    setUserInfo(null);
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">MyBlogs</Link>
      <nav>
        {username && (
          <>
          <button className="header-btn">
          <Link to="/create">Create New Blog</Link>
          </button>
            <button className="header-btn">
            <a onClick={logout}>Logout ({capitalizeFirstLetter(username)})</a>
            </button>
            
          </>
        )}
        {!username && (
          <>
          <button className="header-btn"><Link to="/login">Login</Link></button>
            
            <button className="header-btn"><Link to="/register">Register</Link></button>
            
          </>
        )}
      </nav>
    </header>
  );
}