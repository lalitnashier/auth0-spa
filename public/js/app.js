// The Auth0 client, initialized in configureClient()
let auth0 = null;

// Starts the authentication flow
const login = async (targetUrl) => {
  try {
    console.log("Logging in", targetUrl);

    const options = {
      redirect_uri: window.location.origin
    };

    if (targetUrl) {
      options.appState = { targetUrl };
    }

    await auth0.loginWithRedirect(options);
  } catch (err) {
    console.log("Log in failed", err);
  }
};

// Executes the logout flow
const logout = () => {
  try {
    console.log("Logging out");
    auth0.logout({
      returnTo: window.location.origin
    });
  } catch (err) {
    console.log("Log out failed", err);
  }
};

const fetchAuthConfig = () => fetch("/auth_config.json");

// Initializes the Auth0 client
const configureClient = async () => {
  const response = await fetchAuthConfig();
  const config = await response.json();

  auth0 = await createAuth0Client({
    domain: config.domain,
    organization: config.organization,
    client_id: config.clientId,
    audience: config.audience,
    scope: config.scope
  });
};

/**
 * Checks to see if the user is authenticated. If so, `fn` is executed. Otherwise, the user
 * is prompted to log in
 * @param {*} fn The function to execute if the user is logged in
 * @param targetUrl
 */
const requireAuth = async (fn, targetUrl) => {
  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    return fn();
  }

  return login(targetUrl);
};

// Will run when page finishes loading
window.onload = async () => {
  await configureClient();

  // If unable to parse the history hash, default to the root URL
  if (!showContentForUrl(window.location.pathname)) {
    showContentForUrl("/");
    window.history.replaceState({ url: "/" }, {}, "/");
  }

  // Listen out for clicks on any hyperlink that navigates to a #/ URL
  $(document).click((e) => {
    console.log(e);
    if (isRouteLink(e.target)) {
      const url = e.target.getAttribute("href");
      if (showContentForUrl(url)) {
        e.preventDefault();
        window.history.pushState({ url }, {}, url);
      }
    }
  });

  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    console.log("> User is authenticated");
    window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    console.log("> User not authenticated");

    const query = window.location.search;
    const shouldParseResult = query.includes("code=") && query.includes("state=");

    if (shouldParseResult) {
      console.log("> Parsing redirect");
      try {
        const result = await auth0.handleRedirectCallback();

        if (result.appState && result.appState.targetUrl) {
          showContentForUrl(result.appState.targetUrl);
        }

        console.log("Logged in!");
      } catch (err) {
        console.log("Error parsing redirect:", err);
      }

      window.history.replaceState({}, document.title, "/");
    }
  }

  await updateUI();
};
