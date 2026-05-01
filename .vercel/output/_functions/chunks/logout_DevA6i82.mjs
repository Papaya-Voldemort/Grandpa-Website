import { b as getAdminAuthCookieName } from './auth_EJspuftz.mjs';

const POST = async ({ request }) => {
  const cookieName = getAdminAuthCookieName();
  const isSecure = new URL(request.url).protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";
  const cookieValue = `${cookieName}=; Path=/; HttpOnly; SameSite=Lax${secureFlag}; Expires=Thu, 01 Jan 1970 00:00:00 UTC`;
  const redirectUrl = new URL("/admin/login/", request.url).toString();
  return new Response(null, {
    status: 302,
    headers: {
      "Location": redirectUrl,
      "Set-Cookie": cookieValue
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
