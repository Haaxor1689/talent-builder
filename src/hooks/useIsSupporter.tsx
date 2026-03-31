import { LockKeyhole } from 'lucide-react';

import { useSession } from '#auth/client.ts';
import TextButton from '#components/styled/TextButton.tsx';

const Cta = ({
	featureName,
	isSupporter
}: {
	featureName?: string;
	isSupporter: boolean;
}) =>
	isSupporter ? null : (
		<div className="flex flex-col items-center gap-2 sm:flex-row">
			<p className="shrink text-supporter">
				<LockKeyhole className="mr-1 inline-block" />
				{featureName ?? 'This feature'} is a supporter feature. Support
				development to unlock it.
			</p>
			<TextButton
				type="link"
				external
				href="https://ko-fi.com/haaxor1689"
				icon={
					<img
						src="https://storage.ko-fi.com/cdn/logomarkLogo.png"
						alt="Ko-fi logo"
						className="h-4 pr-1"
					/>
				}
				className="rounded-full border-2 border-current/30 px-3 text-supporter"
			>
				Donate on Ko-fi
			</TextButton>
		</div>
	);

const useIsSupporter = (featureName?: string) => {
	const role = useSession().data?.user?.role;
	const isSupporter = role === 'supporter' || role === 'admin';
	return {
		isSupporter,
		supportCta: <Cta featureName={featureName} isSupporter={isSupporter} />
	};
};

export default useIsSupporter;
