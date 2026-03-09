import classNames from 'classnames';
import { Calculator, CloudOff, PlusCircle, Workflow } from 'lucide-react';

import TextButton from '#components/styled/TextButton.tsx';

const actions = [
	{
		title: 'Create a new tree',
		icon: PlusCircle,
		href: '/tree/new',
		className: 'text-warm-green'
	},
	{
		title: 'Browse public trees',
		icon: Workflow,
		href: '/trees'
	},
	{
		title: 'Create a build',
		icon: Calculator,
		href: '/calculator'
	},
	{
		title: 'Manage local trees',
		icon: CloudOff,
		href: '/local',
		className: 'text-blue-gray'
	}
];

const MainActions = () => (
	<div className="grid auto-cols-fr items-stretch justify-stretch gap-3 md:grid-flow-col md:gap-5">
		{actions.map(({ title, icon: Icon, href, className }) => (
			<div key={title} className="haax-surface-3 flex items-center p-0">
				<TextButton
					type="link"
					href={href}
					className={classNames('p-5! **:shrink', className)}
				>
					<div className="flex items-center gap-2 text-inherit md:max-w-35 md:flex-col md:gap-1">
						<Icon size={32} className="shrink-0!" />
						<p className="shrink truncate text-2xl whitespace-normal text-inherit md:text-center">
							{title}
						</p>
					</div>
				</TextButton>
			</div>
		))}
	</div>
);

export default MainActions;
