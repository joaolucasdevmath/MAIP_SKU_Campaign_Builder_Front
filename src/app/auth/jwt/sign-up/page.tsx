import { CONFIG } from 'src/config-global';

// @ts-ignore
import { JwtSignInView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export const metadata = { title: `Sign up | Jwt - ${CONFIG.site.name}` };

export default function Page() {
  return <JwtSignInView />;
}
