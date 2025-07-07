import { type PropsWithChildren, Suspense } from 'react';

import PersonalBuilds from '~/components/builds-lists/PersonalBuilds';
import Spinner from '~/components/styled/Spinner';

const Layout = ({ children }: PropsWithChildren) => (
	<>
		{children}
		<Suspense fallback={<Spinner className="my-6 self-center" />}>
			<PersonalBuilds />
		</Suspense>
	</>
);

export default Layout;
