import React, { useContext, useState } from "react";
import { Route, Routes } from "react-router-dom";
import NavbarUser from "./components/NavbarUser/NavbarUser";
import NavbarAdmin from "./components/NavbarAdmin/NavbarAdmin";
import Sidebar from "../src/components/sidebar/Sidebar";
import Home from "./pages/Home/Home";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Cart from "./pages/Cart/Cart";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import MyOrders from "./pages/MyOrders/MyOrders";
import Verify from "./pages/Verify/Verify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";
import Setup from "./pages/Setup/Setup";
import Dashboard from "./pages/Dashboard/Dashboard";
import Add from "../src/pages/Add/Add";
import List from "../src/pages/List/List";
import Orders from "../src/pages/Orders/Orders";
import { StoreContext } from "./context/storeContext";
import ShopDetails from "./pages/ShopDetails/ShopDetails";
import RenewSubscription from "./pages/RenewSubscription/RenewSubscription";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { userType, url } = useContext(StoreContext);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <div className={`app-${userType}`}>
        {userType === "user" ? (
          <>
            <NavbarUser setShowLogin={setShowLogin} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/order" element={<PlaceOrder />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/myorders" element={<MyOrders />} />
              <Route path="/shop/:shopId" element={<ShopDetails />} />
            </Routes>
          </>
        ) : (
          <>
            <Routes>
              <Route
                path="/setup"
                element={
                  <>
                    <div className="app-user">
                      <NavbarUser setShowLogin={setShowLogin} />
                    </div>
                    <Setup />
                  </>
                }
              />
              <Route
                path="*"
                element={
                  <>
                    <NavbarAdmin />
                    <hr />
                    <div className="app-content">
                      <Sidebar />
                      <Routes>
                        <Route path="/renew-subscription" element={<RenewSubscription />} />
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard/add" element={<Add url={url} />} />
                        <Route path="/dashboard/list" element={<List url={url} />} />
                        <Route path="/dashboard/orders" element={<Orders url={url} />} />
                      </Routes>
                    </div>
                  </>
                }
              />
            </Routes>
          </>
        )}
      </div>

      <Footer />
    </>
  );
};

export default App;
