
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const authMessage = document.getElementById("auth-message");

function showMessage(message, isError = false) {
  if (!authMessage) return;

  authMessage.textContent = message;
  authMessage.style.color = isError
    ? "#ff9999"
    : "#b5f5ce";
}

function setLoading(form, loading) {
  const button = form.querySelector(
    'button[type="submit"]'
  );

  if (!button) return;

  button.disabled = loading;
  button.textContent = loading
    ? "Please wait..."
    : form === signupForm
      ? "Create account"
      : "Log in";
}

// SIGN UP
if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document
      .getElementById("username")
      .value.trim().toLowerCase();

    const email = document
      .getElementById("email")
      .value.trim();

    const password = document
      .getElementById("password")
      .value;

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      showMessage(
        "Username must be 3–20 characters: lowercase letters, numbers or underscores.",
        true
      );
      return;
    }

    if (password.length < 8) {
      showMessage(
        "Password must contain at least 8 characters.",
        true
      );
      return;
    }

    setLoading(signupForm, true);
    showMessage("");

    try {
      const { data, error } =
        await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo:
              window.location.origin +
              window.location.pathname.replace(
                "signup.html",
                "login.html"
              )
          }
        });

      if (error) throw error;

      if (data.session) {
        showMessage(
          "Account created! You can now log in."
        );
      } else {
        showMessage(
          "Check your email for a verification link. After verifying, return to log in."
        );
      }

      signupForm.reset();
    } catch (error) {
      console.error("Signup error:", error);
      showMessage(error.message, true);
    } finally {
      setLoading(signupForm, false);
    }
  });
}

// LOGIN
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document
      .getElementById("email")
      .value.trim();

    const password = document
      .getElementById("password")
      .value;

    setLoading(loginForm, true);
    showMessage("");

    try {
      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Login was unsuccessful.");
      }

      window.location.href = "dashboard.html";
    } catch (error) {
      console.error("Login error:", error);
      showMessage(error.message, true);
    } finally {
      setLoading(loginForm, false);
    }
  });
}
