import classNames from 'classnames';
import { Calculator, CloudOff, PlusCircle, Workflow } from 'lucide-react';

import TextButton from '#components/styled/TextButton.tsx';

const actions = [
	{
		title: 'Create a new tree',
		icon: <PlusCircle />,
		href: '/tree/new',
		className: 'text-warm-green'
	},
	{
		title: 'Browse public trees',
		icon: <Workflow />,
		href: '/trees'
	},
	{
		title: 'Create a build',
		icon: <Calculator />,
		href: '/calculator'
	},
	{
		title: 'Manage local trees',
		icon: <CloudOff />,
		href: '/local',
		className: 'text-blue-gray'
	}
];

const MainActions = () => (
	<div className="grid auto-cols-fr items-stretch justify-stretch gap-3 md:grid-flow-col md:gap-5">
		{actions.map(({ title, icon, href, className }) => (
			<div key={title} className="haax-surface-3 flex items-center p-0">
				<TextButton
					icon={icon}
					type="link"
					href={href}
					className={classNames(
						'icon-size-8 items-center gap-2 p-5 text-2xl md:max-w-42 md:flex-col md:gap-1 md:text-center',
						className
					)}
				>
					{title}
				</TextButton>
			</div>
		))}
	</div>
);

export default MainActions;
