import { LockKeyhole } from 'lucide-react';

import { useSession } from '#auth/client.ts';
import { isRoleSufficient } from '#utils/auth.ts';

import Input from './Input';

type Props = {
	placeholder?: string;
	slug?: string | null;
	setSlug: (value: string | null) => void;
	url: string;
};

const SlugInput = ({ placeholder, slug, setSlug, url }: Props) => {
	const session = useSession().data;
	const locked = !isRoleSufficient('supporter', session?.user.role);
	return (
		<Input
			label="URL"
			value={slug ?? ''}
			onChange={e => setSlug(e.target.value || null)}
			placeholder={placeholder ?? '...'}
			disabled={locked}
			before={<p className="text-blue-gray -mr-2">{url}</p>}
			after={
				locked && (
					<>
						<LockKeyhole className="text-supporter" />
						<p className="text-supporter hidden sm:inline">Supporter only</p>
					</>
				)
			}
		/>
	);
};

export default SlugInput;
