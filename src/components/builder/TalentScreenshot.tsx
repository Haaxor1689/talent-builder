import { useRef } from 'react';
import { useWatch } from 'react-hook-form';
import { Camera } from 'lucide-react';

import Dialog, { closeDialog } from '#components/styled/Dialog.tsx';
import SpellIcon from '#components/styled/SpellIcon.tsx';
import { TalentDescription } from '#components/styled/TalentDescription.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import { elementToPng } from '#utils/index.ts';

const TalentScreenshot = ({ selected }: { selected: number }) => {
	const ref = useRef<HTMLDivElement>(null);

	const item = useWatch({ name: `talents.${selected}` });

	return (
		<Dialog
			unstyled
			trigger={open => (
				<TextButton icon={<Camera />} title="Screenshot" onClick={open} />
			)}
		>
			<div className="flex flex-col items-center gap-4">
				<TextButton
					icon={<Camera />}
					onClick={async e => {
						if (!ref.current) return;
						await elementToPng(ref.current, item.name);
						closeDialog(e);
					}}
				>
					Save screenshot
				</TextButton>
				<div ref={ref} className="flex items-start gap-2">
					<SpellIcon icon={item.icon} showDefault />
					<div className="haax-surface-3 pointer-events-none z-10 max-w-100 min-w-62.5">
						<h4 className="haax-color">{item.name ?? '[Empty talent]'}</h4>
						<TalentDescription field={item} />
					</div>
				</div>
			</div>
		</Dialog>
	);
};

export default TalentScreenshot;
