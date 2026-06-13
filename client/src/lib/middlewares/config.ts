const AUTH_ROUTES = [/^\/sign-in(\/.*)?$/, /^\/sign-up(\/.*)?$/];

const PROTECTED_ROUTES = [
  /^\/dashboard(\/.*)?$/,
  /^\/stream(\/.*)?$/,
  /^\/settings(\/.*)?$/,
  /^\/verify-email(\/.*)?$/,
  /^\/studio(\/.*)?$/,
  /^\/profile(\/.*)?$/,
];

export { AUTH_ROUTES, PROTECTED_ROUTES };
