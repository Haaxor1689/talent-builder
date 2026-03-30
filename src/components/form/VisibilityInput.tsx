import cls from 'classnames';
import { AlertTriangle, CloudOff, Eye, EyeOff } from 'lucide-react';
import { Fragment } from 'react';

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
		text: 'Saved to your account, publicly visible when searching.',
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

type Props = { disabled?: boolean } & (
	| {
			visibility: TalentForm['visibility'];
			setVisibility: (value: TalentForm['visibility']) => void;
			noLocal?: false;
	  }
	| {
			visibility: Exclude<TalentForm['visibility'], null>;
			setVisibility: (value: Exclude<TalentForm['visibility'], null>) => void;
			noLocal: true;
	  }
);

const VisibilityInput = ({
	visibility,
	setVisibility,
	noLocal,
	disabled
}: Props) => {
	const session = useSession().data;
	return (
		<div className="grid grid-cols-[auto_1fr] items-center">
			<p className="col-span-2">Visibility:</p>

			{Options.map((o, i) => {
				if (noLocal && o.value === null) return null;
				const active = visibility === o.value;
				return (
					<Fragment key={o.value}>
						<TextButton
							icon={<Checkbox checked={active} />}
							onClick={() => setVisibility(o.value as never)}
							disabled={!!disabled || (i !== 0 && !session)}
						>
							<div
								className={cls(
									'flex items-center gap-1 pl-2',
									disabled ? 'text-blue-gray' : o.className
								)}
							>
								{o.icon}
								{o.label}
							</div>
						</TextButton>
						<span className="my-1 shrink grow text-sm text-blue-gray">
							{o.text}
						</span>
					</Fragment>
				);
			})}

			{!noLocal && !session && (
				<p className="col-span-2 mt-1 text-yellow">
					<AlertTriangle className="mr-1 inline-block" />
					Sign in to save online and share with others.
				</p>
			)}
		</div>
	);
};

export default VisibilityInput;
