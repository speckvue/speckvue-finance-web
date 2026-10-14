import { redirect } from 'next/navigation';
import 'server-only';
import getSessionState from './session';

const requireSessionState = async () => {
  const state = await getSessionState();
  if (state.status === 'anonymous') redirect('/sign-in');
  return state;
};

export default requireSessionState;
