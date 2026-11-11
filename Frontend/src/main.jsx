import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import { restoreSession, forceLogout } from "./redux/slices/authSlice";
import "bootstrap/dist/css/bootstrap.min.css";

if (localStorage.getItem("hasSession")) store.dispatch(restoreSession());

window.addEventListener("auth:logout", () => store.dispatch(forceLogout()));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
