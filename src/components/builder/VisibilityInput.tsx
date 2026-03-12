import { Fragment } from 'react';
import { AlertTriangle, CloudOff, Eye, EyeOff } from 'lucide-react';

import { useSession } from '#auth/client.ts';
import { Checkbox } from '#components/form/CheckboxInput.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import { type TalentForm } from '#server/schemas.ts';

const Options = [
	{
		label: 'Local',
		value: null,
		icon: <CloudOff size={22} />,
		text: 'Saved locally on device, not accessible from other devices.',
		className: 'text-blue-gray'
	},
	{
		label: 'Public',
		value: 'public',
		icon: <Eye size={22} />,
		text: 'Saved to your account, publicly visible when searching trees.',
		className: ''
	},
	{
		label: 'Private',
		value: 'private',
		icon: <EyeOff size={22} />,
		text: 'Saved to your account, accessible through direct link only.',
		className: 'text-warm-green'
	}
] as const;

type Props = {
	visibility: TalentForm['visibility'];
	setVisibility: (value: TalentForm['visibility']) => void;
};

export const VisibilityInput = ({ visibility, setVisibility }: Props) => {
	const session = useSession().data;
	return (
		<div className="grid grid-cols-[auto_1fr] items-center">
			<p className="col-span-2 mb-2">Visibility</p>

			{Options.map((o, i) => {
				const active = visibility === o.value;
				return (
					<Fragment key={o.value}>
						<TextButton
							icon={<Checkbox checked={active} />}
							onClick={() => setVisibility(o.value)}
							disabled={i !== 0 && !session}
						>
							<div className={`flex items-center gap-1 pl-2 ${o.className}`}>
								{o.icon}
								{o.label}
							</div>
						</TextButton>
						<span className="text-blue-gray my-1 shrink grow text-sm">
							{o.text}
						</span>
					</Fragment>
				);
			})}

			{!session && (
				<p className="text-yellow col-span-2 m-2">
					<AlertTriangle className="mr-1 inline-block" />
					Sign in to save trees online and share them with others.
				</p>
			)}
		</div>
	);
};

export default VisibilityInput;
