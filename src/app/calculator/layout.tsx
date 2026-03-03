import { type PropsWithChildren, Suspense } from 'react';

import PersonalBuilds from '#components/builds-lists/PersonalBuilds.tsx';
import Spinner from '#components/styled/Spinner.tsx';

const Layout = ({ children }: PropsWithChildren) => (
	<>
		{children}
		<Suspense fallback={<Spinner className="my-6 self-center" />}>
			<PersonalBuilds />
		</Suspense>
	</>
);

export default Layout;
