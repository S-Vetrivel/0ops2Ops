import { useEffect, useRef } from "react";
import { useApp } from "../context/Appcontext";
import { googleOneTapLogin } from "../services/api";

const GoogleOneTap = () => {
  const { user, setUser } = useApp();
  const initialized = useRef(false);

  useEffect(() => {
    if (user || initialized.current) return;
    if (!window.google) return;

    initialized.current = true;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        console.log("ONETAP:", response);
        const result = await googleOneTapLogin(response.credential);
        if (result.success) setUser(result.user);
      },
      use_fedcm_for_prompt: true,
      cancel_on_tap_outside: false,
    });

    window.google.accounts.id.prompt();
  }, [user, setUser]);

  return null;
};

export default GoogleOneTap;
