import { useEffect } from "react";
import { Route, Routes, HashRouter } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
// import Welcome from './Welcome'
import NotFoundPage from "./404";
import LoginPage from "./login";
import HomePage from "./home";
import ChatPage from "./chat";
import ContactsPage from "./contacts";
import RequireAuth from "../common/component/RequireAuth";
import RequireNoAuth from "../common/component/RequireNoAuth";
import Meta from "../common/component/Meta";

import store from "../app/store";
import InvitePage from "./invite";
import SettingPage from "./setting";
import SettingChannelPage from "./settingChannel";
import toast from "react-hot-toast";
import ResourceManagement from "./resources";

const PageRoutes = () => {
  const {
    ui: { online },
    fileMessages,
  } = useSelector((store) => {
    return { ui: store.ui, fileMessages: store.fileMessage };
  });
  // 掉线检测
  useEffect(() => {
    let toastId = 0;
    if (!online) {
      toast.error("Network Offline!", { duration: Infinity });
    } else {
      toast.dismiss(toastId);
    }
  }, [online]);

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <RequireNoAuth>
              <LoginPage />
            </RequireNoAuth>
          }
        />
        <Route path="/invite" element={<InvitePage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        >
          <Route path="setting">
            <Route index element={<SettingPage />} />
            <Route path="channel/:cid" element={<SettingChannelPage />} />
          </Route>
          <Route index element={<ChatPage />} />
          <Route path="chat">
            <Route index element={<ChatPage />} />
            <Route path="channel/:channel_id" element={<ChatPage />} />
            <Route path="dm/:user_id" element={<ChatPage />} />
          </Route>
          <Route path="contacts">
            <Route index element={<ContactsPage />} />
            <Route path=":user_id" element={<ContactsPage />} />
          </Route>
          <Route
            path="files"
            element={<ResourceManagement fileMessages={fileMessages} />}
          ></Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
};
// const local_key = "AUTH_DATA";
export default function ReduxRoutes() {
  // const [authData, setAuthData] = useState(
  //   JSON.parse(localStorage.getItem(local_key))
  // );
  // const updateAuthData = (data) => {
  //   localStorage.setItem(local_key, JSON.stringify(data));
  //   setAuthData(data);
  // };
  return (
    <Provider store={store}>
      {/* <PersistGate loading={null} persistor={persistStore(store)}> */}
      <Meta />
      <PageRoutes />
      {/* </PersistGate> */}
    </Provider>
  );
}
