import { useState, useEffect, useContext } from "react";
import { UserContext } from "@context/UserContext";
import useCart from "@hooks/useCart";
import WelcomeGiftModal from "@component/modal/WelcomeGiftModal";
import WelcomeGiftBadge from "@component/common/WelcomeGiftBadge";

const WelcomeGiftManager = ({
  addressPopup,
  showRegisterSuccess,
  currentPopup,
  lotteryPopupOpen,
}) => {
  const { state: { userInfo } } = useContext(UserContext);
  const { items } = useCart();
  const [showWelcomeGiftModal, setShowWelcomeGiftModal] = useState(false);

  const hasAvailableGift =
    userInfo?.welcomeGift?.sku &&
    userInfo.welcomeGift.isUsed === false;

  const giftAlreadyInCart = items.some((item) => item.isWelcomeGift);

  const blockersOpen =
    addressPopup ||
    showRegisterSuccess ||
    currentPopup ||
    lotteryPopupOpen;

  useEffect(() => {
    if (!hasAvailableGift || giftAlreadyInCart || blockersOpen) return;
    if (sessionStorage.getItem("welcomeGiftModalDismissed")) return;

    const timer = setTimeout(() => {
      setShowWelcomeGiftModal(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [hasAvailableGift, giftAlreadyInCart, blockersOpen]);

  useEffect(() => {
    if (localStorage.getItem("firstTime") && hasAvailableGift && !giftAlreadyInCart && !blockersOpen) {
      const timer = setTimeout(() => {
        setShowWelcomeGiftModal(true);
        localStorage.removeItem("firstTime");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasAvailableGift, giftAlreadyInCart, blockersOpen]);

  const handleCloseModal = () => {
    setShowWelcomeGiftModal(false);
    sessionStorage.setItem("welcomeGiftModalDismissed", "true");
  };

  if (!hasAvailableGift) return null;

  return (
    <>
      <WelcomeGiftBadge
        onClick={() => setShowWelcomeGiftModal(true)}
        className="fixed bottom-24 left-4 z-40 lg:bottom-8 lg:left-8"
      />
      <WelcomeGiftModal
        isOpen={showWelcomeGiftModal}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default WelcomeGiftManager;
