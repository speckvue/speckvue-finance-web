import { setupServer } from 'msw/node';

// Only tests register handlers; there are no invented production endpoints.
const server = setupServer();

export default server;
