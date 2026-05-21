export { proxy as middleware } from './src/proxy';

export const config = {
  matcher: ['/((?!maintenance|_next|favicon\\.ico|robots\\.txt).*)'],
};
