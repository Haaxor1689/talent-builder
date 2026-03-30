import { ScrollArea as Base } from '@base-ui/react/scroll-area';
import cls from 'classnames';

type Props = {
	ref?: React.RefObject<HTMLDivElement | null>;
	containerClassName?: string;
	contentClassName?: string;
	children: React.ReactNode;
};

const Scrollbar = (props: { orientation: 'vertical' | 'horizontal' }) => (
	<Base.Scrollbar orientation={props.orientation} className="group/scrollbar">
		<Base.Thumb
			className={cls(
				'group-hover/scroll:bg-blue-gray/50 group-hover/scrollbar:bg-blue-gray/80 cursor-pointer p-1 transition-colors'
			)}
		/>
	</Base.Scrollbar>
);

const ScrollArea = ({
	ref,
	children,
	containerClassName,
	contentClassName
}: Props) => (
	<Base.Root
		className={cls(
			'group/scroll flex shrink flex-col overflow-hidden',
			containerClassName
		)}
	>
		<Base.Viewport className="shrink grow" ref={ref}>
			<Base.Content className={contentClassName}>{children}</Base.Content>
		</Base.Viewport>
		<Scrollbar orientation="vertical" />
		<Scrollbar orientation="horizontal" />
		<Base.Corner />
	</Base.Root>
);

export default ScrollArea;
