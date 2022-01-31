import React, { useState, useEffect } from 'react';

let logoutTimer;

const AuthContext = React.createContext({
  token: '',
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

const calculateTime = (expirationTime) => {
    const currentTime = new Date().getTime();
    const adjExpirationTime = new Date(expirationTime).getTime();
    const remainingDuration = adjExpirationTime - currentTime;

    return remainingDuration
}

const retrieveToken = () => {
    const storedToken = localStorage.getItem('token')
    const storedExpirationDate = localStorage.getItem('expirationTime');

    const remainingTime = calculateTime(storedExpirationDate);

    if (remainingTime <= 6000) {
        localStorage.removeItem('token');
        localStorage.getItem('expirationTime');
        return null;
    }
    return {
        token: storedToken,
        duration: remainingTime
    }
}

export const AuthContextProvider = (props) => {
    const tokenData = retrieveToken();
    let initialToken;
     if (tokenData) {
        initialToken = tokenData.token;
     }
   
    const [token, setToken] = useState(initialToken);
    
    
    const userIsLoggedIn = !!token;

    const logoutHandler = () => {
        setToken(null);
        localStorage.removeItem('token');
         if (logoutTimer) {
             clearTimeout(logoutTimer);
         }
    };
    
    const loginHandler = (token, expirationTime) => {
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.getItem('expirationTime', expirationTime);
      const remainingTime = calculateTime(expirationTime);
      logoutTimer = setTimeout(logoutHandler, remainingTime);
    }

    useEffect(() => {
        if (tokenData) {
            console.log(tokenData.duration);
            logoutTimer = setTimeout(logoutHandler, tokenData.duration);
        }
    }, [tokenData])
    
    
    
    const contextValue = {
        token: token,
        isLoggedIn: userIsLoggedIn,
        login: loginHandler,
        logout: logoutHandler,
    };
    
    return (
        <AuthContext.Provider value={contextValue}>
        {props.children}
        </AuthContext.Provider>
    );
};

export default AuthContext;