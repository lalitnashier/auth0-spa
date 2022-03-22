// URL mapping, from hash to a function that responds to that URL action
const router = {
  "/": () => showContent("content-home"),
  "/profile": () => requireAuth(() => showContent("content-profile"), "/profile"),
  "/login": () => login()
};

// Tries to display a content panel that is referenced by the specified route URL.
const showContentForUrl = (url) => {
  if (router[url]) {
    router[url]();
    return true;
  }
  return false;
};

/**
 * Returns true if `element` is a hyperlink that can be considered a link to another SPA route
 * @param {*} element The element to check
 */
const isRouteLink = (element) => element.tagName === "A" && element.classList.contains("route-link");

/**
 * Displays a content panel specified by the given element id.
 * All the panels that participate in this flow should have the 'page' class applied,
 * so that it can be correctly hidden before the requested content is shown.
 * @param {*} id The id of the content to show
 */
const showContent = (id) => {
  $(".page").addClass("hidden");
  $("#" + id).removeClass("hidden");
};

const parseJwt = (token) => {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  try {
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.log("Error parsing JSON");
    return {};
  }
};

// Updates the user interface
const updateUI = async () => {
  try {
    const isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
      const user = await auth0.getUser();

      const claims = await auth0.getIdTokenClaims();

      const userToken = parseJwt(claims.__raw)

      /*
      // audience and scope can be changed
      const token = await auth0.getTokenSilently({
        audience: "",
        scope: ""
      });
      */
      const token = await auth0.getTokenSilently();

      const tokenObj = parseJwt(token)

      hljs.highlightBlock($("#user-token-data").text(JSON.stringify(userToken, null,2)).get(0));
      hljs.highlightBlock($("#claims-data").text(JSON.stringify(claims, null,2)).get(0));
      hljs.highlightBlock($("#profile-data").text(JSON.stringify(user, null,2)).get(0));
      hljs.highlightBlock($("#token-data").text(JSON.stringify(tokenObj, null,2)).get(0));

      $(".profile-image").attr("src", user.picture);
      $(".user-name").text(user.name);
      $(".user-email").text(user.email);

      $(".auth-invisible").addClass("hidden");
      $(".auth-visible").removeClass("hidden");
    } else {
      $(".auth-invisible").removeClass("hidden");
      $(".auth-visible").addClass("hidden");
    }
  } catch (err) {
    console.log("Error updating UI!", err);
    return;
  }

  console.log("UI updated");
};

window.onpopstate = (e) => {
  if (e.state && e.state.url && router[e.state.url]) {
    showContentForUrl(e.state.url);
  }
};
